/**
 * Implements the npm run build operation
 * 
 * Notes for cesium:
 * Building baulks on url, https, http, and zlib which are node modules.
 * There are browserified options for them which maybe could
 * work with esbuild's define and inject options.
 */
 const { build } = require("esbuild")
 const { nodeBuiltIns } = require("esbuild-node-builtins")

build({
    logLevel: "info",
    plugins: [nodeBuiltIns()],
    entryPoints: [
        'src/js/oboe-browser.js',
        'src/js/isamples-api.js',
        'src/js/settings.js',
        'src/js/eventbus.js',
        'src/js/main.js',
        'src/js/isamples-ui-imports.js',
        'src/js/wc-clippy.js',
        'src/js/wc-logger.js',
        'src/js/isamples-login.js',
        'src/js/gh_issues.js',
        'src/js/json-panel.js',
        'src/js/isamples-state.js',
        'src/js/isamples-record.js',
        'src/js/records.js',
        'src/js/isamples-summary.js',
        'src/js/isamples-spatial.js',
        'src/js/isamples-temporal.js',
        'src/js/isamples-app.js',
    ],
    bundle: true,
    outdir: "dist/js",
    splitting: true,
    format:"esm",
    platform: "browser",
}).catch(() => process.exit(1))
