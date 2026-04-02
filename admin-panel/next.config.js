/** @type {import('next').NextConfig} */
const nextConfig = {
    webpackDevMiddleware: (config) => {
        config.watchOptions = {
            ignored: ['**/uploads/**', '**/public/uploads/**']
        };
        return config;
    }
};

module.exports = nextConfig;
