const Typo = require('typo-js')

const Helpers = ({language, aff, words}) => {
  let dictionary = {suggest: (word) => []}
  if (language && aff && words) dictionary = new Typo(language, aff, words)

  const helpers = {
    amIs (message) {
      let regex = /.*\s*(?:is|Is|IS|iS)\s*(.*)/g
      let match = regex.exec(message)
      if (match !== null) return match[1]
      regex = /.*\s*(?:am|Am|AM|aM)\s*(.*)/g
      match = regex.exec(message)
      if (match !== null) return match[1]
      return message
    },
    words (message) {
      return message.match(/(\w*)/g).filter(word => word !== '')
    },
    typoWords (message) {
      message = message.toLowerCase()
      let results = []
      const words = helpers.words(message)
      words.forEach(word => {
        results.push(word)
        results = results.concat(dictionary.suggest(word))
      })
      return results
    }
  }

  return helpers
}

module.exports = Helpers
