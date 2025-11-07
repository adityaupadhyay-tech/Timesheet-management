const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Obfuscation configuration - only in production
const WebpackObfuscator = require('webpack-obfuscator');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  
  // Disable SWC minification when obfuscating (webpack-obfuscator will handle it)
  swcMinify: process.env.OBFUSCATE !== 'true',
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Modularize imports to reduce bundle size
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Experimental features for better optimization
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            },
            // MUI specific chunk
            mui: {
              name: 'mui',
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Supabase specific chunk
            supabase: {
              name: 'supabase',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };

      // Code obfuscation - only for client-side bundles in production
      if (process.env.OBFUSCATE === 'true') {
        console.log('🔒 Obfuscation enabled for client-side bundles');
        
        // Disable webpack's built-in minification when obfuscating
        config.optimization.minimize = true;
        config.optimization.minimizer = config.optimization.minimizer || [];
        
        // Remove TerserPlugin if present (SWC handles minification by default)
        config.optimization.minimizer = config.optimization.minimizer.filter(
          (plugin) => plugin.constructor.name !== 'TerserPlugin'
        );
        
        config.plugins.push(
          new WebpackObfuscator({
            // Obfuscation options
            rotateStringArray: true,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 4,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: false,
            
            // Exclude certain files from obfuscation
            exclude: [
              /node_modules/,
              /\.next\/server/,
              /webpack-runtime/,
              /framework/,
            ],
            
            // Performance options
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: false, // Set to true for extra protection (may break dev tools)
            debugProtectionInterval: 0,
            disableConsoleOutput: false, // Set to true to disable console.log
            identifierNamesGenerator: 'hexadecimal',
            log: true, // Enable logging to see what's being obfuscated
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            target: 'browser',
          })
        );
      }
    }
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)
