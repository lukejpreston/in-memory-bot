const mustache = require('mustache')
const clone = require('clone')
const merge = require('merge')

module.exports = ({
  user = 'bot',
  scripts = {}
}) => {
  let store = {}
  let history = []
  let next = null

  const respond = (script, original = '', res = []) => {
    let message = original
    if (script.responseFn) message = script.responseFn(bot, original)
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

  const getScript = (message) => {
    return Object.keys(scripts)
      .map(s => {
        const script = scripts[s]
        const count = script.count || (() => 0)
        return {count: count(bot, message), script}
      })
      .filter(({count, script}) => {
        if (script.default) return true
        return count > 0
      })
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
        next.store(bot, message)
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
