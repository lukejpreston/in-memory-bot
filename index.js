const mustache = require('mustache')
const Typo = require('typo-js')

const builder = (scripts = {}) => {
    let current = null
    const me = {
        script (name) {
            scripts[name] = {}
            current = name
            return me
        },
        priority (priority) {
            scripts[current].priority = priority
            return me
        },        
        response (response) {
            scripts[current].response = response
            return me
        },
        responseFn (responseFn) {
            scripts[current].responseFn = responseFn
            return me
        },
        responseScript (name) {
            scripts[current].responseScript = name
            return me
        },
        query (query) {
            scripts[current].query = scripts[current].query || []
            if (Array.isArray(query)) scripts[current].query = scripts[current].query.concat(query)
            else scripts[current].query.push(query)
            return me
        },
        store (name, script) {
            scripts[current].store = name
            scripts[current].responseScript = script
            return me
        },
        parse (parse) {
            scripts[current].parse = parse
            return me
        },
        default (isDefault = true) {
            scripts[current].default = isDefault
            return me
        },
        build: () => scripts
    }
    return me
}

const bot = (scripts = {}, language, aff, words) => {
    const dictionary = new Typo(language, aff, words)

    const typos = (message) => {
        const words = message.match(/(\w*)/g).filter(word => word !== '')
        let wordsWithSpelling = []
        words.forEach(word => {
            word = word.toLowerCase(0)
            wordsWithSpelling.push(word)
            wordsWithSpelling = wordsWithSpelling.concat(dictionary.suggest(word))
        })
        return wordsWithSpelling
    }

    const history = []

    const store = {}
    let storeName = null
    let storeScript = null

    const response = (script, respond = []) => {
        let value = script.response
        if (script.responseFn) value = script.responseFn(me)
        if (typeof value === 'string') value = mustache.render(value, store)
        respond.push(value)
        if (!script.hasOwnProperty('store') && script.responseScript) response(scripts[script.responseScript], respond)
        if (script.store) {
            storeName = script.store
            storeScript = script.responseScript
        }
        return respond
    }

    const respond = (script) => {
        const result = response(script)
        history.push({
            type: 'response',
            response: result
        })
        return result
    }
    
    const me = {
        message (message) {
            history.push({
                type: 'message',
                message
            })

            if (storeName) {
                const script = scripts[storeScript]
                storeScript = null
                if (script.parse) message = script.parse(message)
                store[storeName] = message
                storeName = null
                return respond(script)
            }

            const matched = []
            Object.keys(scripts).forEach(name => {
                const script = scripts[name]
                if (script.query) {
                    const messageWords = typos(message)

                    let count = script.query.filter(q => {
                        if (typeof q === 'string') {
                            const words = q.toLowerCase().match(/(\w*)/g).filter(word => word !== '')
                            if (messageWords.some(word => words.includes(word))) return true
                        }
                        return message.match(q) !== null
                    })
                    if (count.length > 0) matched.push({
                        name,
                        count: count.length,
                        priority: script.priority || -1
                    })
                }
            })
            if (matched.length === 0) {
                Object.keys(scripts).forEach(name => {
                    const script = scripts[name]
                    if (script.default) matched.push({
                        name, priority: script.priority
                    })
                })
            }
            const matchedScript = matched.sort((left, right) => {
                if (left.count > right.count) return -1
                if (left.count < right.count) return 1
                if (left.count === right.count) {
                    if (left.priority > right.priority) return -1
                    if (left.priority < right.priority) return 1
                }
                return 0
            })[0]
            const script = scripts[matchedScript.name]
            return respond(script)            
        },
        history: () => history,
        store: () => store,
        extend (newScripts) {
            scripts = Object.assign({}, scripts, newScripts)
        }
    }

    return me
}

const helpers = {
    amIs (message) {
        let regex = /.*\s*(?:is|Is|IS|iS)\s*(.*)/g
        let match = regex.exec(message)
        if (match !== null) return match[1]
        regex = /.*\s*(?:am|Am|AM|aM)\s*(.*)/g
        match = regex.exec(message)
        if (match !== null) return match[1]
        return message
    }
}
    
module.exports = {builder, bot, helpers}