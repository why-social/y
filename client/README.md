# Client – Vue.js Frontend

## Client Structure

| File        | Purpose           |
| ------------- | ------------- |
| [README.md](./README.md) | Everything about the client |
| [public/favicon.ico](public/favicon.ico) | [Favicon](https://en.wikipedia.org/wiki/Favicon) website icon |
| [index.html](index.html) | Static HTML entry point page |
| `src/` | src (i.e., source code) |
| [src/Api.js](src/Api.js) | Configures HTTP library to communicate with backend |
| [src/App.vue](src/App.vue) | Main Vue layout template for all views (or pages) |
| `src/assets/` | Graphical resources |
| `src/components/` | Custom Vue components |
| [src/main.js](src/main.js) | Main JavaScript entry point |
| [src/router.js](src/router.js) | Vue routes configuration |
| `src/views/` | Vue components that are separate pages/views |
| [src/views/Home.vue](src/views/Home.vue) | Home page/view |
| [package.json](package.json) | Project meta-information |
| [vite.config.js](vite.config.js) | Vite configuration for command line builds |

## Requirements

* [Server](../server/README.md) backend running on `http://localhost:3000`
* [Node.js](https://nodejs.org/en/download/) (>=v18) => installation instructions for [Linux](https://github.com/nodesource/distributions)
* [Visual Studio Code (VSCode)](https://code.visualstudio.com/) as IDE
  * [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) plugin for Vue tooling
  * [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) plugin for linting Vue, JS, and HTML code
* [Vue.js devtools](https://devtools.vuejs.org/) browser plugin for debugging

## Project setup

Make sure, you are in the client directory `cd client`

Installs all project dependencies specified in [package.json](./package.json).

```sh
npm install
```

### Compiles and hot-reloads for development

Automatically recompiles and refreshes the browser tab if you save any changes to local files.

```sh
npm run serve
```

### Compiles and minifies for production

Builds the production-ready website into the `dist` directory.

```sh
npm run build
```

### Lints and fixes files

```sh
npm run lint
```

## Debug in VSCode with Chrome

1. **[VSCode]** Set a breakpoint in your Javascript code
2. **[Terminal]** Run `npm run serve` to serve the client
3. **[VSCode]** Select *Debug > Start Debugging (F5)* to automatically start a debug session in Chrome[<sup>1</sup>](#1)
4. **[Chrome]** Browse in Chrome to trigger your breakpoint and the focus will jump back to VSCode

Find illustrated instructions in the [Vuejs Debug Docs](https://vuejs.org/v2/cookbook/debugging-in-vscode.html).

<a class="anchor" id="1"><sup>1</sup></a> Chrome will launch with a separate user profile (not to mess up with your familiar daily Chrome profile) in a temp folder as described in the VSCode [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome). It is recommended to install the [vue-devtools](https://github.com/vuejs/vue-devtools) [Chrome Extension](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) there.
