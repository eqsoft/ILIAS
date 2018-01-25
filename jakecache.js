'use strict';

/** 
 * fetch modes:
 * 0 = SIMPLE = if rquest ressource in cache => fetch from cache otherwise try network
 * 1 = FULL = use AppCache NETWORK and FALLBACK rules
 */  

const FetchMode = {
  SIMPLE: 0,
  FULL: 1
}

// config params can be overidden by global client window/top object
const DefaultJakeCacheConfig = {
  autoInit: true,
  fetchMode: FetchMode.FULL,
  consoleColor: '#42e8f4',
  consoleSWColor: '#7aa868',
  deleteCacheOnEmptyEntries: false,
  debug: false
}

const _eventHandlers = Symbol('eventHandlers')

let CustomEvent = window.CustomEvent
let DOMException = window.DOMException
let ErrorEvent = window.ErrorEvent
let ProgressEvent = window.ProgressEvent

class PolyfilledEventTarget {
  constructor (names) {
    this[_eventHandlers] = {}

    names.map(name => {
      this[_eventHandlers][name] = { handler: null, listeners: [] }
      Object.defineProperty(this, 'on' + name, {
        get: function () {
          return this[_eventHandlers][name]['handler']
        },
        set: function (fn) {
          if (fn === null || fn instanceof Function) {
            this[_eventHandlers][name]['handler'] = fn
          }
        },
        enumerable: false
      })
    })
  }

  dispatchEvent (event) {
    if (this[_eventHandlers][event.type]) {
      let handlers = this[_eventHandlers][event.type]
      let mainFn = handlers['handler']
      if (mainFn) {
        mainFn(event)
      }
      for (let fn of handlers['listeners']) {
        fn(event)
      }
    }
  }

  addEventListener (name, fn) {
    if (this[_eventHandlers][name]) {
      let store = this[_eventHandlers][name]['listeners']
      let index = store.indexOf(fn)
      if (index === -1) {
        store.push(fn)
      }
    }
  }

  removeEventListener (name, fn) {
    if (this[_eventHandlers][name]) {
      let store = this[_eventHandlers][name]['listeners']
      let index = store.indexOf(fn)
      if (index > 0) {
        store.splice(index, 1)
      }
    }
  }
}

const _status = Symbol('status')

class JakeCache extends PolyfilledEventTarget {

  constructor () { // more options
    
    super(['abort', 'cached', 'checking','downloading', 'error', 'obsolete','progress', 'updateready', 'noupdate'])
    
    if (window.JakeCacheConfig) {
      this.config = window.JakeCacheConfig
    }
    else if (parent.JakeCacheConfig) {
      this.config = parent.JakeCacheConfig
    }
    else {
      this.config = DefaultJakeCacheConfig
    }
    
    this.debug('new JakeCache()')
    
    if (window.jakeCache) {
      this.debug('return existing jakeCache object')
      return window.jakeCache
    }
    
    window.jakeCache = this
    
    // onload
    let onload = () => {
      if (document.readyState !== 'complete') {
        return
      }
      this.debug("document completed")
      if (('serviceWorker' in navigator) === false) {
        console.error("serviceworker are not supported.")
        return
      }
      let html = document.querySelector('html')
      let path = html.getAttribute('manifest')
      this.path = path
      this.keepcache = true
      this.debug("manifest path: " + this.path)
      if (!path) {
        console.error("no manifest path, nothing to cache...")
        return
      }
      
      navigator.serviceWorker.addEventListener('controllerchange', event => {
        window.jakeCache.debug('controllerchange: ' + event.target.controller.state)
        this.debug(event.target.controller.state) 
        switch (event.target.controller.state) {
          case 'activating' :
          case 'activated' :
            window.jakeCache.onActivated()
          break;
        }
      })
      
      if (navigator.serviceWorker.controller === null) { // not already controlled by sw: register()
        navigator.serviceWorker.register('jc-sw.js',{scope : "./"}).then(registration => {
          window.jakeCache.debug(`JakeCache installed for ${registration.scope}`)
        }).catch(function (err) {
            window.jakeCache.debug('JakeCache installation failed: ', err)
        })
      }
      else {
        window.jakeCache.debug('page already controlled by a serviceworker...')
        if (this.path) {
           window.jakeCache.update()
        }
      }
    }

    if (document.readyState === 'complete') {
      onload()
    } 
    else {
      document.onreadystatechange = onload
    }
    
    this[_status] = this.UNCACHED

    navigator.serviceWorker.addEventListener('message', event => {
      switch (event.data.type) {
        case 'abort':
          this.dispatchEvent(new CustomEvent('abort'))
          break
        case 'idle':
          this[_status] = this.IDLE
          break
        case 'checking':
          this[_status] = this.CHECKING
          this.dispatchEvent(new CustomEvent('checking'))
          break
        case 'cached':
          this[_status] = this.IDLE
          this.dispatchEvent(new CustomEvent('cached'))
          break
        case 'downloading':
          this[_status] = this.DOWNLOADING
          this.dispatchEvent(new CustomEvent('downloading'))
          break
        case 'updateready':
          this[_status] = this.UPDATEREADY
          this.dispatchEvent(new CustomEvent('updateready'))
          break
        case 'noupdate':
          this[_status] = this.IDLE
          this.dispatchEvent(new CustomEvent('noupdate'))
          break
        case 'progress':
          this.dispatchEvent(new ProgressEvent('progress', event.data))
          break
        case 'obsolete':
          this[_status] = this.OBSOLETE
          this.dispatchEvent(new CustomEvent('obsolete'))
          break
        case 'error':
          this.dispatchEvent(new ErrorEvent('error', event.data))
          break
      }
    })
  }
  
  get UNCACHED () { return 0 }
  get IDLE () { return 1 }
  get CHECKING () { return 2 }
  get DOWNLOADING () { return 3 }
  get UPDATEREADY () { return 4 }
  get OBSOLETE () { return 5 }

  get status () {
    return this[_status]
  }
  
  /**
   * on initial registration the service worker should be initialized with keepcache: false?
   */
    
  onActivated () { 
    this.debug('sending registration event back to sw for installing the config')
    navigator.serviceWorker.getRegistration("./").then(registration => {
        navigator.serviceWorker.controller.postMessage({
        command: 'activated',
        path: this.path,
        config: JSON.stringify(this.config)
      })
    })
  }
  
  update(reload=false) {
    this.debug('update')
    navigator.serviceWorker.controller.postMessage({
      command: 'update',
      path: this.path,
      reload: reload
    })
  }
  
  abort() {
    this.debug('abort is not implemented')
    return
    /*
    if (this.status === this.DOWNLOADING) {
      navigator.serviceWorker.controller.postMessage({
        command: 'abort'
      })
    }
    */ 
  }
  
  swapCache() {
    this.debug('swapCache is not implemented' )
    return
    /*
    if (this.status !== this.UPDATEREADY) {
      throw new DOMException(DOMException.INVALID_STATE_ERR,
        'there is no newer application cache to swap to.')
    }
    navigator.serviceWorker.controller.postMessage({
      command: 'swapCache'
    })
    */ 
  }
  
  debug(msg) {
    if (this.config && this.config.debug) {
      console.log('%c' + msg, 'color: ' + this.config.consoleColor)
    }
  }
  
  log (msg) {
    console.log('%c' + msg, 'color: ' + this.config.consoleColor)
  }
}

new JakeCache()
