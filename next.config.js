const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Import webpack obfuscator
const WebpackObfuscator = require('webpack-obfuscator')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  
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
  webpack: (config, { dev, isServer, webpack }) => {
    // Code obfuscation - only in production and client-side
    if (!dev && !isServer && process.env.NODE_ENV === 'production') {
      // Only obfuscate client-side chunks
      const obfuscatorOptions = {
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
        unicodeEscapeSequence: false,
        
        // Control flow obfuscation
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        
        // Identifier obfuscation
        identifierNamesGenerator: 'hexadecimal',
        identifiersPrefix: '',
        renameGlobals: false,
        selfDefending: true,
        
        // Performance options
        compact: true,
        simplify: true,
        
        // Exclude specific files/paths from obfuscation
        exclude: [
          /node_modules/,
          /\.min\.js$/,
          /webpack[\\/]runtime/,
          /next[\\/]dist[\\/]client/,
          /\.next[\\/]server/,
        ],
        
        // Target specific file extensions
        target: 'browser',
        
        // Transform object keys
        transformObjectKeys: true,
        
        // Disable console output
        disableConsoleOutput: false,
      }
      
      // Apply obfuscation to all client-side JavaScript chunks
      config.plugins.push(
        new WebpackObfuscator(obfuscatorOptions, [
          // Exclude specific bundles if needed
        ])
      )
    }
    
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
    }
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)
