module.exports = {
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
  }
}
