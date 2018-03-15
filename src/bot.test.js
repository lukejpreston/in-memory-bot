const Builder = require('./builder')
const Bot = require('./bot')
const Helpers = require('./helpers')

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

const aff = fs.readFileSync(path.resolve(__dirname, './en_US.aff')).toString()
const words = fs.readFileSync(path.resolve(__dirname, './en_US.dic')).toString()

test('bot', () => {
  const helpers = Helpers({language: 'en_US', aff, words})

  const scripts = Builder()
    .script('default')
    .default()
    .response('Sorry, I do not understand "{{_message}}"')

    .script('welcome')
    .response('Welcome to the test')
    .responseScript('name')
    .start()

    .script('name')
    .response('What is your name?')
    .store((bot, message) => {
      const value = helpers.amIs(message)
      const values = helpers.words(value)
      bot.store({
        fullname: values.join(' '),
        firstname: values[0],
        name: values[0],
        lastname: values[values.length - 1]
      })
    })
    .responseScript('age')

    .script('age')
    .response('How old are you?')
    .store((bot, message) => {
      const value = helpers.amIs(message)
      bot.store({
        age: parseInt(value, 10)
      })
    })
    .responseScript('profile')

    .script('profile')
    .responseFn((bot) => {
      const year = new Date().getFullYear() - bot.store().age
      return `{{name}}, was born in ${year}`
    })

    .script('first-name')
    .priority(1)
    .count((bot, message) => {
      message = message.toLowerCase()
      if (message.includes('last') || message.includes('full')) return 0
      let count = 0
      count += message.includes('name') || message.includes('called') ? 1 : 0
      if (count === 0) return 0
      count += message.includes('first') ? 1 : 0
      return count
    })
    .response('Your first name is {{firstname}}')

    .script('full-name')
    .priority(2)
    .count((bot, message) => {
      message = message.toLowerCase()
      if (message.includes('last') || message.includes('first')) return 0
      let count = 0
      count += message.includes('name') || message.includes('called') ? 1 : 0
      if (count === 0) return 0
      count += message.includes('full') ? 1 : 0
      return count
    })
    .response('Your full name is {{fullname}}')

    .script('bot-name')
    .count((bot, message) => {
      message = message.toLowerCase()
      let count = 0
      count += message.includes('name') || message.includes('name') ? 1 : 0
      if (count === 0) return count
      count += message.includes('bot') || message.includes('your') ? 1 : 0
      if (count === 1) return 0
      return count
    })
    .response('My name is Bot')

    .script('digit')
    .count((bot, message) => {
      return message.match(/^[0-9]*$/g) !== null ? 1 : 0
    })
    .response('That\'s an interesting digit {{_message}}')

    .build()

  const bot = Bot({
    user: 'Bot',
    scripts,
    language: 'en_US',
    aff,
    words
  })

  bot.start()
  bot.message({
    user: bot.store().name || 'You',
    message: 'My name is Luke John Preston'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: 'I am 28'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: 'What is my name?'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: 'What is my first name?'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: 'What is my full name?'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: 'What is your name?'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: 'What is your default value?'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: 'What am I called?'
  })
  bot.message({
    user: bot.store().name || 'You',
    message: '1234'
  })

  const logs = []
  bot.history().forEach(history => {
    const nameColor = history.user === 'Bot' ? 'red' : 'blue'
    const messageColor = history.user === 'Bot' ? 'yellow' : 'cyan'
    logs.push(
      chalk.bold[nameColor](`@${history.user}: `) +
      chalk.bold[messageColor](history.message)
    )
  })
  console.log(logs.join('\n'))
})
