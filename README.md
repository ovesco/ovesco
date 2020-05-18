# Softweng project

This project was developed for the Softweng MSE master at HES-SO. It's a small blog with, currently, only
one article about ternary search trees, but some other are on the road!

You can [check it out here!](https://softweng.guillaumehochet.now.sh/)

## Technologies
The purpose of the project was to familiarize with frontend framework technologies like Vue/React or other.
I chose to go on using Vuepress to build the blog. As such, we use:
- Vuejs
- Vuex
- Vuepress

As main technologies.

### Building
In order to play with this:
1. Clone this repository and `cd` in it
2. Run `npm install` to install all dependencies as well as `npm i -g vuepress` to load the vuepress builder
3. Run `npm run dev` to start the blog locally on your machine

### Running tests
A small test suite was developed to check the behavior of the Vuex store, you can run it with `npm test`.
It's built using `Jest` and babel-jest for transpilation.

## Something cool about this blog
Every visitor can have his own set of *favorite* article. When on an article simply click the heart button
which will add it to vuex and automatically persist it to local storage using `vuex-persist`, a plugin
for Vuex.

## Difficulties encountered
Vuepress is quite tough to get started with. Theming is complex and extending an existing theme is more
complex than it seems. Loading external libraries like Vuex is also troublesome and doesn't follow the
standard registration flow. But all in all it was a nice experiment.

### Making vuex persist work with SSR
Vuepress couldn't build the project because we're using `window.localStorage` in the store to persist it
automatically. In order for everything to work, after a bit of digging, I ended up with the following
solution:
```js
if (typeof process === 'undefined') {
    // We're in browser!
}
```
This also allows us to run jest tests without problems.