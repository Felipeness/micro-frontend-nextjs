const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

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
        name: 'remote-cart',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './Cart': './src/components/CartWrapper',
          './CartButton': './src/components/CartButton',
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