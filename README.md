# In Memory Bot

Welcome to the in memory bot

A JavaScript bot which works in the browser without a server

Unlike a traditional bot it does not learn, nor is it sentient and definatly not smart. It works because you make it work.

In memory means it is quicker than any other bot on the market, it requires no server and cost nothing. You can make as many requests as you feel like, have as many users as you feel like and your bots can chat to each other

## Installation

`npm i -S in-memory-bot`

## Usage

see the test for a deeper usage [bot.test.js](https://github.com/lukejpreston/in-memory-bot/blob/master/bot.test.js)

here is a basic example

```js
import Builder from 'in-memory-bot/builder'
import Bot from 'in-memory-bot/bot'

const scripts = Builder()
    .script('default')
        .response('I don\'t understand {{_message}}')
        .default()
    .script('hello')
        .count((bot, message) => {
            return message.toLowerCase().includes('hello') ? 1 : 0
        })
        .response('How do you do?')
    .build()

const bot = Bot({user: 'Bot', scripts})

const reply = bot.message({
    user: 'Luke',
    message: 'Hello, how are you?'
})

reply === [{
    user: 'Luke',
    message: 'Hello, how are you?'
}, {
    user: 'Bot',
    message: 'How do you do?'
}]
```

## API

### Builder

Use this to generate scripts for your bot. A script is part query and part response. You could save the scripts to a `js` file or you could save the scripts to a `json` file, remember you can't write functions to a JSON file.

#### constructor and build

the constructor takes no arguments and `build` returns the `scripts`

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .build()

scripts === {}
```

#### script

start building a script with a name

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('name')
    .build()

scripts === {
    name: {}
}
```

#### builder.start

the start script, takes a boolean value

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('welcome')
        .start()
    .build()

scripts === {
    welcome: {
        start: true
    }
}
```

#### default

the default value if nothing is matched

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('default')
        .default()
    .build()

scripts === {
    default: {
        default: true
    }
}
```

#### priority

if two or more queries match the higher priority will win

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('higher')
        .priority(2)
    .script('lower')
        .priority(1)
    .build()

scripts === {
    higher: {
        priority: 2
    },
    lower: {
        priority: 1
    }
}
```

#### response

Once matched this is the response given

It can be any object

If it is a string it will be passed through the [mustache](https://github.com/janl/mustache.js) with `_message` and the `store`, see [store](####builder.store)

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('hello')
        .response('Hello, how are you?')
    .script('mustache')
        .response('Welcome back {{name}}')
    .script('mustache-message')
        .response('You said {{_message}}')
    .script('anything')
        .response({
            link: 'http://google.com',
            label: 'Google'
        })
    .build()

scripts === {
    hello: {
        response: 'Hello, how are you?'
    },
    mustache: {
        response: 'Welcome back {{name}}'
    },
    'mustache-message': {
        response: 'You said {{_message}}'
    },
    anything: {
        response: {
            link: 'http://google.com',
            linklabel: 'Google'
        }
    }
}
```

#### responseScript

If matched it will call the response script once run, it will be called after `store` has finished, see [store](####builder.store)

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('hello')
        .response('Hello and welcome!')
        .responseScript('get-name')
    .script('get-name')
        .response('What is your name?')
    .build()

scripts === {
    hello: {
        response: 'Hello and welcome!',
        responseScript: 'get-name'
    },
    'get-name': {
        response: 'What is your name?'
    }
}
```

#### responseFn

Will call this instead of `response` and the value return from this function will be the response

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('time')
        .responseFn((bot, message) => {
            return `The time is ${new Date()}`
        })
    .build()

scripts === {
    time: {
        responseFn: (bot, message) => {
            return `The time is ${new Date()}`
        }
    }
}
```

#### builder.store

Pauses the bot and waits for input, then runs the callback on the message before continuing with a `responseScript` if one is present

```js
import Builder from 'in-memory-bot/builder'

const scripts = Builder()
    .script('name')
        .response('What is your name?')
        .store((bot, message) => {
            bot.store({name: message})
        })
        .responseScript('your-name')
    .script('your-name')
        .response('Your name is {{name}}')
    .build()

scripts === {
    name: {
        response: 'What is your name?'
        store: (bot, message) => {
            bot.store({name: message})
        },
        responseScript: 'your-name'
    },
    'your-name': {
        response: 'Your name is {{name}}
    }
}
```

### Bot

the bot, you send your bot(s) messages and it responds

#### constructor

```js
import Bot from 'in-memory-bot/bot'
import aff from 'in-memory-bot/en_US.aff'
import words from 'in-memory-bot/en_US.dic'

const bot = Bot({
    user: 'Bot',
    scripts,
    language: 'en_US',
    aff,
    words
})
```

default values

```json
{
    "user": "bot",
    "scripts": {}
}
```

You do not need to use a dicationary, but it does help the bot know about possible typos. Dictionaries slow the bot down, but not by much and still faster than many server based bots.

We have the `en_US` dictionary available otherwise you will need to bring your own. This bot supports only 1 dictionary at a time, if you wish to swap languages or have multiple language bot I suggest you create multiple bots and ask the user to pick one. This is for performance reasons

The dictionary uses [typo-js](https://github.com/cfinke/Typo.js/)

#### bot.start

runs the first start script it finds, if you want to run mutliple start scripts you should chain them using `responseScript`

```js
import Builder from 'in-memory-bot/builder'
import Bot from 'in-memory-bot/bot'

const scripts = Builder()
    .script('welcome')
        .start()
        .response('Welcome, I am @Bot')
    .build()

const bot = Bot({user: 'Bot', scripts})

const result = bot.start()

result === [{
    user: 'Bot',
    message: 'Welcome, I am @Bot'
}]
```

#### message

```js
import Builder from 'in-memory-bot/builder'
import Bot from 'in-memory-bot/bot'

const scripts = Builder()
    .script('welcome')
        .count((bot, message) => message.toLowerCase().includes('hello') ? 1 : 0)
        .response('Hi, I am @Bot')
    .build()

const bot = Bot({user: 'Bot', scripts})

const result = bot.message({
    user: 'Luke',
    message: 'Hello, who is this?'
})

result === [{
    user: 'Luke',
    message: 'Hello, who is this?'
}, {
    user: 'Bot',
    message: 'Hi, I am @Bot'
}]
```

#### store

you can access the values and manipulate the values in the store, either getting values the user has given or setting values such as cookies

store returns a clone of the store value

```js
import Builder from 'in-memory-bot/builder'
import Bot from 'in-memory-bot/bot'

const scripts = Builder().build()

const bot = Bot({user: 'Bot', scripts})

let store = bot.store()

store === {}

store = bot.store({
    name: 'Luke Preston'
})

store === {
    name: 'Luke Preston'
}

store = bot.store({
    age: 28
})

store === {
    name: 'Luke Preston',
    age: 28
}
```

#### history

get and maniuplate the history

history returns a clone of the history value, unlike store it does not merge history

```js
import Builder from 'in-memory-bot/builder'
import Bot from 'in-memory-bot/bot'

const scripts = Builder().build()

const bot = Bot({user: 'Bot', scripts})

let history = bot.history()

history === []

bot.message({user: 'Luke', message: 'Hello'})

history = bot.history()

history === [{
    user: 'Luke',
    message: 'Hello'
}]

history = bot.history([{
    user: 'Admin',
    message: 'You do not have permission to see the conversation'
}])

history === [{
    user: 'Admin',
    message: 'You do not have permission to see the conversation'
}]
```

#### scripts

you can extend the scripts of the bot

scripts returns a clone of the scripts

```js
import Builder from 'in-memory-bot/builder'
import Bot from 'in-memory-bot/bot'

const scripts = Builder().build()

const bot = Bot({user: 'Bot', scripts})

let scripts = bot.scripts()

scripts === {}

const helloScript = Builder.script('hello').default().response('Hello').build()

scripts = bot.scripts(helloScript)

scripts === {
    hello: {
        default: true,
        response: 'Hello'
    }
}

const startScript = Builder.script('welcome').start().response('Welcome').build()

scripts = bot.scripts(helloScript)

scripts === {
    welcome: {
        start: true,
        response: 'Welcome'
    },
    hello: {
        default: true,
        response: 'Hello'
    }
}
```

### Helper

#### amIs

regex for checking if the message has `... am ...` or `... is ...` and returns everything after the word `am` or `is`

```js
import Helpers from 'in-memory-bot/helpers'

const result = Helpers.amIs('My name is Luke Preston')
result === 'Luke Preston'
```

#### words

splits a sentence into it's words, `split(' ')` does not take into account lots of spaces, it also ignores anything which isn't a word

```js
import Helpers from 'in-memory-bot/helpers'

const result = Helpers.words('Hello, my name is Luke ')
result === ['Hello', 'my', 'name', 'is', 'Luke']
```

## Algorithm

The algorithm for matching is simple

## Templating

As mentioned it uses mustache. This is because mustache is great for templating strings and is lightning quick. You can therefore use any templating values that mustache comes with.

For simplicities sake you should use `{{value}}` and `{{{value}}}`, the difference is that `{{value}}` will escape values where as `{{{value}}}` will not

It only uses mustache if your `response` or `responseFn` returns a string value

the message is assigned to `_message` otherwise it is anything you have put into your store

here is a complete example

```js
import Builder from 'in-memeory-bot/builder'
import Bot from 'in-memeory-bot/bot'
import Helpers from 'in-memeory-bot/helpers'
import aff from 'in-memeory-bot/en_US.aff'
import words from 'in-memeory-bot/en_US.dic'

const scripts = Builder()
    .script('default')
        .default()
        .response('Sorry, I do not understand "{{_message}}"')
    .script('name')
        .count((bot, message) => {
            message = message.toLowerCase()
            let count = 0
            count += message.includes('is') || message.includes('am') ? 1 : 0
            if (count === 0) return count
            count += message.includes('name') || message.includes('called') ? 1 : 0
            if (count === 1) return 0
            return count
        })
        .responseFn((bot, message) => {
            const value = Helpers.amIs(message)
            const name = Helpers.words(message)[0]
            bot.store({name})
        })
        .responseScript('hello')
    .script('hello')
        .response('Hello, {{name}}')
    .build()

const bot = Bot({user: 'Bot', scripts})

bot.message({user: 'Luke', message: 'Which way to the store?'})
bot.message({user: 'Luke', message: 'My name is Luke Preston'})

bot.history() === [{
    user: 'Luke',
    message: 'Which way to the store?'
}, {
    user: 'Bot',
    message: 'Sorry, I do not understand "Which way to the store?"'
}, {
    user: 'Luke',
    message: 'My name is Luke Preston'
}, {
    user: 'Bot',
    message: 'Hello, Luke'
}]
```

## Bots

I would like to make many many in-memory bots and would ideally like it to be community driven, so if you create `${bot-name}-scripts.js` files and create a PR I will happily merge it so others can use that bot. Provide a description for your scripts and if you have a working demo send that too otherwise I will load it into my demo at <http://...>

| bot name | description | demo |
|---|---|---|
| profile | Will get information like name, age and gener, ask the bot `help` for a list of attributes it expects from your, or run `bot.start()` to guide the user | <http://.../profile> |
| ascii | takes what you say and turns it into ascii art format | <http://.../ascii> |
| stack-overflow | takes what you ask then returns the possible questions from stackoverflow | <http://.../stack-overflow> |

## Contributing

If you want to contribute more than just bots you can, you run the tests with `npm test` and when you are satisfied create a PR. Unlike other tests it is less assertions and more about a conversation working as expected
