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
        name: 'host',
        remotes: {
          'remote-products': process.env.NODE_ENV === 'production' 
            ? `remote-products@https://remote-products-felipeness-projects.vercel.app/_next/static/chunks/remoteEntry.js`
            : `remote-products@http://localhost:3001/_next/static/chunks/remoteEntry.js`,
          'remote-cart': process.env.NODE_ENV === 'production'
            ? `remote-cart@https://remote-cart-felipeness-projects.vercel.app/_next/static/chunks/remoteEntry.js`
            : `remote-cart@http://localhost:3002/_next/static/chunks/remoteEntry.js`,
        },
        filename: 'static/chunks/remoteEntry.js',
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