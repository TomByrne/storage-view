# ![](./public/icon.svg) Storage View

This is a React/Tauri front-end to the [fstat](https://github.com/TomByrne/fstat-rs) Rust project.
It is heavily inspired by the [WinDirStat](https://windirstat.net/) project, but really serves as a way to explore several new technologies.

## Tech

- **[Rust](https://www.rust-lang.org/):** Application backend and fstat file recursion.
- **[Tauri](https://tauri.studio/):** Application wrapper (windowing, etc)
- **[React](https://reactjs.org/):** Front-end component lib
- **[Redux](https://redux.js.org/):** Front-end state management
- **[MUI](https://mui.com/):** Front-end UI lib
- **[PixiJS](https://pixijs.com/):** WebGL Graphics lib (for drawing Treemap)

## Setup
- Install [rustup](https://rustup.rs/) (will require [VS C++ Build tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) on Windows)
- Install [Node](https://nodejs.org/en/download/)
- Install global yarn: `npm install yarn -g`
- Install JS dependencies within project: `yarn`


## Development

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
The app will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.