# iSamples Web UI
A web app to search and discover iSamples records. The app is based on [solr-faceted-search-react](https://www.npmjs.com/package/solr-faceted-search-react) react library and [CesiumJS](https://cesium.com/platform/cesiumjs/) Javascript library.

## npm initialization
In order to get all the necessary javascript packages installed, make sure you run the following command in the terminal after first checkout.
```
npm install
``` 

## Submodule Init
1) The `solr-faceted-search-react` is a git submodule located in `src/node_modules`.  To initialize it when you check out, do 
```
git submodule init
```
2) If you've already done that, make sure that you are up to date with all of the remote branches specified in `.gitmodules`:
```
git submodule update --remote
```

## Start the web app
After set up all dependencies, run the below command to start the app. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
```
npm start
```

## Modify fields for the App
[field.js](/src/fields.js) contains all default set up constant fields for this app. Currently, it contains three parts. 

1) searchFields and sortFeidls for solr-faceted-search-react (the main record page).
    * Required property: `field` and `type`
    * Additional property: 
      * `label` (the name would be shown in the page or default by field)
      * `hidden` (if the fields would be shown in the left pane)
      * `collapse` (if the shown fields would collapse, only work without `hidden:true`)
2) Cesium Map:
    * Initial map camera state (default moorea)
    * The color schema
    * Default source list, if we will have more organization, we could add them here
3) DOIs Schemas: 
    * DOIs required fields provided by the backend.
    * DOIs default schema
    * iSamples default schema
    * Schema object rules
      * Object key is the field name
      * Property:
          * type: the field type
          * items: the value of field (array || string)
          * description: a string to describe the field
  

## DOIs and UserInfo pages are unavailable locally
DOIs abd UserInfo pages are unavaulable locally because of the `cross-origin` issue. We use `HttpOnly` cookie for the authorization, the cookie would be only sent by browser with the same domain or enabled `'credentials': 'include'`.

In order to enable these two pages, two methods:
1) Please run [iSamples_docker](https://github.com/isamplesorg/isamples_docker) locally after moving updated `isamples_webui` to `isamples_docker`.
2) Please run [iSamples_inabox](https://github.com/isamplesorg/isamples_inabox), change `_server_base` in the [config.js](/public/config.js) to `isamples_inabox` server URL (http://localhost:8000), add `'credentials': 'include'` in the both headers of fetch functions of two pages, and modify `isb_web/main.py`:
```
From

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

to 

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```



## Available Scripts

In the project directory, you can run:

### `npm run localdev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Code Formatting

We've configured .editorconfig with the formatter settings for this project.  Assuming you're using Visual Studio Code, you ought to be able to install the `EditorConfig for VS code` extension and formatting should just work.

## Debugging

The .vscode project checked in has the correct launch target for launching the Chrome debugger.  Start the node server, then launch the debugger and breakpoints should work out of the box.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

To learn `solr-faceted-search-react` library, check out the [documentation](https://www.npmjs.com/package/solr-faceted-search-react). Since iSample web ui add new features to this library, you might also need to review the source code of [iSamples version](https://github.com/isamplesorg/solr-faceted-search-react/tree/develop). In the current project, [extension folder](./src/extension) contains all custom isamples scripts that overwrite the original `solr-faceted-search-react` scripts.

To learn Cesium, check out the [CesiumJS documentation](https://cesium.com/learn/cesiumjs-learn/).

The useful sources about the logic of how to deploy CeisumJS in the React app. Since the CesiumJS is not a react library, we need to use uncontrolled component to manipulate the DOM outside of the React Model.
1) [Manipulate the DOM outside of the React Model](https://medium.com/@garrettmac/reactjs-how-to-safely-manipulate-the-dom-when-reactjs-cant-the-right-way-8a20928e8a6)
2) [Controlled and uncontrolled react component](https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/)

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
