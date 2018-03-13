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
const bot = Bot.bot(scripts)
const response = bot.message('How do I use the In Memory Bot?')
// respnonse === ['Hello, my name is Bot. How can I help?']
```

As you can see it is not very intelligent. If you wish to see a full working example take a look at `bot.test.js`

## API

### builder

the builder will create your scripts which you can then feed into your bot