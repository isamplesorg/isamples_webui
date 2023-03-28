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
    }]],
    "plugins": ["@babel/plugin-syntax-jsx"]
  },
};
