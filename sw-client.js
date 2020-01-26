class DB {
    constructor(name) {
        this.name = name
        this.db = undefined
    }
    open() {
        return new Promise((resolve, reject) => {
            const opener = indexedDB.open(this.name)
            opener.onsuccess = () => {
                this.db = opener.result
                resolve()
            }
            opener.onerror = () => {
                reject(opener.error)
            }
            opener.onupgradeneeded = (e) => {
                e.target.result.createObjectStore("data", { keyPath: "key" })
            }
        })
    }
    add(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction("data", "readwrite")
            const objectstore = transaction.objectStore("data")
            objectstore.add({key, value})
            transaction.oncomplete = () => {
                resolve()
            }
            transaction.onerror = () => {
                reject(transaction.error.message)
            }
        })
    }
    set(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction("data", "readwrite")
            const objectstore = transaction.objectStore("data")
            objectstore.put({key, value})
            transaction.oncomplete = () => {
                resolve()
            }
            transaction.onerror = () => {
                reject(transaction.error.message)
            }
        })
    }
    get(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction("data", "readonly")
            const objectstore = transaction.objectStore("data")
            const request = objectstore.get(key)
            request.onsuccess = () => {
                if (request.result == undefined) {
                    reject(key + " not found")
                    return
                }
                const {_, value} = request.result
                resolve(value)
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }
    getAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction("data", "readonly")
            const objectstore = transaction.objectStore("data")
            const request = objectstore.getAll()
            request.onsuccess = () => {
                resolve(request.result)
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }
    remove(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction("data", "readwrite")
            const objectstore = transaction.objectStore("data")
            const request = objectstore.delete(key)
            request.onsuccess = () => {
                resolve()
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }
    clear() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction("data", "readwrite")
            const objectstore = transaction.objectStore("data")
            const request = objectstore.clear()
            request.onsuccess = () => {
                resolve()
            }
            request.onerror = () => {
                reject(request.error)
            }
        })
    }
}

let url = null,
    activeId = "",
    initCache = false,
    progress = false,
    mesageChannel = null,
    store = null,
    _qs = null,
    _qsa = null

const color = '#0066cc'
const cacheStatus = {
    EMPTY : 0,
    CACHING : 1,
    READY: 2
}


let questionType = null

const questionTypes = {
    FC : 1,
    MC : 2,
    CLOZE_SELECT: 3,
    CLOZE_INPUT: 4,
    CLOZE_MIXED: 5,
    ESSAY: 6
}

const log = (msg) => {
    console.log('%c' + msg, 'color: ' + color)
}

const debug = (msg) => {
    console.debug('%c' + msg, 'color: ' + color)
}

const init = function() {
    url = new URL(window.location)
    _qs = document.querySelector.bind(document)
    _qsa = document.querySelectorAll.bind(document)
    activeId = url.searchParams.get('active_id')
    
    if (navigator.serviceWorker.controller === null) { // not already controlled by sw: register()
        initCache = true
        navigator.serviceWorker.register('./sw-compiled.js',{scope : "./"}).then(registration => {
            log(`sw registered for ${registration.scope}`)
        }).catch(function (err) {
               log('sw installation failed: ', err)
        })
    }
    else {
        log('page already controlled by a serviceworker...')
        store = new DB("storage")
        store.open().then( _ => { 
            log('storage open')
            handleNetworkChange() // needs storage
            //updateSession().then( data => { console.dir(data) } ).catch( err => log(err) )
        })
    }
    
    if (initCache) {
        trackProgress()
        return
    }
    navigator.connection.addEventListener('change', handleNetworkChange)
    const isPlayerPage = (url.pathname.match(/\/ilias\.php$/) && url.searchParams.get("cmdClass") === "iltestplayerfixedquestionsetgui")
    const isQuestionPage = (url.pathname.match(/\/ilias\.php$/) && url.searchParams.get("cmd") === "showQuestion")
    if (isPlayerPage) playerNetworkDisplay(navigator.connection)
    if (isQuestionPage) handleQuestion()
}

const updateSession = function (session=null) {
    return new Promise( (resolve, reject) => {
        if (activeId === null) {
            return reject('no active_id, can not get session')
        } 
        if (session !== null) {
            return store.set(activeId, session).then( _ => { return resolve() } ).catch( err => { return reject(err) } )
        }
        return store.get(activeId).then( data => { return resolve(data) } ).catch( err => { return reject(err) } )
    })
}

navigator.serviceWorker.addEventListener('controllerchange', (event) => {
    const controller = event.target.controller
    log("controllerchange: " + controller.state)
})

navigator.serviceWorker.addEventListener('message', (event) => {
    switch (event.data.type) {
        case "progress" :
            if (progress) {
                let pr = _qs("progress")
                let max = pr.getAttribute('max')
                if (!max) {
                    pr.setAttribute('max',event.data.max)
                }
                pr.setAttribute('value',event.data.value)
            }
            break
        case "cacheReady" :
            _qs("#cacheText").innerHTML = "cache ready: " + event.data.message
            initCache = false
            progress = false
            break
        case "cacheError" : 
            initCache = false
            progress = false
            _qs("#cacheText").innerHTML = "cache error: " + event.data.message
            break
    }
})

// get control over sw lifecycycle:

const trackProgress = function() {
    log("create progressbar and wait for caching messages...")
    let prDiv = document.createElement('div')
    prDiv.id = 'cacheDiv'
    prDiv.classList.add('container')
    prDiv.style.marginTop = '20px'
    let prDivText = document.createElement('div')
    prDivText.id = "cacheText"
    prDivText.style.marginBottom = '20px'
    prDivText.innerHTML = "Caching static ressources..."
    let prEl = document.createElement('progress')
    prDiv.appendChild(prDivText)
    prDiv.appendChild(prEl)
    _qs('#minheight').appendChild(prDiv)
    progress = true
}

const playerNetworkDisplay = function(connection,offline=false) {
    let netinfo = document.getElementById('netinfo')
    if (!netinfo) {
        netinfo = document.createElement('div')
        netinfo.id = "netinfo"
        netinfo.style = "position:absolute;top:5px;"
        let content = document.createTextNode(getNetInfo())
        netinfo.appendChild(content)
        document.body.appendChild(netinfo)
    }
    if (connection.downlink < 0.1) {
        if (offline) {
            document.getElementById('netinfo').style.color = "orange"
        }
        else {
            document.getElementById('netinfo').style.color = "red"
        }
    }
    else {
        document.getElementById('netinfo').style.color = "green"
    }
    netinfo.textContent = getNetInfo()
    function getNetInfo() {
        return 'network: ' + connection.effectiveType + ", downlink: " + connection.downlink
    }
}

const handleNetworkChange = async _ => {
    const isPlayerPage = (url.pathname.match(/\/ilias\.php$/) && url.searchParams.get("cmdClass") === "iltestplayerfixedquestionsetgui")
    let connection = navigator.connection
    const offline = (connection.downlink === 0)
    const dialog = _qs('#noNetDialog')
    if (isPlayerPage) {
        if (offline) {
            log('player page: check cache...')
            const session = await updateSession().catch( err => log(err) )
            if (!session) {
                log('session should not be undefined: ' + session)
                return
            }
            //console.dir(session)
            if (session.cacheStatus === cacheStatus.READY) {
                debug('cache is ready')
                playerNetworkDisplay(connection,true)
            }
            else {
                debug('cache is not ready: disable page') // or let sw decides with partial and incomplete cache check
                playerNetworkDisplay(connection,false)
            }
        }
        else {
            playerNetworkDisplay(connection,false)
            try {
                if (dialog && dialog.open) dialog.close()
            }
            catch(e) { log(e) }
        }
    }
    else {
        if (offline) {
            log('not in player: disable page')
            disablePage()
        }
        else {
            try {
                if (dialog && dialog.open) dialog.close()
            }
            catch(e) { log(e) }
        }
    }
}

const disablePage = () => {
    let dialog = _qs('#noNetDialog')
    if (!dialog) {
        log("create dialog")
        dialog = document.createElement('dialog')
        dialog.id = "noNetDialog"
        dialog.style.cssText = `
            position:fixed;
            top: 50%;
            padding: 20px;
            border: 0;
            border-radius:0.6rem;
            box-shadow: 0 0 1em black;
        `
        dialog.innerHTML = `<div>No Network...</div>
                            <div><progress></progress></div>`
        document.body.appendChild(dialog)
    }
    else {
        log("dialog exists")
    }
    dialog.showModal()
}

const replyHandler = function(event) {
    //switch 
    log("replyHandler: " + event.data)
}

window.addEventListener('load', function() {
    init()
    //messageChannel = new MessageChannel()
    //messageChannel.port1.addEventListener('message', replyHandler)
    //navigator.serviceWorker.controller.postMessage({type: "onLoad"},[messageChannel.port2])
})

window.addEventListener('beforeunload', function(e) {
    log('onbeforeunload')
    switch (questionType) {
        case questionTypes.CLOZE_INPUT :
            handleClozeInput()
            break
        case questionTypes.CLOZE_SELECT :
            handleClozeSelect()
            break
        case questionTypes.CLOZE_MIXED :
            handleClozeMixed()
            break
        case questionTypes.ESSAY :
            handleEssay()
            break
        break
    }
    /*
    const isQuestionPage = (url.pathname.match(/\/ilias\.php$/) && url.searchParams.get("cmd") === "showQuestion")
    if (isQuestionPage) {
        log('commit page html')
        const id = url.searchParams.get("sequence")
        const domHTML = document.getElementById("ilc_Page").innerHTML
        navigator.serviceWorker.controller.postMessage({type: "formDom", body: {id: id, content: domHTML}})
        log('page html commited')
    }
    */ 
})

const save = () => {
    const id = url.searchParams.get("sequence")
    const domHTML = document.querySelector(".ilc_question_Standard").innerHTML
    navigator.serviceWorker.controller.postMessage({type: "formDom", body: {id: id, content: domHTML}})
}

const handleQuestion = function() {
    
    const singleChoiceInputs = _qsa('input[name="multiple_choice_result"]')
    if (singleChoiceInputs.length) {
        questionType = questionTypes.FC
        handleFC(singleChoiceInputs)
        return
    }
    
    const multipleChoiceInputs = _qsa('input.ilAssMultipleChoiceResult')
    if (multipleChoiceInputs.length) {
        questionType = questionTypes.MC
        handleMC(multipleChoiceInputs)
        return
    }
    
    const textInputs = _qsa('input.ilc_qinput_TextInput')
    if (textInputs.length) {
        questionType = questionTypes.CLOZE_INPUT
    }
    
    const selectInputs = _qsa('select.ilc_qinput_ClozeGapSelect') 
    if (selectInputs.length) {
        questionType = questionTypes.CLOZE_SELECT
    }
    
    if (textInputs.length && selectInputs.length) {
        questionType = questionTypes.CLOZE_MIXED
    }
    
    const textAreas = _qsa('textarea.ilc_qlinput_LongTextInput')
    if (textAreas.length) {
        questionType = questionTypes.ESSAY
    }
}

const handleFC = function(singleChoiceInputs) {
    singleChoiceInputs.forEach((input) => {
        input.addEventListener('click', (e) => {
            singleChoiceInputs.forEach((input) => {
                if (input.id === e.currentTarget.id) {
                    input.setAttribute('checked', '')
                } else {
                    input.removeAttribute('checked')
                }
            })
            save()
        })
    })
}

const handleMC = function(multipleChoiceInputs) {
    multipleChoiceInputs.forEach((input) => {
        input.addEventListener('click', () => {
            if (!input.hasAttribute('checked')) {
                input.setAttribute('checked', '')
            } else {
                input.removeAttribute('checked')
            }
            save()
        })
    })
}

const handleClozeInput = function(_save=true) {
    const textInputs = _qsa('input.ilc_qinput_TextInput')
    textInputs.forEach((input) => {
        input.setAttribute('value', input.value)
    })
    if (_save) save()
}

const handleClozeSelect = function(_save=true) {
    const selectInputs = _qsa('select.ilc_qinput_ClozeGapSelect') 
    selectInputs.forEach((input) => {
        Array.from(input.children).forEach((child) => {
            if (child.getAttribute('value') == input.value) {
                child.setAttribute('selected', '')
            } else {
                child.removeAttribute('selected')
            }
        })
    })
    if (_save) save()
}

const handleClozeMixed = function() {
    handleClozeInput(false)
    handleClozeSelect(false)
    save()
}


const handleEssay = function() { // todo: tinyMCE does not work!
    const textAreas = _qsa('textarea.ilc_qlinput_LongTextInput')
    textAreas.forEach((area) => {
        area.innerHTML = area.value
    })
    save()
}
