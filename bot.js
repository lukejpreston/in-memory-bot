const mustache = require('mustache')
const clone = require('clone')
const merge = require('merge')
const Typo = require('typo-js')
const Helpers = require('./helpers')

const flattern = function (arr) {
  return arr.reduce(
    function (accumulator, currentValue) {
      return accumulator.concat(currentValue)
    },
    []
  )
}

module.exports = ({
  user = 'bot',
  scripts = {},
  language, aff, words
}) => {
  let store = {}
  let history = []
  let next = null

  let dictionary = {suggest: (word) => []}
  if (language && aff && words) dictionary = new Typo(language, aff, words)

  const respond = (script, original = '', res = []) => {
    let message = original
    if (script.responseFn) message = script.responseFn(bot)
    else if (script.response) message = script.response
    if (typeof message === 'string') message = mustache.render(message, merge(store, {_message: original}))
    res.push({user, message})
    next = null
    if (script.store) {
      next = {
        store: script.store,
        script: scripts[script.responseScript]
      }
      history = history.concat(res)
      return res
    } else if (script.responseScript) {
      return respond(scripts[script.responseScript], original, res)
    } else {
      history = history.concat(res)
      return res
    }
  }

  const toWords = (message) => {
    message = message.toLowerCase()
    let results = []
    const words = Helpers.words(message)
    words.forEach(word => {
      results.push(word)
      results = results.concat(dictionary.suggest(word))
    })
    return results
  }

  const getScript = (message) => {
    const words = toWords(message)
    return Object.keys(scripts)
      .map(s => scripts[s])
      .filter(script => {
        if (script.default) return true

        if (script.not) {
          const includes = script.not.include || []
          let any = []
          if (script.not.any) any = flattern(script.not.any)
          const matches = script.not.match || []

          const not = words.some(word => includes.includes(word)) ||
            words.some(word => any.includes(word) ||
            matches.some(match => message.test()))
          if (not) return false
        }

        if (script.must) {
          let includes = script.must.include || []
          let any = []
          if (script.must.any) any = flattern(script.must.any)
          let matches = script.must.match || []

          const must = words.some(word => includes.includes(word)) ||
            words.some(word => any.includes(word)) ||
            matches.some(match => match.test(message))
          if (!must) return false
          else {
            includes = includes.concat(script.include || [])
            if (script.any) any = any.concat(flattern(script.any))
            matches = matches.concat(script.match || [])
            const contains = words.some(word => includes.includes(word)) ||
                words.some(word => any.includes(word)) ||
                matches.some(match => match.test(message))
            if (contains) return true
          }
        }

        if (script.include || script.any) {
          const includes = script.include || []
          let any = []
          if (script.any) any = flattern(script.any)
          const matches = script.match || []
          const contains = words.some(word => includes.includes(word)) ||
            words.some(word => any.includes(word)) ||
            matches.some(match => match.test(message))
          if (contains) return true
        }
      })
      .map(script => {
        let count = 0

        let includes = []
        if (script.include) includes = includes.concat(script.include || [])
        if (script.must) includes = includes.concat(script.must.include || [])
        count += words.filter(word => includes.includes(word)).length

        let matches = []
        if (script.match) matches = matches.concat(script.match || [])
        if (script.must) matches = matches.concat(script.must.match || [])
        count += matches.some(match => match.test(message))

        let any = []
        if (script.any) any = any.concat(script.any || [])
        if (script.must) any = any.concat(script.must.any || [])
        const anyCount = any.filter(a => {
          return words.filter(word => a.includes(word)).length > 0
        }).length
        count += anyCount === any.length ? anyCount : 0

        if (count === 0 && script.default) count = 1
        return {
          count,
          script
        }
      })
      .filter(script => script.count > 0)
      .sort((left, right) => {
        if (left.count < right.count) return 1
        if (left.count > right.count) return -1
        if (left.script.priority < right.script.priority) return 1
        if (left.script.priority > right.script.priority) return -1
        if (left.default || right) return 1
        return 0
      })[0].script
  }

  const bot = {
    start () {
      const xs = Object.keys(scripts).filter(s => {
        const script = scripts[s]
        return script.start
      })
      return respond(scripts[xs[0]])
    },
    message ({user = 'you', message}) {
      history = history.concat({user, message})
      if (next) {
        next.store(message, bot)
        const result = respond(next.script, message)
        return result
      } else {
        const script = getScript(message)
        return respond(script, message)
      }
    },
    store (update = {}) {
      store = merge(store, update)
      return clone(store)
    },
    history (update = history) {
      history = update
      return clone(history)
    },
    scripts (update) {
      scripts = merge(scripts, update)
      return clone(scripts)
    }
  }
  return bot
}
