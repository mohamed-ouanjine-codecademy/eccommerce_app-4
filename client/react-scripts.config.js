module.exports = {
  webpack: {
    configure: {
      ignoreWarnings: [
        { module: /babel-loader/ },
        { module: /eslint-webpack-plugin/ }
      ]
    }
  }
};