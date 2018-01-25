importScripts('jc-sw-md5.js', 'jc-sw-idb.js')

const idb = idbKeyval

const FetchMode = {
  SIMPLE: 0,
  FULL: 1
}

/**
 * storage handling
 */ 
const _storeId = 'jc_'+self.registration.scope
const _storeConfig = md5(_storeId + "_config")
const _storeManifests = md5(_storeId + "_manifests")
const _storeRules = md5(_storeId + "_rules")

const _storeIds = {
  config : _storeConfig,
  manifests : _storeManifests,
  rules : _storeRules
}

self.storageDefaults = {
  config: {
    autoInit: true,
    fetchMode: FetchMode.FULL,
    consoleColor: '#42e8f4',
    consoleSWColor: '#7aa868',
    deleteCacheOnEmptyEntries: false,
    debug: false
  },
  manifests : {},
  rules : {
    networkrules: [],
    fallbackrules: []
  }
}

self.loaded = {
  config: false,
  manifests: false,
  rules: false,
  all: false,
  fetch : false
}

self.storage = {
  config: storageDefaults.config,
  manifests : storageDefaults.manifests,
  rules : storageDefaults.rules
}

self.initStorage = () => {
  storage = storageDefaults
  return flushAll()
}

self.initFetch = () => {
  if (loaded.fetch || loaded.all) {
    //debug('fetch init already loaded')
    return Promise.resolve()
  }
  else {
    return load('config').then ( () => {
      if (storage.config.fetchMode == FetchMode.FULL) {
        debug('FetchMode.FULL')
        return load('rules').then( () => {
          loaded['fetch'] = true
          return Promise.resolve()
        })
      }
      else {
        debug('FetchMode.SIMPLE')
        loaded['fetch'] = true
        return Promise.resolve()
      }
    })
  }
}

self.load = (store, reload=false) => {
  debug('try loading store: ' + store)
  if (loaded[store] && !reload) {
    debug('already loaded ' + store)
    return Promise.resolve()
  }
  else {
    debug('loading ' + store + ' ...')
    return idb.get(_storeIds[store]).then( data => {
      loaded[store] = true
      if (data === undefined) {
        debug('no data ' + store)
        return Promise.resolve(storageDefaults[store])
      }
      else {
        //debug('data: ' + data)
        storage[store] = data
        return Promise.resolve()
      }
    })
  }
}

self.loadAll = (store, reload=false) => {
  debug('try loading all stores')
  if (loaded['all'] && !reload) {
    debug('already loaded all')
    return Promise.resolve()
  }
  else {
    debug('loading all...')
    return Promise.all(Object.keys(storage).map( store => {
      return load(store, reload)
    })).then( () => {
      debug('all loaded')
      loaded['all'] = true
      return Promise.resolve()
    }).catch( err => {
      debug('error loading: ' + err)
      return Promise.resolve()
    })
  }
}

self.save = (store, data) => {
  let storeId = _storeIds[store]
  let _data = JSON.parse(JSON.stringify(data))
  debug('save: ' + store + ' id: ' + storeId)
  storage[store] = _data
  return idb.set(storeId, _data)
}

self.flush = store => {
  debug('flush: ' + store)
  return save(store, storage[store])
}

self.flushAll = () => {
  debug('flushAll')
  return Promise.all(Object.keys(storage).map( store => {
      return flush(store)
  }))
}

self.remove = store => {
  debug('remove: ' + store)
  delete storage[store]
  return idb.delete(_storeIds[store])
}

self.addRule = key => { // maybe the cache rules could be omitted? Are they really needed for fetching from cache?
  debug('addRule ' + key)
  let manifest = storage.manifests[key]
  Object.keys(manifest).map( rulegroup => {
    debug('rulegroup '+ rulegroup)
    if (Array.isArray(manifest[rulegroup]) && Array.isArray(storage.rules[rulegroup+'rules'])) {
      manifest[rulegroup].map( entry => {
        //debug(entry)
        if (!storage.rules[rulegroup+'rules'].includes(entry)) {
          storage.rules[rulegroup+'rules'].push(entry)
        }
      })
    }
  })
}

self.refreshRules = () => {
  debug('refreshRules')
  // IMPORTANT! ToDo: understand object assigning!!
  storage.rules.networkrules = []
  storage.rules.fallbackrules = []
  
  Object.keys(storage['manifests']).map( key => {
    debug("key: "+key)
    addRule(key)
  })
  return flush('rules')
}

/**
 * adds a manifest to the storage
 */ 
self.addManifest = (key, data) => {
  debug('addManifest')
  storage.manifests[key] = data
  addRule(key)
  return Promise.all(['manifests','rules'].map( store => {
    debug('flushing store...')
    return flush(store)
  }))
}
  

self.deleteManifest = (key) => {
  debug('deleteManifest')
  delete storage.manifests[key]
  return flush('manifests').then( () => {
    return refreshRules()
  })
}

/**
 * purges cache and resets serviceworker storage and objects
 */
  
self.purgeCache = (key=false) => {
  debug('purgeCache')
  if (!key) {
    return deleteCaches().then( () => {
      debug('caches deleted')
      return initStorage()
    })
  }
  else {
    return caches.delete(key).then( res => {
      debug('cache deleted: ' + decodeURIComponent(key) + '\nresult: ' + res)
      return deleteManifest(key)
    })
  }
}

self.deleteCaches = () => {
  return Promise.all(Object.keys(storage.manifests).map( key => {
    debug('delete cache:' + decodeURIComponent(key))
    return caches.delete(key)
  }))
} 


