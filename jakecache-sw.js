'use strict';

/**
 * https://github.com/jakearchibald/idb-keyval
 */ 
!function(){"use strict";function e(){return t||(t=new Promise(function(e,n){var t=indexedDB.open("keyval-store",1);t.onerror=function(){n(t.error)},t.onupgradeneeded=function(){t.result.createObjectStore("keyval")},t.onsuccess=function(){e(t.result)}})),t}function n(n,t){return e().then(function(e){return new Promise(function(r,o){var u=e.transaction("keyval",n);u.oncomplete=function(){r()},u.onerror=function(){o(u.error)},t(u.objectStore("keyval"))})})}var t,r={get:function(e){var t;return n("readonly",function(n){t=n.get(e)}).then(function(){return t.result})},set:function(e,t){return n("readwrite",function(n){n.put(t,e)})},"delete":function(e){return n("readwrite",function(n){n["delete"](e)})},clear:function(){return n("readwrite",function(e){e.clear()})},keys:function(){var e=[];return n("readonly",function(n){(n.openKeyCursor||n.openCursor).call(n).onsuccess=function(){this.result&&(e.push(this.result.key),this.result["continue"]())}}).then(function(){return e})}};"undefined"!=typeof module&&module.exports?module.exports=r:"function"==typeof define&&define.amd?define("idbKeyval",[],function(){return r}):self.idbKeyval=r}();

/*
* es6-md5
* Port of https://github.com/blueimp/JavaScript-MD5 to ES2015
*
* Copyright 2011, Sebastian Tschan
* https://blueimp.net
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/MIT
*
* Based on
* A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
* Digest Algorithm, as defined in RFC 1321.
* Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
* Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
* Distributed under the BSD License
* See http://pajhome.org.uk/crypt/md5 for more info.
*/

/*
* Add integers, wrapping at 2^32. This uses 16-bit operations internally
* to work around bugs in some JS interpreters.
*/
function safe_add (x, y) {
  const lsw = (x & 0xFFFF) + (y & 0xFFFF);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF)
}

/*
* Bitwise rotate a 32-bit number to the left.
*/
function bit_rol (num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt))
}

/*
* These functions implement the four basic operations the algorithm uses.
*/
function md5_cmn (q, a, b, x, s, t) {
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
}
function md5_ff (a, b, c, d, x, s, t) {
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
}
function md5_gg (a, b, c, d, x, s, t) {
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
}
function md5_hh (a, b, c, d, x, s, t) {
  return md5_cmn(b ^ c ^ d, a, b, x, s, t)
}
function md5_ii (a, b, c, d, x, s, t) {
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
}

/*
* Calculate the MD5 of an array of little-endian words, and a bit length.
*/
function binl_md5 (x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << (len % 32)
  x[(((len + 64) >>> 9) << 4) + 14] = len

  let i;
  let olda;
  let oldb;
  let oldc;
  let oldd;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (i = 0; i < x.length; i += 16) {
  olda = a
  oldb = b
  oldc = c
  oldd = d

  a = md5_ff(a, b, c, d, x[i], 7, -680876936)
  d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
  c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
  b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
  a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
  d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
  c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
  b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
  a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
  d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
  c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
  b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
  a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
  d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
  c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
  b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

  a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
  d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
  c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
  b = md5_gg(b, c, d, a, x[i], 20, -373897302)
  a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
  d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
  c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
  b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
  a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
  d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
  c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
  b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
  a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
  d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
  c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
  b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

  a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
  d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
  c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
  b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
  a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
  d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
  c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
  b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
  a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
  d = md5_hh(d, a, b, c, x[i], 11, -358537222)
  c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
  b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
  a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
  d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
  c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
  b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

  a = md5_ii(a, b, c, d, x[i], 6, -198630844)
  d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
  c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
  b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
  a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
  d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
  c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
  b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
  a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
  d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
  c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
  b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
  a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
  d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
  c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
  b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

  a = safe_add(a, olda)
  b = safe_add(b, oldb)
  c = safe_add(c, oldc)
  d = safe_add(d, oldd)
  }
  return [a, b, c, d]
}

/*
* Convert an array of little-endian words to a string
*/
function binl2rstr (input) {
  let i;
  let output = '';
  for (i = 0; i < input.length * 32; i += 8) {
  output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
  }
  return output
}

/*
* Convert a raw string to an array of little-endian words
* Characters >255 have their high-byte silently ignored.
*/
function rstr2binl (input) {
  let i;
  const output = [];
  output[(input.length >> 2) - 1] = undefined
  for (i = 0; i < output.length; i += 1) {
  output[i] = 0
  }
  for (i = 0; i < input.length * 8; i += 8) {
  output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
  }
  return output
}

/*
* Calculate the MD5 of a raw string
*/
function rstr_md5 (s) {
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8))
}

/*
* Calculate the HMAC-MD5, of a key and some data (raw strings)
*/
function rstr_hmac_md5 (key, data) {
  let i;
  let bkey = rstr2binl(key);
  const ipad = [];
  const opad = [];
  let hash;
  ipad[15] = opad[15] = undefined
  if (bkey.length > 16) {
  bkey = binl_md5(bkey, key.length * 8)
  }
  for (i = 0; i < 16; i += 1) {
  ipad[i] = bkey[i] ^ 0x36363636
  opad[i] = bkey[i] ^ 0x5C5C5C5C
  }
  hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128))
}

/*
* Convert a raw string to a hex string
*/
function rstr2hex (input) {
  const hex_tab = '0123456789abcdef';
  let output = '';
  let x;
  let i;
  for (i = 0; i < input.length; i += 1) {
  x = input.charCodeAt(i)
  output += hex_tab.charAt((x >>> 4) & 0x0F) +
  hex_tab.charAt(x & 0x0F)
  }
  return output
}

/*
* Encode a string as utf-8
*/
function str2rstr_utf8 (input) {
  return unescape(encodeURIComponent(input))
}

/*
* Take string arguments and return either raw or hex encoded strings
*/
function raw_md5 (s) {
  return rstr_md5(str2rstr_utf8(s))
}
function hex_md5 (s) {
  return rstr2hex(raw_md5(s))
}
function raw_hmac_md5 (k, d) {
  return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))
}
function hex_hmac_md5 (k, d) {
  return rstr2hex(raw_hmac_md5(k, d))
}

function md5 (string, key, raw) {
  if (!key) {
  if (!raw) {
    return hex_md5(string)
  }
  return raw_md5(string)
  }
  if (!raw) {
  return hex_hmac_md5(key, string)
  }
  return raw_hmac_md5(key, string)
}

/**********************************************************************/
  
// storage key of ReducedManifests
const _storeId = md5('jakecache_'+self.registration.scope)

const ADD_TEST_CACHES = false // just for testing multiple caches with hard coded items

const CacheStatus = {
    UNCACHED: 0,
    IDLE: 1,
    CHECKING: 2,
    DOWNLOADING: 3,
    UPDATEREADY: 4,
    OBSOLETE: 5
}
/**
 * All fetched appcache manifests are reduced to single objects and stored in ReducedManifests indexeddb object
 */ 
let ReducedManifests = {}

/**
 * JakeCacheManifest objecs are created at init runtime based on stored ReducedManifests 
 */ 
let JakeCacheManifests = {}


/**
 * JakeCache objects 
 */ 
class JakeCacheManifest {
  
  
  constructor (path, clientId) { // support multiple caches: always construct with path
    // if cache already exists only explicit update with reload 
    this._path = path
    this._key = encodeURIComponent(path)
    this.clientId = clientId
    this.dataExists = ReducedManifests.hasOwnProperty(this._key)
    this.uncached = true
    // check data and associated cache exists
    if (this.dataExists) {
      log('manifest data exists in indexeddb')
      this._rawData = ReducedManifests[this._key]
    }
    else {
      log('manifest data not exists in indexeddb')
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
   * the master should be ReducedManifest object in indexeddb
   */
  checkCache () {
    return caches.has(this._key).then( (hasCache) => {
      if (hasCache) {
        log('cache exists: ' + this._path)
        this.uncached = false
      }
      else {
        log('cache not exists: ' + this._path)
        this.uncached = true
      }
      return Promise.resolve(this.uncached)
    })
  }
  
  // encapsulate update function in object itself
  update (reload) {
    log('update cache object: ' + this._path)
    return this.checkCache().then( (uncached) => {
      return Promise.resolve(uncached)
    }).catch( err => { // catch inconsistent data and cache status?
      error(err)
      return Promise.resolve(uncached)
    }).then((uncached) => {
      if (!reload && !uncached) {
        log('We have a cache and we are not doing an update check.')
        this.post({ type: 'noupdate' })
        return Promise.reject()
      }
      if (this.cacheStatus === CacheStatus.CHECKING) {
        log('CHECKING...')
        this.post({ type: 'checking' })
        this.post({ type: 'abort' })
        return Promise.reject()
      }
      if (this.cacheStatus === CacheStatus.DOWNLOADING) {
        log('DOWNLOADING...')
        this.post({ type: 'checking' })
        this.post({ type: 'downloading' })
        this.post({ type: 'abort' })
        return Promise.reject()
      }
      return Promise.resolve()
    }).then(() => {
      log('CHECKING...')
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
      log("modified: " + modified)
      this.modified = modified
      return Promise.resolve(this.dataExists) // ok?
    }).then(upgrade => {
        log("upgrade")
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
        log('Adding to cache ' + this._path)
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
          log(err)
          //return Promise.reject()
        }
      })
  }
  
  swapCache () {
    // not implemented
    log('swapCache')
  }
  
  /**
   * fetches the appache manifest and add the entry arrays as object to ReducedManifests stored in the indexeddb
   */  
  fetchManifest (path, reload) {
    this._path = path
    if (reload) { // don't forget to save on success or reloading from storage if failed
      log('reloading manifest...')
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
            log('noupdate: ' + hash)
            return resolve(false)
          }
          this._hash = hash
          log(`update: ${hash} (was: ${this._hash})`)

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

          if (this._rawData.cache.length < 1 && reload) {
            log('special purgeCache on empty cache entries')
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
          log('cache entries: ' + this._rawData.cache.length)
          this._rawData.hash = this._hash
          addReducedManifest(this._key, this._rawData).then( (result) => {
            log("addReducedManifest successful")
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
  
  /**
   * calls postMessage with cache path param
   */ 
  post (msg) {
    postMessage(msg, this._path, this.clientId)
  }
}

/**
 * EventListener
 */ 

self.addEventListener('install', event => {
  if (!ADD_TEST_CACHES) {
    log('install')
    event.waitUntil(self.skipWaiting())
  }
  else {// just for testing multiple caches with static items
    log('try to install...')
    event.waitUntil(
      Promise.all(['A','B'].map(v => {
        return caches.open(`path${v}`).then(cache => {
          return cache.addAll(
            [
              `./page${v}1.html`,
              `./page${v}2.html`
            ]
          ).then( () => {
            return Promise.resolve()
          }).catch( err => {
              return Promise.reject(err)
            }
          )
        })
      })).then( () => {
        log('installation of service worker with test caches successfull.')
        return Promise.resolve()
      }).catch( err => {
        log('installation of service worker aborted!')
        return Promise.reject(err)
      })
    )
  }
})

self.addEventListener('activate', function (event) {
  log('activate')
  event.waitUntil(self.clients.claim())
})

// a simple cache first and fallback to network
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) { 
        console.log("fetch from cache: " + event.request.url)
        return response
      }
      else {
	      //console.log("fetch from network: " + event.request.url)
        return fetch(event.request)
      }
    }).catch(err => {
        console.log("request error: " + err)
        return Promise.reject(err)
      })
    )
})

self.addEventListener('message', function (event) {
  //log('message: ' + event.data.command)
  switch (event.data.command) {
    case 'initialize':
      initialize.call(this, event)
      break
    case 'update':
      update.call(this, event)
      break
    case 'abort':
      postMessage({ type: 'error', message: 'Not implementable without cancellable promises.' })
      break
    case 'swapCache':
      swapCache.call(this,event)
      break
  }
})


/**
 * initial reading of serviceworker storage
 * creates JakeCacheManifest objects initial or from storage
 * updates cache objects
 */
  
let initialize = (event) => {
  log('initialize')
  let path = event.data.path
  let keepCache = event.data.keepcache
  let clientId = event.source.id // event.source.id = WindowClient.id=clientId
  if (!clientId) {
    error('no clientId?')
  }
  else {
    log('clientId: ' + clientId)
  }
  if (!keepCache) { // remove total cache and reset object storage
    purgeCache().then( () => {
      initStorage(path, clientId).then((result) => {
        log(result)
      })
    })
  }
  else { // don't remove cache and object storage
    initStorage(path, clientId).then((result) => {
      log(result)
    })
  }
}

let update = (event) => {
  log('update')
  let path = event.data.path
  let reload = event.data.reload
  let clientId = event.source.id // event.source.id = WindowClient.id=clientId
  if (!clientId) {
    error('no clientId?')
  }
  else {
    log('clientId: ' + clientId)
  }
  let jc = JakeCacheManifests[clientId]
  if (jc) {
    jc.update(reload)
  }
  else {
    error('could not get JakeCacheManifest: ' + clientId)
  }
}
/**
 * initializes ManifestStorage and creates initial JakeCacheManifest object with given path
 */
let initStorage = (path, clientId) => {
  return initManifestStorage().then((result) => {
    log(result)
    if (path) { // create a new JakeCacheManifestObject and reload the manifest for updating  
      return createJakeCacheManifestObject(path, clientId).then( (cacheObject) => {
        return cacheObject.update().then( () => {
          return Promise.resolve('init storage wth initial manifest path successful')
        }).catch( () => {
          return Promise.resolve()
        })
      })
    }
    else { // not implmented
      return Promise.resolve('init storage wthout initial manifest path successful')
    }
  }).catch( err => {
    error(err)
    return Promise.reject(err)
  })
}

/**
 * reset ManifestStorage and JakeCacheManifests objects
 * ToDo: clean code!
 */ 
let resetStorage = (key=false) => {
  if (!key) {
    return idbKeyval.delete(_storeId).then( deleted => {
      log('deleted idb store ' + _storeId + ' : ' + deleted)
      ReducedManifests = {}
      JakeCacheManifests = {}
      log('reset all ReducedManifests and JakeCacheManifests objects')
      return Promise.resolve()
    }).catch( err => {
      return Promise.reject(err)
    })
  }
  else {
    //log('reset ReducedManifests and JakeCacheManifests object: ' + decodeURIComponent(key))
    return idbKeyval.get(_storeId).then( store => {
      store[key] = null
      delete store[key]
      return idbKeyval.set(_storeId, store).then( () => {
        log('deleted :' + decodeURIComponent(key))
        log('upgraded idb store ' + _storeId)
        return Promise.resolve()
      })
    })
  }
}

/**
 * All fetched manifests are reduced to single objects and stored in one object in the indexeddb
 * with key = "jakecache_"+md5(registration.scope) and retrieved as a whole object: ReducedManifests
 * Each manfest entry should have an associated CacheStorage entry with the manifest path as key
 * From ReducedManifests single JakeCacheManfest ojects are created and stored in JakeCacheManifests object
 * The JakeCacheManifest objects are binded to the EventListener in the jakecache.js clients 
 */ 
let initManifestStorage = () => {
  log('initManifestStorage')
  return idbKeyval.get(_storeId).then( store => {
    if (store !== undefined) {
      ReducedManifests = store
      return Promise.resolve('storage found: ' + _storeId + ' with ' + Object.keys(ReducedManifests).length + ' objects')
    }
    else {
      return Promise.reject('store not exists')
    }
  }).catch( err => {
    log(err)
    log('try to create store...')
    return idbKeyval.set(_storeId, {}).then( () => {
      ReducedManifests = {}
      return Promise.resolve('idbKeyval empty store created')
    }).catch(err => {
      return Promise.reject('idbKeyval failed!' + err)
    })
  })
}

/**
 * purges cache and resets serviceworker storage and objects
 * ToDo: clean code!
 */
  
let purgeCache = (key=false) => {
  if (!key) {
    return deleteCaches().then( () => {
      return resetStorage().then( () => {
        log('reset object storage successful')
        return Promise.resolve()
      }).catch( err => {
        return Promise.reject(err)
      })
    })
  }
  else {
    return caches.delete(key).then( (del) => {
      return resetStorage(key).then( () => {
        log('reset object storage ' + decodeURIComponent(key) + ' successful')
        return Promise.resolve()
      }).catch( err => {
        return Promise.reject(err)
      })
    }) 
  }
}

let deleteCaches = () => {
  return idbKeyval.get(_storeId).then( store => {
    if (store) { // existing storage?
      return Promise.all(Object.keys(store).map( key => {
        log('delete cache:' + decodeURIComponent(key))
        return caches.delete(key)
      }))
    }
    else {
      log('no store: ' + _storeId)
      return Promise.resolve()
    }
  })
} 

/**
 * creates a JakeCacheManifest object from path and clientId
 */ 
let createJakeCacheManifestObject = (path, clientId) => {
  // remove unused client objects
  return Promise.all(Object.keys(JakeCacheManifests).map( key => {
    return clients.get(key).then( (client) => {
      if (!client) {
        log('delete inactive client: ' + key)
        JakeCacheManifests[key] = null
        delete JakeCacheManifests[key]
      }
      return Promise.resolve() 
    })
  })).then( () => {
     let jc = new JakeCacheManifest(path, clientId)
    JakeCacheManifests[clientId] = jc
    log("JakeCacheManifests: " + Object.keys(JakeCacheManifests).length)
    return Promise.resolve(jc)
  })
}


let addReducedManifest = (key, rawData) => {
  ReducedManifests[key] = rawData
  return idbKeyval.set(_storeId, ReducedManifests)
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
// deprecated: now included in JakeCacheManifest objects
function swapCache (event) { // ToDo: support multiple caches
  caches.keys().then(keyList => {
    return Promise.all(keyList.map(key => {
      return caches.delete(key)
    }))
  }).then(() => {
    // FIXME: Add new keys.
  })
}

/* for better tracking of serviceworkers logs */
let log = msg => console.log('%c' + msg, 'color: #7aa868')
let error = err => console.error(err)
let dir = obj => console.dir(obj)

// ToDo: global config, keepcache concept, cache admin page, som layout usw...


/*

let manifest = new JakeCacheManifest()

const CacheStatus = {
  UNCACHED: 0,
  IDLE: 1,
  CHECKING: 2,
  DOWNLOADING: 3,
  UPDATEREADY: 4,
  OBSOLETE: 5
}

let cacheStatus = CacheStatus.UNCACHED

function postMessage (msg) {
  return self.clients.matchAll().then(clients => {
    return Promise.all(clients.map(client => {
      let cacheGroup = (manifest && manifest.groupName()) ? manifest.groupName() : ""
      msg['cachegroup'] = cacheGroup
      return client.postMessage(msg)
    }))
  })
}

function swapCache () { // ToDo: support multiple caches
  caches.keys().then(keyList => {
    return Promise.all(keyList.map(key => {
      return caches.delete(key)
    }))
  }).then(() => {
    // FIXME: Add new keys.
  })
}

// 7.9.4
function update (path, options = {}) {
  console.log("update: " + path + "\noptions.cache: " + options.cache);
  if (!path) {
    console.log('No path!')
    return Promise.reject()
  }
  // *.2.2
  this.options = options
  this.cacheGroup = path
  manifest._path = path // ToDo: generic multiple cache support in 
  return caches.open(this.cacheGroup).then(cache => {
    return cache.keys().then(cacheNames => {
      this.uncached = !cacheNames.length
      console.log('uncached ' + this.uncached)
      return Promise.resolve(this.uncached)
    }).then((uncached) => {
      if (this.options.cache !== 'reload' && !uncached) {
        // We have a cache and we are no doing an update check.
        postMessage({ type: 'noupdate' })
        return Promise.reject()
      }
      // *.2.4 and *.2.6
      if (cacheStatus === CacheStatus.CHECKING) {
        postMessage({ type: 'checking' })
        postMessage({ type: 'abort' })
        return Promise.reject()
      }
      // *.2.4, *.2.5, *.2.6
      if (cacheStatus === CacheStatus.DOWNLOADING) {
        postMessage({ type: 'checking' })
        postMessage({ type: 'downloading' })
        postMessage({ type: 'abort' })
        return Promise.reject()
      }
      return Promise.resolve()
    }).then(() => {
      // *.2.7 and *.2.8
      cacheStatus = CacheStatus.CHECKING
      postMessage({ type: 'checking' })

      // FIXME: *.6: Fetch manifest, mark obsolete if fails.
      return manifest.fetchData(this.cacheGroup, this.options).catch(err => {
        cacheStatus = CacheStatus.OBSOLETE
        postMessage({ type: 'obsolete' })
        // FIXME: *.7: Error for each existing entry.
        cacheStatus = CacheStatus.IDLE
        postMessage({ type: 'idle' })
        return Promise.reject(err)
      })
    }).then(modified => {
      console.log("modified: " + modified)
      this.modified = modified
      // *.2: If cache group already has an application cache in it, then
      // this is an upgrade attempt. Otherwise, this is a cache attempt.
      return cache.keys().then(cacheNames => {
        return Promise.resolve(!!cacheNames.length)
      })
    }).then(upgrade => {
      console.log("upgrade")
      this.upgrade = upgrade
      if (this.upgrade && !this.modified) {
        cacheStatus = CacheStatus.IDLE
        postMessage({ type: 'noupdate' })
        return Promise.reject()
      }
      
      // Appcache is no-cors by default.
      this.requests = manifest.cache.map(url => {
        return new Request(url, { mode: 'no-cors' })
      })
      
      cacheStatus = CacheStatus.DOWNLOADING
      postMessage({ type: 'downloading' })

      this.loaded = 0
      this.total = this.requests.length

      return Promise.all(this.requests.map(request => {
        // Manual fetch to emulate appcache behavior.
        return fetch(request, manifest._fetchOptions).then(response => {
          cacheStatus = CacheStatus.PROGRESS
          postMessage({
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
        cacheStatus = CacheStatus.UPDATEREADY
        postMessage({ type: 'updateready' })
        return Promise.reject()
      } else {
        return Promise.resolve(this.responses)
      }
    }).then(responses => {
      console.log('Adding to cache ' + manifest.groupName())
      return caches.open(manifest.groupName()).then(cache => {
        return Promise.all(responses.map((response, index) => {
          return cache.put(self.requests[index], response)
        }))
      }).then(_ => {
        cacheStatus = CacheStatus.CACHED
        postMessage({ type: 'cached' })
        //return Promise.resolve()
      })
    }).catch(err => {
      if (err) {
        postMessage({ type: 'error' }, err)
        console.log(err)
        //return Promise.reject()
      }
    })
  }).catch(err => {
    if (err) {
      postMessage({ type: 'error' }, err)
      console.log(err)
    }
  })
}

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

// a simple cache first and fallback to network
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log("fetch from cache: " + event.request.url)
        return response
      }
      else {
        return fetch(event.request)
      }
    })
  )
})
*/
/*
self.addEventListener('fetch', function (event) {
  if (cacheStatus === CacheStatus.UNCACHED) {
    return fetch(event.request)
  }

  let url = new URL(event.request.url)

  // Ignore non-GET and different schemes.
  if (event.request.method !== 'GET' || url.scheme !== location.scheme) {
    return
  }
  console.log('fetch');
  
  // FIXME: Get data from IndexedDB instead.
  event.respondWith(manifest.fetchData('test.manifest').then(_ => {
    // Process network-only.
    if (manifest.network.filter(entry => entry.href === url.href).length) {
      return fetch(event.request)
    }

    return caches.match(event.request).then(response => {
      // Cache always wins.
      if (response) {
        return response
      }

      // Fallbacks consult network, and falls back on failure.
      for (let [path, fallback] of manifest.fallback) {
        if (url.href.indexOf(path) === 0) {
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
          }).catch(_ => {
            return cache.match(fallback)
          })
        }
      }

      if (manifest.allowNetworkFallback) {
        return fetch(event.request)
      }

      return response // failure.
    })
  }))
})
*/ 
