module.exports = () => {
  const scripts = {}
  let currentName = null

  const args = (args) => {
    let result = null
    if (args.length === 1 && Array.isArray(args[0])) result = args[0]
    else if (args.length === 1) result = [args[0]]
    else result = Array.apply(null, args)
    return result
  }

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

    include () {
      scripts[currentName].include = scripts[currentName].include || []
      scripts[currentName].include = scripts[currentName].include.concat(args(arguments))
      return builder
    },
    match () {
      scripts[currentName].match = scripts[currentName].match || []
      scripts[currentName].match = scripts[currentName].match.concat(args(arguments))
      return builder
    },
    any (any) {
      scripts[currentName].any = scripts[currentName].any || []
      scripts[currentName].any.push(args(arguments))
      return builder
    },
    matchAny () {
      scripts[currentName].matchAny = scripts[currentName].matchAny || []
      scripts[currentName].matchAny.push(args(arguments))
      return builder
    },
    must: {
      include () {
        scripts[currentName].must = scripts[currentName].must || {}
        scripts[currentName].must.include = scripts[currentName].must.include || []
        scripts[currentName].must.include = scripts[currentName].must.include.concat(args(arguments))
        return builder
      },
      match () {
        scripts[currentName].must = scripts[currentName].must || {}
        scripts[currentName].must.match = scripts[currentName].must.match || []
        scripts[currentName].must.match = scripts[currentName].must.match.concat(args(arguments))
        return builder
      },
      any () {
        scripts[currentName].must = scripts[currentName].must || {}
        scripts[currentName].must.any = scripts[currentName].must.any || []
        scripts[currentName].must.any.push(args(arguments))
        return builder
      },
      matchAny () {
        scripts[currentName].must = scripts[currentName].must || {}
        scripts[currentName].must.matchAny = scripts[currentName].must.matchAny || []
        scripts[currentName].must.matchAny.push(args(arguments))
        return builder
      }
    },
    not: {
      include () {
        scripts[currentName].not = scripts[currentName].not || {}
        scripts[currentName].not.include = scripts[currentName].not.include || []
        scripts[currentName].not.include = scripts[currentName].not.include.concat(args(arguments))
        return builder
      },
      match () {
        scripts[currentName].not = scripts[currentName].not || {}
        scripts[currentName].not.match = scripts[currentName].not.match || []
        scripts[currentName].not.match = scripts[currentName].not.match.concat(args(arguments))
        return builder
      },
      any () {
        scripts[currentName].not = scripts[currentName].not || {}
        scripts[currentName].not.any = scripts[currentName].not.any || []
        scripts[currentName].not.any.push(args(arguments))
        return builder
      },
      matchAny () {
        scripts[currentName].not = scripts[currentName].not || {}
        scripts[currentName].not.matchAny = scripts[currentName].not.matchAny || []
        scripts[currentName].not.matchAny.push(args(arguments))
        return builder
      }
    },

    build () {
      return scripts
    }
  }
  return builder
}
