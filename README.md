# isamples_webui

Web interface to iSB and iSC APIs


## Development

Generally following guidelines under https://modern-web.dev/

### Prerequisites

1. Install npm: `brew install npm`
2. Install browsersync: `npm install -g browser-sync`
3. Install minica: `brew install minica`
4. Set up minica with localhost: `minica --domains localhost`

### Running

Setup:
```
npm install
```

Build:
```
npm run build
```
Results are in the `dist` folder.

Run local server:
```
npm run serve
```

Watch sources, build on change, and refresh view:
```
npm run watch
```

Certificates are needed for some interactions (e.g. authentication). The development server
configuration for https is in `bs-config.js` in the `https` section. 

[Minica](https://github.com/jsha/minica) provides a convenient CA for local development
purposes. My setup keeps the CA in `~/.local/etc/ca`.

