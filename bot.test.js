const Bot = require('./')
const chalk = require('chalk')

test('bot', () => {
    const scripts = Bot.builder()
        .script('welcome')
            .response('Hello and welcome to the test.')
            .responseScript('name')
            .default()
        .script('name')
            .store('name', 'your-name')
            .response('What is your name?')
        .script('your-name')
            .parse((message) => {
                const name = Bot.helpers.amIs(message)
                const fullName = name.split(/\s/g).filter(value => value !== '')
                bot.store().fullName = fullName.join(' ')
                bot.store().firstName = fullName[0]
                bot.store().lastName = fullName[fullName.length - 1]
                return `${bot.store().firstName} ${bot.store().lastName}`
            })
            .response('Hello {{firstName}}')
            .responseScript('age')
        .script('age')
            .response('How old are you?')
            .store('age', 'your-age')
        .script('your-age')
            .parse((message) => Bot.helpers.amIs(message))
            .responseFn((bot) => {
                const age = parseInt(bot.store().age, 10)
                return `{{name}}, you were born in ${new Date().getFullYear(0) - age}`
            })
        .script('first-name')
            .query('name')
            .query('first')
            .query('my')
            .response('Your first name is {{firstName}}')
        .script('full-name')
            .query('name')
            .query('my')
            .priority(10)
            .response('Your name is {{fullName}}')
        .script('bot-name')
            .query('name')
            .query('your')
            .priority(1000)
            .response('My name is "Bot", that is short of "In Memory Bot"')
        .build()

    const bot = Bot.bot(scripts)

    const logs = []
    const yourMessage = (message) => {
        const response = bot.message(message)
        name = bot.store().firstName || 'you'
        let yourLog = chalk.blue.bold(`@${name}: `)
        yourLog += chalk.cyan.bold(message)
        logs.push(yourLog)

        let botLog = chalk.red.bold(`@Bot: `)
        botLog += chalk.yellow.bold(response.join('\n      '))
        logs.push(botLog)
    }


    yourMessage('Hello')
    yourMessage('My name is Luke John Preston')
    yourMessage('I am 28 years old')
    yourMessage('What is my name?')
    yourMessage('What is my first name?')
    yourMessage('What is your name?')

    console.log(logs.join('\n\n'))
})
