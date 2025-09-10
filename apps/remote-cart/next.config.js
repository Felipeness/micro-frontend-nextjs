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
        name: 'remote_cart',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './Cart': './components/exposedCart.js',
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