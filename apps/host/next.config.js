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
        name: 'host',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          remote_products: process.env.NODE_ENV === 'production' 
            ? `remote_products@https://remote-products.vercel.app/_next/static/${options.isServer ? 'ssr' : 'chunks'}/remoteEntry.js`
            : `remote_products@http://localhost:3001/_next/static/${options.isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
          remote_cart: process.env.NODE_ENV === 'production'
            ? `remote_cart@https://remote-cart.vercel.app/_next/static/${options.isServer ? 'ssr' : 'chunks'}/remoteEntry.js`
            : `remote_cart@http://localhost:3002/_next/static/${options.isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
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