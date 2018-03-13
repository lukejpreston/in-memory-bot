# In Memory Bot

Welcome to the in memory bot

A JavaScript bot which works in the browser without a server

Unlike a traditional bot it does not learn, nor is it sentient and definatly not smart. It works because you make it work.

In memory means it is quicker than any other bot on the market, it requires no server and cost nothing. You can make as many requests as you feel like, have as many users attached to it as your application will allow and you can hack it to pieces if you feel like it.

## Installation

`npm i -S in-memory-bot`

## Usage

Here is the basic usage

```js
import Bot from 'bot'

const scripts = Bot.builder()
    .script('hello')
        .response('Hello, my name is Bot. How can I help?')
        .default()
    .build()
const bot = Bot.bot(scripts, "en_US", aff, words)
const response = bot.message('How do I use the In Memory Bot?')
// respnonse === ['Hello, my name is Bot. How can I help?']
```

Getting your aff and words

If you are using webpack

```js
import aff from 'in-memory-bot/en_US.aff'
import words from 'in-memory-bot/en_US.dic'
```

If you are using node

```js
const fs = require('fs')
const aff = fs.readFileSync('./node_modules/in-memory-bot/en_US.aff').toString()
const words = fs.readFileSync('./node_modules/in-memory-bot/en_US.dic').toString()
```

## API

### builder

the builder will create your scripts which you can then feed into your bot

#### script

starts the script build, everything that follows will be added to the script until you either call `script` or `build`

```js
Bot.builder().script('my-unique-name')
```

#### query

What will be matched when you send a message, can be either a string or regex or an array of strings or regexes. If it is a string it will use your dictionary in order to aid with guessing. I would advise you keep your strings to the point and treat them more as key words as opposed to sentences, if you want to check for phrases them use the regex

```js
Bot.builder()
    .script('hello')
        .query('hello')
        .query(['hi', 'hullo'])
        .response('Welcome')
    .script('goodbye')
        .query('bye')
        .query(['bi', 'cheerio'])
        .query(/so long/g)
        .response('See ya!')
```

#### priority

you can assign scripts different priorities, so if two query match then it will pick the one with the highest priority. If that also matches it will pick whatever comes out first

```js
Bot.builder()
    .script('hello')
        .priority(2)
        .query('hello')
        .response('Welcome, One')
    .script('hello-2')
        .priority(1)
        .query('hello')
        .query('hi')
        .response('Welcome, Two')
```

Matching works by counting matching queries and then priority so if I did `bot.message('hello')` the response would be `['Welcome, One']` but if I did `bot.message('hello hi')` the response would be `['Welcome, Two]` since it matched on both `hi` and `hello`

#### default

If it does not match it will default to this response, if you have multiple default messages it will pick the first one it finds

```js
Bot.builder()
    .script('default')
        .response('Sorry I don\'t understand')
        .default()
```

#### response

What the script will respond with, either a string or any object. If it is a string you can use mustache template in order to populate values that your bot has stored, e.g. you could save a users name. See `store` for more info on storing and using mustache

```js
Bot.builder()
    .script('hello')
        .query('hello')
        .response('Welcome')
    .script('goodbye')
        .query('bye')
        .response('See ya!')
    .script('your-name')
        .query('name')
        .response('Your name is {{name}}')
    .script('home')
        .query('home')
        .response({
            href: '/home',
            label: 'Home'
        })
    .script('home')
        .query('home')
        .response(() => new Promise((resolve, reject) => {resolve('some http request perhaps')}))
```

#### responseScript

Instead of responding with an object you could respond with another script, so you can chain scripts togther, for example when asking a question, `store` takes a second parameter which is the name of a script see store for more details

```js
Bot.builder()
    .script('welcome')
        .default()
        .response('Welcome')
        .responseScript('name')
    .script('name')
        .response('What is your name?')
        .store('name', 'your-name')
    .script('your-name')
        .response('Hello {{name}}')
```

#### store

the store takes a function which it will use to parse the message, which is given the message and the store object

```js
Bot.builder()
    .script('welcome')
        .default()
        .store((message, store) => {
            store.name = message // assuming you don't want to extract anything
        })
        .response('What is your name?')
        .responseScript('name')
    .script('name')
        .response('Welcome, {{name}}')
```

the mustache template works by using your string value and your store, using the below example go look at mustache documentation for more information on what you can do with it

```js
let res = bot.message('hello')
console.log(res) // ['What is your name?']
res = bot.message('Luke')
console.log(res) // ['Welcome, Luke']
```

#### build

you need to call build to add your scripts to the bot

```js
const scripts = Bot.builder()
    .script('welcome')
        .response('Hi!')
        .default()
    .build()

const bot = Bot.bot(scripts, "en_US", aff, words)
```

this script is just JSON so you can always save the script somewhere if you wish to skip using the builder

### bot

#### message

this is how you talk to the bot, it only takes string objects and returns an array response of objects using the scripts generated by the buidler

```js
const response = bot.message('Hello, my name is Luke')
```

#### extend

You can extend your bots scripts with more scripts, it assums you are givving in a script object using the builder

```js
const moreScripts = Bot.builder()
    .script('goodbye')
        .response('Bye!')
        .default()
    .build()

bot.extend(moreScripts)
```

#### history

You can view the history of the bot

```js
const bot = Bot.bot(scripts, "en_US", aff, words)
const history = bot.history()
```

the history looks like

```json
[{
    "type": "message",
    "value": "My name is Luke"
}, {
    "type": "response",
    "value": "Welcome, Luke"
}]
```

#### setHistory

You can also set history, this will override all history, either as a way to alter history (for censorship perhaps) or to just clear a conversation

```js
const bot = Bot.bot(scripts, "en_US", aff, words)
const history = bot.history()
bot.setHistory(history)
```

#### store

the store is a mutable object with all the values you want to use for later, if you wish to manipulate the store you can do, or if you just want to get a value

```js
const store = bot.store()
store.name = 'hello'
```

## Helpers

there are a couple of helpers which do some basic regex matching to help you parse a response, they can be used outside of the bot as well as inside

### amIs

get everything after the words am or is ignore spelling of the word am or is

```js
const name = Bot.helpers.amIs('I am blah blah')
console.log(name) // blah blah
```

### words

split a string into words by spaces

```js
const name = Bot.helpers.words('I am blah blah')
console.log(name) // ['I', 'am', 'blah', 'blah']
```

## Multiple Users

The bot does not come with multiple users, but you can make multiple bots if you want to have them chat

```js
const luke = Bot.bot(...)
const tim = Bot.bot(...)

let response = luke.message('Hello') // ['Well, howdy partner!']
response = tim.message('Hello') // ['*nods* \'sup']
```

You might want to do this to make a more dynamic kind of bot, e.g.

> @bot:  Hi I am the Site Bot, how can I help?

> @me:   How do I buy a new pair of shoes?

> @bot:  Let me transfer you to the Shop

> @shop: I am the shop bot, you wanted to know "How do I buy a new pair of shoes?"

> @shop: You should look at our shoe section [link]

> @me:   How do I make a complaint about some shoes I just bought?

> @shop: Let me take you to the Coms Bot

> @coms: @shop told me you wish to make a complaint about "some shoes I just bought"

and so on

this way you can load a bot when it is needed perhaps, or you could have many bots talking to each other to create NPCs which could talk on end

If you wish to assign users when `message` comes with a second parameter `bot.message('Hello', '@username')` and it appends it to the response

That's it, now go forth and make lots of robot friends

## Contributing

My vision is to make loads of these bots, so that everyone can share bots and they learn from each other. So if you have a script why not create a PR and you could have your bot talking to other people. To use a pre defined script

```js
const lukeScript = require('in-memory-bot/luke.json')
```

### Scripts

* `user-bot`, asks questions for a simple setup form
    > What is your name?

    > What is your gender?

    > What is your date of birth?

    > What is your password?

    > Can you repeat your password?

## Bots

1. browser bot http://blah with a simple example like the one above
2. terminal bot clone http://blah similar to above but in the console
3. bot city http://blah a group of bots all talking to each other where you can join in and chat to different bots

