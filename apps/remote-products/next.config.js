const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, options) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'remote_products',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProductList': './components/exposedProductList.js',
        },
        shared: {
          react: { 
            singleton: true, 
            requiredVersion: false 
          },
          'react-dom': { 
            singleton: true, 
            requiredVersion: false 
          },
        },
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;