const Builder = require('./builder')
const Bot = require('./bot')
const Helpers = require('./helpers')

const chalk = require('chalk')
const fs = require('fs')

const aff = fs.readFileSync('./en_US.aff').toString()
const words = fs.readFileSync('./en_US.dic').toString()

test('bot', () => {
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
    .store((message, bot) => {
      const value = Helpers.amIs(message)
      const values = Helpers.words(value)
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
    .store((message, bot) => {
      const value = Helpers.amIs(message)
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
    .must.any('name', 'called')
    .include('first')
    .not.include('last', 'full')
    .response('Your first name is {{firstname}}')

    .script('full-name')
    .priority(2)
    .must.any('name', 'called')
    .include('full')
    .not.include('last', 'first')
    .response('Your full name is {{fullname}}')

    .script('bot-name')
    .must.any('name', 'called')
    .must.any('bot', 'your')
    .response('My name is Bot')

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
