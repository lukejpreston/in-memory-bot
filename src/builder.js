module.exports = () => {
  const scripts = {}
  let currentName = null

  const builder = {
    script (name) {
      currentName = name
      scripts[currentName] = {}
      scripts[currentName].name = name
      return builder
    },
    start (start = true) {
      scripts[currentName].start = start
      return builder
    },
    default (def = true) {
      scripts[currentName].default = def
      scripts[currentName].count = () => 1
      return builder
    },
    priority (priority) {
      scripts[currentName].priority = priority
      return builder
    },
    response (response) {
      scripts[currentName].response = response
      return builder
    },
    responseScript (responseScript) {
      scripts[currentName].responseScript = responseScript
      return builder
    },
    responseFn (responseFn) {
      scripts[currentName].responseFn = responseFn
      return builder
    },
    store (store) {
      scripts[currentName].store = store
      return builder
    },
    count (count) {
      scripts[currentName].count = count
      return builder
    },
    build () {
      return scripts
    }
  }
  return builder
}
