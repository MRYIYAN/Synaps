// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Desactiva minimización para evitar errores del CssMinimizerPlugin
      webpackConfig.optimization.minimize = false;
      return webpackConfig;
    }
  }
};