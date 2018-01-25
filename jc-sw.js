/**
 * the most important thing to do is controlling the live cycle of this worker!
 * 
 * there are two different client page types:
 * 
 * 1. pages which are modifying and handling the serviceworker and caches itself: we need a complete initialzed serviceworker with all stored and constructed live objects
 * 
 * 2. pages in in the scope of the sw registration which only fetches requests: we just need an initialized object with distinct manifest role entries for network and fallback handling  
 * 
 * for both types we need a config object
 * 
 */

importScripts('jc-sw-storage.js', 'jc-sw-manifest.js', 'jc-sw-wildcard.js')

/**
 * JakeCacheManifest objecs are created at init runtime based on clientId
 */ 
self.JakeCacheManifests = {}

/**
 * init for lifecycle control
 */ 
self.init = event => {
  let path = event.data.path
  let clientId = event.source.id // event.source.id = WindowClient.id=clientId
  if (!path) {
    return Promise.reject('no path, aborting message...')
  }
  if (!clientId) {
    return Promise.reject('no clientId, aborting message...')
  }
  return loadAll().then( () => {
    return initJakeCacheManifest(path, clientId)
  })
}

self.initJakeCacheManifest = (path, clientId) => {
  if (JakeCacheManifests.hasOwnProperty(clientId)) {
    debug('JakeCacheManifest already exists for client: ' + clientId)
    return Promise.resolve(JakeCacheManifests[clientId])
  }
  else {
    debug('create JakeCacheManifest for client: ' + clientId)
    return createJakeCacheManifestObject(path, clientId)
  }
}

/**
 * creates a JakeCacheManifest object from path and clientId
 */ 
self.createJakeCacheManifestObject = (path, clientId) => {
  // remove unused client objects
  return Promise.all(Object.keys(JakeCacheManifests).map( key => {
    return clients.get(key).then( (client) => {
      if (!client) {
        debug('delete inactive client: ' + key)
        JakeCacheManifests[key] = null
        delete JakeCacheManifests[key]
      }
      return Promise.resolve() 
    })
  })).then( () => {
    let jc = new JakeCacheManifest(path, clientId)
    JakeCacheManifests[clientId] = jc
    debug("JakeCacheManifests: " + Object.keys(JakeCacheManifests).length)
    return Promise.resolve(jc)
  })
}

/**
 * EventListener
 */ 
 
self.addEventListener('install', event => {
    debug('install')
    event.waitUntil(initStorage()) // self.skipWaiting()
})

self.addEventListener('activate', event => {
  debug('activate')
  event.waitUntil(self.clients.claim())
})

/**
 * the fetch event does not require a full initialized sw
 * at least the config should be loaded and if fetchMode = FetchMode.FULL also the storage.rules must be loaded 
 * initFetch is only called for the first fetch in the sw lifecycle, assuming no performace drawbacks, hope so...
 */
 
self.addEventListener('fetch', event => {
  // Ignore non-GET and different schemes.
  let url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.scheme !== location.scheme) {
    return
  }
  
  event.respondWith(
    initFetch().then( () => {
      if (storage.config.fetchMode === FetchMode.SIMPLE) {
        return caches.match(event.request).then( response => {
          if (response) { // caches always wins
            debug("fetch from cache: " + event.request.url)
            return response
          }
          else {
            return fetch(event.request) 
          }
        })
      }
      else { // FetchMode.FULL is more sophisticated: AppCache rules NETWORK and FALLBACK are proceeded
        // explicit NETWORK rules MUST be fetched online, even in offline mode!
        if (storage.rules.networkrules.filter(entry => (entry && entry !== "*" && wildcardRegExp(entry).test(url.href))).length) {
          debug("NETWORK only: " + url.href)
          return fetch(event.request)
        }
        return caches.match(event.request).then( response => {
          for (let [path, fallback] of storage.rules.fallbackrules) {
            if (path && wildcardRegExp(path).test(url.href)) {
              return fetch(event.request).then(response => {
                // Same origin only.
                if (new URL(response.url).origin !== location.origin) {
                    throw Error()
                }
                if (response.type !== 'opaque') {
                        if (response.status < 200 || response.status >= 300) {
                            throw Error()
                    }
                }
              }).catch( () => {
                debug('FALLBACK: ' + fallback)
                return caches.match(fallback)
              })
            }
          }
          return fetch(event.request)
        })
      }
    })
  )
})  

/**
 * we assume that pages which are sending messages
 * needs a fully initialized sw and a JakeCacheManifest object
 */ 
self.addEventListener('message', event => {
  init(event).then( jc => {
    switch (event.data.command) {
      case 'activated':
        activated.call(this, event, jc)
        break
      case 'initialize':
        initialize.call(this, event, jc)
        break
      case 'update':
        update.call(this, event, jc)
        break
      case 'abort':
        postMessage({ type: 'error', message: 'Not implementable without cancellable promises.' })
        break
      case 'swapCache':
        swapCache.call(this, event, jc)
        break
    }
  }).catch( err => {
    debug('init failed: ' + err)
  })
})

/**
 * activated message from WindowClient which registered the sw.
 * required for storing a custom config from client side
 */  
self.activated = (event, jc) => {
  debug('activated ')
  // get config and store in indexeddb
  let config = JSON.parse(event.data.config)
  save('config', config).then( () => {
    jc.update().then( res => {
      debug('jakecache object updated')
    }).catch (err => {
      debug(err)
    })
  })
}

self.update = (event, jc) => {
  debug('update')
  let reload = event.data.reload 
  jc.update(reload).then( res => {
    debug('jakecache object updated')
  }).catch ( err => {
    debug(err)
  })
}

/**
 * binding to special window clients might be better then broadcasting to all clients with manifest path param?
 */ 
function postMessage (msg, path, clientId) {
  if (clientId) {
    return self.clients.get(clientId).then(client => {
      msg['path'] = path // still needed?
      return client.postMessage(msg)
    })
  }
  else { // broadcast to all
    return self.clients.matchAll().then(clients => {
      return Promise.all(clients.map(client => {
        msg['path'] = path
        return client.postMessage(msg)
      }))
    })
  }
}

function swapCache (event) { // ToDo: support multiple caches
  debug('swapCache is not conceptual implemented yet!')
}

self.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/* for better tracking of serviceworkers logs */
let debug = msg => {
  if (storage.config.debug) {
    console.log('%c' + msg, 'color: ' + storage.config.consoleSWColor)
  }
}
let log = msg => console.log('%c' + msg, 'color: ' + storage.config.consoleSWColor)
let error = err => console.error(err)
let dir = obj => console.dir(obj)
