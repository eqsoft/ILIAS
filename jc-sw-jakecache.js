const CacheStatus = {
    UNCACHED: 0,
    IDLE: 1,
    CHECKING: 2,
    DOWNLOADING: 3,
    UPDATEREADY: 4,
    OBSOLETE: 5
}

class JakeCacheManifest {
  constructor (path, clientId) { // support multiple caches: always construct with path
    // if cache already exists only explicit update with reload 
    this._path = path
    this._key = encodeURIComponent(path)
    this.clientId = clientId
    this.config = storage.config
    this.dataExists = storage.manifests.hasOwnProperty(this._key)
    this.uncached = true
    // check data and associated cache exists
    if (this.dataExists) {
      debug('manifest data exists in indexeddb')
      this._rawData = storage.manifests[this._key]
    }
    else {
      debug('manifest data not exists in indexeddb')
      this._rawData = {
        hash: null,
        cache: [],
        fallback: [],
        network: []
      }
    }
    this._hash = this._rawData.hash
    this._isValid = false
    this._fetchOptions = { credentials: "same-origin" }
    this.cacheStatus = CacheStatus.UNCACHED
  }
  
  /**
   * check if data and associated caches exists
   * ToDo: handle inconsistent data integrity by rejecting?
   */
  checkCache () {
    return caches.has(this._key).then( (hasCache) => {
      if (hasCache) {
        debug('cache exists: ' + this._path)
        this.uncached = false
      }
      else {
        debug('cache not exists: ' + this._path)
        this.uncached = true
      }
      return Promise.resolve(this.uncached)
    })
  }
  
  // encapsulate update function in object itself
  update (reload) {
    debug('update cache object: ' + this._path)
    return this.checkCache().then( (uncached) => {
      return Promise.resolve(uncached)
    }).catch( err => { // catch inconsistent data and cache status?
      error(err)
      return Promise.resolve(uncached)
    }).then((uncached) => {
      if (!reload && !uncached) {
        debug('We have a cache and we are not doing an update check.')
        this.post({ type: 'noupdate' })
        return Promise.reject()
      }
      if (this.cacheStatus === CacheStatus.CHECKING) {
        debug('CHECKING...')
        this.post({ type: 'checking' })
        this.post({ type: 'abort' })
        return Promise.reject()
      }
      if (this.cacheStatus === CacheStatus.DOWNLOADING) {
        debug('DOWNLOADING...')
        this.post({ type: 'checking' })
        this.post({ type: 'downloading' })
        this.post({ type: 'abort' })
        return Promise.reject()
      }
      return Promise.resolve()
    }).then(() => {
      debug('CHECKING...')
      this.cacheStatus = CacheStatus.CHECKING
      this.post({ type: 'checking' })
      return this.fetchManifest(this._path, reload).catch(err => {
        cacheStatus = CacheStatus.OBSOLETE
        this.post({ type: 'obsolete' })
        // FIXME: *.7: Error for each existing entry.
        this.cacheStatus = CacheStatus.IDLE
        this.post({ type: 'idle' })
        return Promise.reject(err)
      })
    }).then(modified => {
      debug("modified: " + modified)
      this.modified = modified
      return Promise.resolve(this.dataExists) // ok?
    }).then(upgrade => {
        debug("upgrade")
        this.upgrade = upgrade
        if (this.upgrade && !this.modified) {
          this.cacheStatus = CacheStatus.IDLE
          this.post({ type: 'noupdate' })
          return Promise.reject()
        }
        
        // Appcache is no-cors by default.
        this.requests = this._rawData.cache.map(url => {
          return new Request(url, { mode: 'no-cors' })
        })
        
        this.cacheStatus = CacheStatus.DOWNLOADING
        this.post({ type: 'downloading' })

        this.loaded = 0
        this.total = this.requests.length

        return Promise.all(this.requests.map(request => {
          // Manual fetch to emulate appcache behavior.
          return fetch(request, this._fetchOptions).then(response => {
            this.cacheStatus = CacheStatus.PROGRESS
            this.post({
              type: 'progress',
              lengthComputable: true,
              loaded: ++(this.loaded),
              total: this.total
            })

            // section 5.6.4 of http://www.w3.org/TR/2011/WD-html5-20110525/offline.html

            // Redirects are fatal.
            if (response.url !== request.url) {
              throw Error()
            }

            // FIXME: should we update this.total below?
            if (response.type !== 'opaque') {
              // If the error was a 404 or 410 HTTP response or equivalent
              // Skip this resource. It is dropped from the cache.
              if (response.status < 200 || response.status >= 300) {
                return undefined
              }

              // HTTP caching rules, such as Cache-Control: no-store, are ignored.
              if ((response.headers.get('cache-control') || '').match(/no-store/i)) {
                return undefined
              }
            }

            return response
          })
        }))
      }).then(responses => {
        this.responses = responses.filter(response => response)
        if (this.upgrade) {
          this.cacheStatus = CacheStatus.UPDATEREADY
          this.post({ type: 'updateready' })
          return Promise.reject()
        } else {
          return Promise.resolve(this.responses)
        }
      }).then(responses => {
        debug('Adding to cache ' + this._path)
        return caches.open(this._key).then(cache => {
          return Promise.all(responses.map((response, index) => {
            return cache.put(this.requests[index], response)
          }))
        }).then(_ => {
          this.cacheStatus = CacheStatus.CACHED
          this.post({ type: 'cached' })
          //return Promise.resolve()
        })
      }).catch(err => {
        if (err) {
          this.post({ type: 'error' }, err)
          debug(err)
          //return Promise.reject()
        }
      })
  }
  
  swapCache () {
    // not implemented
    debug('swapCache not implemented')
  }
  
  /**
   * fetches the appache manifest and add the entry arrays as object to ReducedManifests stored in the indexeddb
   */  
  fetchManifest (path, reload) {
    this._path = path
    if (reload) { // don't forget to save on success or reloading from storage if failed
      debug('reloading manifest...')
      this._rawData = {
        hash: null,
        cache: [],
        fallback: [],
        network: []
      }
    }
    if (this._isValid && !reload) {
      return Promise.resolve(false) // not modified check
    }
    // http://html5doctor.com/go-offline-with-application-cache/
    let cacheOption = (reload) ? 'reload' : 'default'
    let _requestOptions = { cache: cacheOption }
    return fetch(new Request(this._path, _requestOptions), this._fetchOptions).then((response) => {
      if (response.type === 'opaque' || response.status === 404 || response.status === 410) {
        return Promise.reject()
      }
      
      return response.text().then((result) => {
        return new Promise((resolve, reject) => {
          let hash = md5(result)
          if (this._hash && hash.toString() === this._hash.toString()) {
            debug('noupdate: ' + hash)
            return resolve(false)
          }
          this._hash = hash
          debug(`update: ${hash} (was: ${this._hash})`)

          let lines = result.split(/\r|\n/)
          
          let header = 'cache' // default.

          let firstLine = lines.shift()
          if (firstLine !== 'CACHE MANIFEST') {
            return reject('invalid cache manifest')
          }
  
          for (let line of lines) {
            line = line.replace(/#.*$/, '').trim()
            if (line === '') {
              continue
            }

            let res = line.match(/^([A-Z]*):/)
            if (res) {
              header = res[1].toLowerCase()
              continue
            }

            if (!this._rawData[header]) {
              this._rawData[header] = []
            }
            this._rawData[header].push(line)
          }
          
          this.cache = ['jakecache.js']
          
          // special switch: if valid manifest with empty cache entries and reload then purge cache and storage 
          if (this._rawData.cache.length < 1 && reload && this.config.deleteCacheOnEmptyEntries) {
            debug('special purgeCache on empty cache entries: ' + this._key)
            this._isValid = true
            return purgeCache(this._key).then( () => {
              return resolve(true)
            })
          }
          
          // Ignore different protocol
          for (let pathname of this._rawData.cache) {
            let _path = new URL(pathname, location)
            if (_path.protocol === location.protocol) {
              this.cache.push(_path)
            }
          }

          this.fallback = []
          for (let entry of this._rawData.fallback) {
            let [pathname, fallbackPath] = entry.split(' ')
            let _path = new URL(pathname, location)
            let fallback = new URL(fallbackPath, location)

            // Ignore cross-origin fallbacks
            if (_path.origin === fallback.origin) {
              this.fallback.push([_path, fallback])
              this.cache.push(fallback)
            }
          }

          this.allowNetworkFallback = false
          this.network = []
          for (let entry of this._rawData.network) {
            if (entry === '*') {
              this.allowNetworkFallback = true
              continue
            }
            let _path = new URL(entry, location)
            if (_path.protocol === location.protocol) {
              this.network.push(_path)
            }
          }
          debug('cache entries: ' + this._rawData.cache.length)
          this._rawData.hash = this._hash
          this.addManifest(this._key, this._rawData).then( (result) => {
            debug("addManifest successful")
            this._isValid = true
            resolve(true)
          }).catch( err => {
            this._isValid = false
            error(err)
            reject(err)
          })
        })
      })
    })
  }
  
  addManifest (key, rawData) {
    storage.manifests[key] = rawData
    return flush('manifests')
  }
  /**
   * calls postMessage with cache path param
   */ 
  post (msg) {
    postMessage(msg, this._path, this.clientId)
  }
}
