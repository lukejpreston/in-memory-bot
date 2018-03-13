const Bot = require('./')

test('bot', () => {
    const amIs = (message) => {
        let regex = /.*\s*(?:is|Is|IS|iS)\s*(.*)/g
        let match = regex.exec(message)
        if (match !== null) return match[1]
        regex = /.*\s*(?:am|Am|AM|aM)\s*(.*)/g
        match = regex.exec(message)
        if (match !== null) return match[1]
        return message
    }

    const scripts = Bot.builder()
        .script('welcome')
            .response('Hello and welcome to the test.')
            .responseScript('name')
            .default()
        .script('name')
            .store('name', 'your-name')
            .response('What is your name?')
        .script('your-name')
            .parse((message) => amIs(message))
            .response('Hello {{name}}')
            .responseScript('age')
        .script('age')
            .response('How old are you?')
            .store('age', 'your-age')
        .script('your-age')
            .parse((message) => amIs(message))
            .response((bot) => {
                const age = parseInt(bot.store().age, 10)
                return `{{name}} was born in ${new Date().getFullYear(0) - age}`
            })
        .build()

    const bot = Bot.bot(scripts)

    let response = bot.message('Hello')
    response = bot.message('My name is Luke Preston')
    response = bot.message('I am 28')
    
    bot.history().forEach(value => {
        let log = ''
        if (value.type === 'message') log += '@you: '
        else log += '@bot: '
        log += value.message || value.response.join('\n      ')
        console.log(log)
    })
})
