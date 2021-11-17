/**
 * Implements the npm run build operation
 */
require('esbuild').build({
    logLevel: "info",
    entryPoints: [
        'src/js/oboe-browser.js',
        'src/js/settings.js',
        'src/js/eventbus.js',
        'src/js/main.js',
        'src/js/wc-clippy.js',
        'src/js/isamples-login.js',
        'src/js/gh_issues.js',
        'src/js/json-panel.js',
        'src/js/isamples-state.js',
        'src/js/isamples-summary.js',
        'src/js/isamples-spatial.js',
        'src/js/isamples-temporal.js',
    ],
    bundle: true,
    outdir: "dist/js",
    splitting: true,
    format:"esm",

}).catch(() => process.exit(1))
