# FitTrack Pro - Personal Fitness Tracker

A modern, offline-first fitness tracking application built with Next.js, featuring a beautiful redesigned UI with dark/light theme support.

![Workouts Dark Mode](file:///C:/Users/hp/.gemini/antigravity/brain/f1b3e0fb-6a31-4743-8500-5da5c42ff268/workouts_dark_1766840911511.png)

---

## 🎯 Features

### 📊 **Workout Management**
- Create and manage custom workout programs
- Add exercises with target sets and reps
- Track workout sessions with detailed set logging
- View exercise history and last session dates
- Archive programs when no longer needed

### 🍎 **Nutrition Tracking**
- Daily calorie and macro tracking (Protein, Carbs, Fats)
- Visual progress rings and bars
- Date-based navigation to view historical data
- Quick-add functionality for logging meals
- Goal tracking with remaining calories display

### 📈 **Progress Analytics**
- Training volume charts over time
- Personal record (PR) tracking per exercise
- Session history with timestamps
- Visual data representation with modern charts
- Statistics dashboard (total sessions, volume, exercises)

### ⚖️ **Body Metrics**
- Weight and height tracking
- Weight trend indicators (up/down)
- Historical data with charts
- Easy metric logging with date stamps
- Visual progress visualization

### 🎨 **Modern UI Features**
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Glassmorphism**: Modern glass-effect navigation and cards
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Mobile-first, works on all devices
- **Offline-First**: Full functionality without internet connection
- **PWA Support**: Install as a native app

---

## 📱 Screenshots

### Workouts Page

**Dark Mode**
![Workouts Dark](file:///C:/Users/hp/.gemini/antigravity/brain/f1b3e0fb-6a31-4743-8500-5da5c42ff268/workouts_dark_1766840911511.png)

**Light Mode**
![Workouts Light](file:///C:/Users/hp/.gemini/antigravity/brain/f1b3e0fb-6a31-4743-8500-5da5c42ff268/workouts_light_1766840924375.png)

---

### Nutrition Page
![Nutrition Dark](file:///C:/Users/hp/.gemini/antigravity/brain/f1b3e0fb-6a31-4743-8500-5da5c42ff268/nutrition_dark_1766840946251.png)

Track your daily nutrition with visual progress rings and macro breakdowns.

---

### Progress Page
![Progress Dark](file:///C:/Users/hp/.gemini/antigravity/brain/f1b3e0fb-6a31-4743-8500-5da5c42ff268/progress_dark_retry_1766840974244.png)

View your training volume, personal records, and session history with beautiful charts.

---

### Body Metrics Page
![Me Dark](file:///C:/Users/hp/.gemini/antigravity/brain/f1b3e0fb-6a31-4743-8500-5da5c42ff268/me_dark_final_1766841015070.png)

Track your weight, height, and body composition over time.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Dexie.js (IndexedDB wrapper)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: @ducanh2912/next-pwa
- **Date Handling**: date-fns

---

## 🎨 Design System

### Color Palette

**Dark Theme (Default)**
- Background: `hsl(222.2 84% 4.9%)`
- Primary: `hsl(142 70% 50%)` - Vibrant Green
- Foreground: `hsl(210 40% 98%)`

**Light Theme**
- Background: `hsl(0 0% 100%)`
- Primary: `hsl(142 76% 36%)` - Green
- Foreground: `hsl(222.2 84% 4.9%)`

### UI Components

- **Glassmorphism Navigation**: Frosted glass effect with backdrop blur
- **Stat Cards**: Display key metrics with icons and trends
- **Progress Rings**: Circular progress indicators for nutrition
- **Gradient Cards**: Subtle gradients on hover
- **Smooth Animations**: Fade-in, slide-in, and scale transitions
- **Hover Effects**: Lift effect on interactive cards

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tight tracking
- **Body**: Regular weight, comfortable line-height
- **Labels**: Uppercase, wide tracking, smaller size
- **Numbers**: Tabular figures for alignment

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Access the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

### Creating a Workout Program

1. Navigate to the **Workouts** page
2. Click the **+** button in the top right
3. Enter a program name (e.g., "Push Day", "Leg Day")
4. Click **Create Program**

### Adding Exercises to a Program

1. Click **Configure** on any program card
2. Click **Add** in the Exercises section
3. Enter exercise name, target sets, and reps
4. Click **Add to Program**

### Starting a Workout Session

1. Click **Start** on any program card
2. Log your sets by entering weight and reps
3. Click **+ Set** to add more sets
4. Click **Finish Workout** when done

### Tracking Nutrition

1. Navigate to the **Nutrition** page
2. Click the **+** button
3. Enter calories and macros
4. Click **Add to Log**
5. View your progress ring and macro breakdown

### Logging Body Metrics

1. Navigate to the **Me** page
2. Click the **+** button
3. Enter your weight and height
4. Click **Save Progress**
5. View your weight trend chart

### Switching Themes

Click the **Sun/Moon** icon in the bottom navigation to toggle between dark and light themes.

---

## 💾 Data Storage

All data is stored locally in your browser using **IndexedDB** via Dexie.js:

- **Offline-First**: Works without internet connection
- **Persistent**: Data survives browser restarts
- **Private**: All data stays on your device
- **Fast**: Instant access to all your data

### Database Schema

- `programs`: Workout programs
- `exercises`: Exercise library
- `programExercises`: Exercise-to-program relationships
- `sessions`: Workout sessions
- `sets`: Individual set logs
- `nutritionLogs`: Daily nutrition entries
- `bodyMetrics`: Weight and body measurements

---

## 🎯 Key Features Explained

### Automatic UI Refresh

The app uses **Dexie React Hooks** (`useLiveQuery`) to automatically refresh the UI when data changes. No manual reloads needed!

### Offline Functionality

- All features work offline
- Data syncs automatically when online (if backend is added)
- PWA installable for native app experience

### Performance Optimizations

- Lazy loading of components
- Optimized re-renders with React hooks
- Smooth 60fps animations
- Minimal bundle size

---

## 🔮 Future Enhancements

- [ ] Cloud sync across devices
- [ ] Exercise video library
- [ ] Meal planning and recipes
- [ ] Social features and challenges
- [ ] Export data to CSV/PDF
- [ ] Advanced analytics and insights
- [ ] Custom goal setting
- [ ] Rest timer between sets

---

## 📄 License

This project is for personal use.

---

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Dexie.js** for the excellent IndexedDB wrapper
- **Recharts** for beautiful chart components
- **Framer Motion** for smooth animations

---

**Built with ❤️ for fitness enthusiasts**
