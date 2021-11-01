import postcss from 'rollup-plugin-postcss';
import html from '@web/rollup-plugin-html';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';
import externals from 'rollup-plugin-node-externals'

import path from 'path';
const production = !process.env.ROLLUP_WATCH;
const cesiumBuildPath = 'node_modules/cesium/Build/Cesium'

const copyConfig = {
    patterns: ['docs/images/**/*'],
    targets: [
        { src: path.join(cesiumBuildPath, 'Assets'), dest: 'dist' },
        { src: path.join(cesiumBuildPath, 'ThirdParty'), dest: 'dist' },
        { src: path.join(cesiumBuildPath, 'Widgets'), dest: 'dist' },
        { src: path.join(cesiumBuildPath, 'Workers'), dest: 'dist' },
    ]
}

const htmlConfig = {
    input: [
        'docs/index.html',
        'docs/map.html',
        'docs/map2.html',
    ],
}

const terserConfig = {
    ecma: 2020,
    module: true,
    warnings: true
}

const externalsConfig = {
    deps: false,
}

const cssConfig = {
    extensions: ['.css',]
}

const config = {
  external: [
      'local_config.js',
      'https://cdn.skypack.dev/@octokit/request',
  ],
  plugins: [
      //externals(externalsConfig),
      html(htmlConfig),
      resolve(),
      postcss(cssConfig),
      minifyHTML(),
      terser(terserConfig),
      summary(),
      copy(copyConfig),
  ],
  output: {
    dir: 'dist',
  },
  preserveEntrySignatures: 'strict',
}

export default config;