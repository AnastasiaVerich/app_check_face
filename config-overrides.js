const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function override(config, env) {
    if (env === 'production') {
        config.plugins = [...(config.plugins || []), new BundleAnalyzerPlugin()];
    }
    return config;
};
