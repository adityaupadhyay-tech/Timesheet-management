# Code Obfuscation Guide for Vercel Deployment

## ⚠️ Important Notes

**Client-side code obfuscation has limitations:**
- Client-side JavaScript is always visible in the browser
- Obfuscation makes code harder to read but doesn't make it impossible to reverse engineer
- Server-side code is protected (not sent to browser)
- Obfuscation can increase bundle size and slightly impact performance

## 📦 Installation

The required packages are already added to `package.json`. Install them:

```bash
npm install
```

## 🚀 Usage

### Option 1: Build with Obfuscation (Recommended for Production)

```bash
npm run build:obfuscate
```

This will:
- Build your Next.js app
- Obfuscate all client-side JavaScript bundles
- Create production-ready files in `.next` directory

### Option 2: Standard Build (No Obfuscation)

```bash
npm run build
```

## 🔧 Configuration

Obfuscation settings are in `next.config.js`. Key options:

- **`rotateStringArray`**: Rotates string array encoding
- **`stringArrayEncoding`**: Uses base64 encoding for strings
- **`transformObjectKeys`**: Obfuscates object property names
- **`controlFlowFlattening`**: Makes control flow harder to follow
- **`selfDefending`**: Protects against tampering
- **`debugProtection`**: Can disable dev tools (use carefully)

### Adjusting Obfuscation Level

Edit `next.config.js` and modify the `WebpackObfuscator` options:

**Light Obfuscation** (faster, less protection):
```javascript
rotateStringArray: true,
stringArray: true,
stringArrayEncoding: ['base64'],
transformObjectKeys: true,
```

**Heavy Obfuscation** (slower, more protection):
```javascript
// Add these to the existing config:
controlFlowFlattening: true,
controlFlowFlatteningThreshold: 0.75,
deadCodeInjection: true,
deadCodeInjectionThreshold: 0.4,
debugProtection: true, // ⚠️ May break browser dev tools
disableConsoleOutput: true, // ⚠️ Disables console.log
```

## 🌐 Vercel Deployment

### Method 1: Environment Variable (Recommended)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name**: `OBFUSCATE`
   - **Value**: `true`
   - **Environment**: Production (or All)
4. Redeploy your application

### Method 2: Update Build Command

1. Go to your Vercel project settings
2. Navigate to **Build & Development Settings**
3. Update **Build Command** to:
   ```
   npm run build:obfuscate
   ```
4. Save and redeploy

### Method 3: Update vercel.json

The `vercel.json` file can be updated to include:

```json
{
  "buildCommand": "npm run build:obfuscate",
  ...
}
```

## 🧪 Testing Obfuscation

1. Build with obfuscation:
   ```bash
   npm run build:obfuscate
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Open browser DevTools → Sources tab
4. Check the JavaScript files - they should be obfuscated

## 📊 What Gets Obfuscated

✅ **Obfuscated:**
- Client-side React components
- Client-side JavaScript logic
- Client-side utility functions
- Client-side API calls

❌ **Not Obfuscated:**
- Server-side code (API routes, server components)
- Node modules (excluded by default)
- Static assets (images, fonts, etc.)
- HTML/CSS files

## ⚡ Performance Impact

- **Bundle Size**: May increase by 10-30%
- **Parse Time**: Slightly slower initial parse
- **Runtime**: Minimal impact (usually <5%)

## 🔒 Security Best Practices

1. **Never store secrets in client-side code** - Use environment variables
2. **Use API routes** for sensitive operations
3. **Implement proper authentication** on the server
4. **Rate limiting** for API endpoints
5. **Input validation** on server-side

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (requires Node 16+)
- Ensure all dependencies are installed
- Check for syntax errors in `next.config.js`

### Obfuscation Not Working
- Verify `OBFUSCATE=true` is set
- Check that you're building for production (`npm run build:obfuscate`)
- Ensure `webpack-obfuscator` is installed

### App Breaks After Obfuscation
- Some libraries may not work with heavy obfuscation
- Try reducing obfuscation level
- Check browser console for errors
- Exclude problematic files in `next.config.js`

## 📝 Additional Resources

- [webpack-obfuscator Documentation](https://github.com/javascript-obfuscator/webpack-obfuscator)
- [JavaScript Obfuscator Options](https://github.com/javascript-obfuscator/javascript-obfuscator#options)

## ⚠️ Legal Considerations

- Obfuscation is legal but may violate some open-source licenses
- Check licenses of dependencies before obfuscating
- Some licenses require source code availability

