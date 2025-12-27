# PWA Testing Checklist

## ✅ Pre-Installation Testing

### 1. Service Worker Registration
- [ ] Open DevTools (F12)
- [ ] Go to Application → Service Workers
- [ ] Verify service worker is registered and activated
- [ ] Check "Update on reload" for development

### 2. Manifest Validation
- [ ] Open DevTools → Application → Manifest
- [ ] Verify all fields are present:
  - Name: "FitTrack Pro"
  - Short name: "FitTrack"
  - Icons: 192x192 and 512x512
  - Display: "standalone"
  - Theme color: #09090b

### 3. Icon Verification
- [ ] Check that icons load without errors
- [ ] Verify icon-192.png exists
- [ ] Verify icon-512.png exists
- [ ] Verify apple-touch-icon.png exists

---

## 📱 Mobile Installation Testing

### Android (Chrome)
- [ ] Open app in Chrome
- [ ] Wait for "Add to Home Screen" prompt (or use menu)
- [ ] Install the app
- [ ] Verify icon appears on home screen
- [ ] Launch app from home screen
- [ ] Verify app opens in standalone mode (no browser UI)
- [ ] Check status bar color matches theme

### iOS (Safari)
- [ ] Open app in Safari
- [ ] Tap Share → Add to Home Screen
- [ ] Verify icon preview looks correct
- [ ] Install the app
- [ ] Launch app from home screen
- [ ] Verify standalone mode
- [ ] Check splash screen (if configured)

---

## 🌐 Network Testing

### Local Network Access
- [ ] Get computer's IP address
- [ ] Start dev server: `npm run dev`
- [ ] Access from phone: `http://YOUR_IP:3000`
- [ ] Verify app loads correctly
- [ ] Install PWA from local network
- [ ] Test all features work

### Production Build
- [ ] Build: `npm run build`
- [ ] Start: `npm start`
- [ ] Access from phone
- [ ] Install and test

---

## 📴 Offline Functionality Testing

### Initial Load
- [ ] Open app while online
- [ ] Navigate through all pages (Workouts, Nutrition, Progress, Profile)
- [ ] Ensure all assets are cached

### Offline Mode
- [ ] Enable Airplane mode on phone
- [ ] Launch app from home screen
- [ ] Verify app loads without internet

### Feature Testing (Offline)
- [ ] **Workouts**
  - [ ] Create new program
  - [ ] Add exercises to program
  - [ ] Start workout session
  - [ ] Log sets and reps
  - [ ] Complete workout
  - [ ] Delete program

- [ ] **Nutrition**
  - [ ] Log food items
  - [ ] View daily totals
  - [ ] Edit nutrition goals
  - [ ] Switch between auto/manual mode

- [ ] **Progress**
  - [ ] View workout history
  - [ ] Check program performance
  - [ ] View exercise stats
  - [ ] Check recent sessions

- [ ] **Profile**
  - [ ] Toggle theme (Dark/Light)
  - [ ] Edit notification settings
  - [ ] Update body stats

### Data Persistence
- [ ] Add data while offline
- [ ] Close app completely
- [ ] Reopen app (still offline)
- [ ] Verify data is still there
- [ ] Go back online
- [ ] Verify data persists

---

## 🎨 UI/UX Testing

### Theme Testing
- [ ] Toggle between Dark and Light mode
- [ ] Verify logo adapts to theme
- [ ] Check all pages in both themes
- [ ] Verify theme persists after app restart

### Responsive Design
- [ ] Test on different screen sizes
- [ ] Verify touch targets are adequate
- [ ] Check scrolling behavior
- [ ] Test landscape orientation

### Performance
- [ ] App loads quickly
- [ ] Smooth animations
- [ ] No lag when switching pages
- [ ] Fast data entry

---

## 🔔 Notification Testing (if enabled)

- [ ] Enable notifications in settings
- [ ] Grant notification permission
- [ ] Set time window
- [ ] Wait for notification trigger
- [ ] Verify notification appears
- [ ] Tap notification to open app

---

## 🐛 Edge Cases

### Storage Limits
- [ ] Add large amounts of data
- [ ] Verify app handles storage gracefully
- [ ] Check for error messages if storage full

### Update Testing
- [ ] Make code changes
- [ ] Rebuild app
- [ ] Refresh on device
- [ ] Verify service worker updates
- [ ] Check data is preserved

### Multi-Device
- [ ] Install on multiple devices
- [ ] Verify data is device-specific
- [ ] Test on different browsers

---

## 📊 Performance Metrics

### Lighthouse Audit
- [ ] Run Lighthouse in DevTools
- [ ] Check PWA score (should be 100)
- [ ] Verify Performance score
- [ ] Check Accessibility score
- [ ] Review Best Practices

### Expected Scores:
- PWA: 100
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+

---

## ✅ Final Checklist

- [ ] App installs correctly on Android
- [ ] App installs correctly on iOS
- [ ] All features work offline
- [ ] Data persists across sessions
- [ ] Theme switching works
- [ ] Icons display correctly
- [ ] Standalone mode works (no browser UI)
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Service worker updates properly

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Test on real devices (not just emulators)
- [ ] Test on slow network connections
- [ ] Verify HTTPS (required for PWA in production)
- [ ] Test install flow on production URL
- [ ] Verify all features work in production
- [ ] Check analytics/monitoring (if configured)
- [ ] Document any known issues
- [ ] Prepare rollback plan

---

## 📝 Notes

- Service workers only work on HTTPS (except localhost)
- iOS requires Safari for PWA installation
- Android works best with Chrome
- Clear cache if testing updates
- Use incognito/private mode for fresh testing

---

**Testing Date**: _____________  
**Tested By**: _____________  
**Device**: _____________  
**OS Version**: _____________  
**Browser**: _____________  
**Result**: ✅ Pass / ❌ Fail  
**Notes**: _____________
