# 📱 PWA Setup & Installation Guide

This app is now a Progressive Web App (PWA) and can be installed on mobile devices like a native app.

## ✨ What's Included

- **PWA Manifest** (`public/manifest.json`) - Defines app metadata, icons, and behavior
- **App Icons** - Multiple sizes for different devices:
  - `icon-192.png` (192x192) - Standard Android
  - `icon-512.png` (512x512) - High-res Android
  - `apple-touch-icon.png` (180x180) - iOS home screen
  - `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` - Browser favicons
- **Apple Web App Support** - Configured for iOS home screen installation

## 🎨 App Icon Design

The icon features:
- **Purple-to-pink gradient background** (matching app theme)
- **White key symbol** (representing the quest)
- **Sparkle decorations** (magical/birthday theme)
- **Clean, modern design** that works at all sizes

## 🔧 Regenerating Icons

If you want to customize the icon:

1. Edit `public/icon.svg` with your design
2. Run: `npm run generate-icons`
3. Icons will be automatically generated in all required sizes

## 📲 How to Install on Mobile

### iPhone (iOS Safari)
1. Open the app in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Birthday Quest" and tap **Add**
5. The app will appear on your home screen with the custom icon

### Android (Chrome)
1. Open the app in Chrome
2. Tap the **three dots** menu (⋮)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Confirm the installation
5. The app will appear on your home screen

### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the **install icon** (⊕) in the address bar
3. Click it and confirm installation
4. The app will open in its own window

## ✅ PWA Features Enabled

- **Standalone Display**: Opens without browser UI (feels like native app)
- **Portrait Orientation**: Locked to portrait mode (mobile-optimized)
- **Theme Color**: Purple (#6366f1) status bar on Android
- **Background Color**: White loading screen
- **Maskable Icons**: Icons adapt to different device shapes (Android)

## 🧪 Testing PWA Features

### Using Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** - Should show all icon sizes and metadata
4. Check **Service Workers** - (Optional: add service worker for offline support)

### Lighthouse PWA Audit
1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App** category
4. Click **Generate report**
5. Should score 90+ with current setup

## 🚀 Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. **HTTPS Required**: PWAs require HTTPS (handled automatically by most hosts)
2. **Manifest is served**: Verify `/manifest.json` is accessible
3. **Icons are accessible**: Check all `/icon-*.png` files load
4. **Test installation**: Try installing on a real device

## 📝 Optional Enhancements

### Add Service Worker (Offline Support)
To enable offline functionality, create `public/sw.js`:
```javascript
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

Then register it in `app/layout.tsx`:
```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

### Add Screenshot for App Stores
Update `manifest.json` with actual screenshot:
```json
"screenshots": [
  {
    "src": "/screenshot-mobile.png",
    "sizes": "390x844",
    "type": "image/png",
    "form_factor": "narrow"
  }
]
```

## 🎁 Before Launch

- [ ] Test installation on target device (her phone)
- [ ] Verify icon appears correctly on home screen
- [ ] Check that app opens in standalone mode (no browser UI)
- [ ] Ensure all colors match the theme
- [ ] Test that the app works when opened from home screen

---

Made with 💝 for a special birthday!
