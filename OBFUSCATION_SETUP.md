# Code Obfuscation Setup

This project is configured to automatically obfuscate JavaScript code during production builds. The obfuscation will be applied when deploying to Vercel.

## How It Works

1. **Automatic Obfuscation**: Code obfuscation is automatically applied during `npm run build` in production mode
2. **Client-Side Only**: Only client-side JavaScript bundles are obfuscated (not server-side code)
3. **Vercel Deployment**: When you deploy to Vercel, the build process will automatically obfuscate your code

## Configuration

The obfuscation is configured in `next.config.js` using `webpack-obfuscator` with the following features:

### Obfuscation Features Enabled:
- ✅ String array encoding and rotation
- ✅ Control flow flattening
- ✅ Dead code injection
- ✅ Identifier name obfuscation (hexadecimal)
- ✅ Self-defending code
- ✅ Object key transformation
- ✅ Base64 string encoding

### Exclusions:
- `node_modules` - Third-party packages are not obfuscated
- `.min.js` files - Already minified files
- Webpack and Next.js internal files

## Testing Locally

To test obfuscation locally:

```bash
# Build for production
npm run build

# Start production server
npm start
```

Then check the built JavaScript files in `.next/static/chunks/` - they should be obfuscated.

## Deployment to Vercel

1. **Push to Git**: Commit and push your changes
2. **Deploy**: Vercel will automatically:
   - Run `npm run build`
   - Apply obfuscation during the build
   - Deploy the obfuscated code

## Verification

After deployment, you can verify obfuscation by:
1. Opening your deployed site
2. Opening browser DevTools → Sources tab
3. Viewing the JavaScript files - they should be obfuscated with hexadecimal identifiers and encoded strings

## Important Notes

⚠️ **Performance Impact**: Obfuscation adds build time and slightly increases bundle size. The impact is minimal but noticeable.

⚠️ **Debugging**: Obfuscated code is harder to debug. Use source maps in development mode (obfuscation only runs in production).

⚠️ **Compatibility**: If you encounter build errors, you may need to adjust the obfuscation settings in `next.config.js`.

## Disabling Obfuscation

To temporarily disable obfuscation, comment out the obfuscation section in `next.config.js`:

```javascript
// if (!dev && !isServer && process.env.NODE_ENV === 'production') {
//   ... obfuscation code ...
// }
```

