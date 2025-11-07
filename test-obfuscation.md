# Testing Obfuscation

## Steps to Verify Obfuscation is Working

1. **Clean previous builds:**
   ```bash
   rm -rf .next
   ```

2. **Build with obfuscation:**
   ```bash
   npm run build:obfuscate
   ```

3. **Look for the obfuscation log message:**
   You should see: `🔒 Obfuscation enabled for client-side bundles`

4. **Start the production server:**
   ```bash
   npm start
   ```

5. **Check the obfuscated files:**
   - Open browser DevTools (F12)
   - Go to Sources tab
   - Navigate to `_next/static/chunks/`
   - Open any `.js` file (not from `node_modules`)
   - The code should look obfuscated with:
     - Hexadecimal variable names (like `_0x1a2b`)
     - Base64 encoded strings
     - Flattened control flow
     - Obfuscated function names

## What to Look For

**Obfuscated code should look like:**
```javascript
var _0x1a2b=['base64encodedstring','anotherstring'];
function _0x3c4d(_0x5e6f,_0x7g8h){return _0x1a2b[_0x5e6f];}
```

**NOT like:**
```javascript
function handleClick() {
  console.log('Button clicked');
}
```

## Troubleshooting

If code still looks readable:

1. **Check environment variable:**
   ```bash
   echo $OBFUSCATE  # Should output: true
   ```

2. **Verify build output:**
   Check `.next/static/chunks/` directory - files should be obfuscated

3. **Check console during build:**
   Look for obfuscation log messages

4. **Try manual build:**
   ```bash
   OBFUSCATE=true npm run build
   ```

