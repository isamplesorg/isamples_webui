module.exports = {
  plugins: [
    {
      plugin: require("craco-cesium")(),
    }
  ],
  babel: {
    "presets": [
      ["@babel/preset-react", {
      "runtime": "automatic"
    }],
    '@babel/preset-env'
  ],
    "plugins": ["@babel/plugin-syntax-jsx"]
  },
};
