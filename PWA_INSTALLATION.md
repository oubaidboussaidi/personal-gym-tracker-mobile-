# FitTrack Pro - PWA Installation Guide

## 📱 Installing on Your Mobile Device

FitTrack Pro is a **Progressive Web App (PWA)** that works offline and can be installed on your phone like a native app!

### ⚠️ CRITICAL: Secure Context Requirement

**Chrome for Android only allows full PWA installation (Standalone Mode) on secure connections (HTTPS or Localhost).**

If you are visiting `http://192.168.1.138:3000` (HTTP), Chrome will treat it as "Insecure" and will **ONLY create a shortcut**, not a real standalone app. This is why you still see the Chrome UI.

#### How to fix this for testing on your phone:

1. **Open Chrome** on your phone.
2. Go to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Enter your computer's address: `http://192.168.1.138:3000`
4. Change the dropdown to **"Enabled"**.
5. Tap **"Relaunch"** at the bottom.
6. Now visit the app again - you should see a pop-up saying **"Install FitTrack Pro"** instead of just "Add to Home Screen".

---

### Android Installation (Proper Way)
2. Navigate to your app URL (e.g., `http://192.168.1.xxx:3000` or your deployed URL)
3. Tap the **three dots menu** (⋮) in the top-right corner
4. Select **"Add to Home screen"** or **"Install app"**
5. Confirm the installation
6. The FitTrack Pro icon will appear on your home screen!

### iOS (iPhone/iPad) Installation

1. **Open Safari** on your iOS device (must use Safari, not Chrome)
2. Navigate to your app URL
3. Tap the **Share button** (square with arrow pointing up) at the bottom
4. Scroll down and tap **"Add to Home Screen"**
5. Edit the name if desired, then tap **"Add"**
6. The FitTrack Pro icon will appear on your home screen!

---

## 🌐 Accessing on Local Network

### For Development/Testing

1. **Find your computer's local IP address**:
   - Windows: Run `ipconfig` in Command Prompt, look for "IPv4 Address"
   - Mac/Linux: Run `ifconfig` or `ip addr`, look for your local network IP

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **On your phone**, connect to the **same Wi-Fi network** as your computer

4. **Open your phone's browser** and navigate to:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```
   Example: `http://192.168.1.105:3000`

5. **Install the app** following the instructions above

---

## 📴 Offline Usage

Once installed, FitTrack Pro works **completely offline**!

### What Works Offline:
✅ **All workout logging** - Track exercises, sets, reps, and weight  
✅ **Progress tracking** - View your workout history and PRs  
✅ **Nutrition logging** - Log meals and track macros  
✅ **Nutrition goals** - View and edit your daily targets  
✅ **Multi-day programs** - Create and manage workout templates  
✅ **All data** - Everything is stored locally on your device  

### How It Works:
- **IndexedDB** stores all your data locally (workouts, nutrition, progress)
- **Service Worker** caches the app for offline access
- **No internet required** after installation
- Data syncs automatically when you're back online (if using a backend in the future)

---

## 🎨 Features

### Workout Tracking
- Create custom workout programs
- Multi-day workout templates (Upper/Lower, PPL, etc.)
- Log sets, reps, and weight
- Track progressive overload
- Delete programs with cascade deletion

### Nutrition Tracking
- Log daily meals and macros
- Auto-calculate nutrition goals based on your stats
- Manual goal override
- Track calories, protein, carbs, and fat

### Progress Tracking
- View workout history
- Track personal records (PRs)
- Monitor volume and intensity trends
- Per-program and per-exercise analytics

### Smart Features
- **Dark/Light mode** with dynamic logo
- **Smart notifications** (optional)
- **Offline-first** architecture
- **PWA installable** on any device

---

## 🔧 Configuration

### Theme
- Toggle between Dark and Light mode using the theme switcher in the bottom navigation
- Your preference is saved locally

### Notifications (Optional)
1. Go to the **Profile** page
2. Enable notification settings
3. Set your preferred time window
4. Grant notification permissions when prompted

### Nutrition Goals
1. Go to the **Nutrition** page
2. Tap on the goals card
3. Choose **Auto** mode (calculates based on your stats) or **Manual** mode
4. Enter your body stats for auto-calculation

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Option 2: Netlify
```bash
npm run build
netlify deploy --prod
```

### Option 3: Self-Hosted
```bash
npm run build
npm start
```

---

## 🐛 Troubleshooting

### App won't install
- **Android**: Make sure you're using Chrome
- **iOS**: Make sure you're using Safari (not Chrome)
- Clear browser cache and try again

### Offline mode not working
- Make sure the app was fully loaded at least once while online
- Check that service worker is registered (open DevTools → Application → Service Workers)

### Icon not showing
- Clear the app from home screen and reinstall
- Make sure you've rebuilt the app after icon changes: `npm run build`

### Data not saving
- Check browser storage permissions
- Ensure IndexedDB is enabled in your browser
- Try clearing app data and starting fresh

---

## 📊 Data Storage

All your data is stored **locally on your device** using:
- **IndexedDB** for structured data (workouts, nutrition, programs)
- **LocalStorage** for preferences (theme, settings)

### Data Privacy
- ✅ No data is sent to external servers
- ✅ Everything stays on your device
- ✅ No tracking or analytics
- ✅ Completely private and secure

---

## 🔄 Updates

When a new version is available:
1. The app will automatically update in the background
2. Refresh the page to load the new version
3. Your data will be preserved during updates

---

## 💡 Tips

1. **Install on home screen** for the best experience
2. **Enable notifications** to stay on track with your nutrition
3. **Use offline mode** at the gym without worrying about connectivity
4. **Backup your data** periodically by exporting (feature coming soon)

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the app's built-in help (if available)
- Contact: [Your contact info]

---

## 📄 License

© 2025-2026 Oubaid Boussaidi  
All rights reserved. FitTrack Pro v1.2.0

---

**Enjoy your offline-first fitness tracking experience! 💪**
