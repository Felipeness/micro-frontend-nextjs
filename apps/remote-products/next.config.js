const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'remote-products',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProductList': './src/components/ProductListWrapper',
          './ProductCard': './src/components/ProductCard',
        },
        shared: {
          react: { 
            singleton: true, 
            eager: true, 
            requiredVersion: false 
          },
          'react-dom': { 
            singleton: true, 
            eager: true, 
            requiredVersion: false 
          },
        },
      })
    );

    return config;
  },
  transpilePackages: ['http-client'],
};

module.exports = nextConfig;