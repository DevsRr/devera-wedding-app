# 💍 Mr & Mrs De Vera Wedding App

A luxury, production-ready wedding web application for **Mr & Mrs De Vera** — June 3, 2026.

![Wedding App](https://img.shields.io/badge/Wedding-Mr%20%26%20Mrs%20De%20Vera-champagne)
![Date](https://img.shields.io/badge/Date-June%203%2C%202026-blush)
![Tech](https://img.shields.io/badge/Stack-React%20%2B%20Firebase-blue)

---

## ✨ Features

### 🎨 Landing Page
- Fullscreen animated Ken Burns slideshow with 10 couple photos
- Elegant typography (Playfair Display + Inter)
- Luxury color palette (Blush, Champagne, Ivory)
- Smooth scroll animations with Framer Motion

### 📱 QR Code Experience
- Auto-generated QR code pointing to `/event/devera-2026`
- Mobile-optimized upload page
- Anonymous authentication

### 📸 Guest Photo System
- **Camera capture** — Take photos directly from browser
- **File upload** — Upload from device (up to 5MB)
- **Guest name & message** — Optional personal touches
- **Confetti celebration** — Delightful success animation
- **Real-time upload progress**

### 🖼️ Live Gallery
- Masonry/grid layout with lazy loading
- Real-time updates via Firebase Firestore
- Lightbox preview with download option
- Filter by "All", "Couple", "Guest Uploads"
- Smooth Framer Motion animations

### 🎬 AI Video Generator
- Client-side video generation using Canvas API + MediaRecorder
- Ken Burns zoom effects on all photos
- Smooth crossfade transitions
- Title intro overlay
- Background music selection
- WebM format output with download

### 🔐 Admin Dashboard
- Secure password-protected access
- View all guest uploads
- Bulk select & delete photos
- Statistics overview (total, today, approved)
- Video generation management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (free tier)

### 1. Clone & Install

```bash
git clone <repository-url>
cd devera-wedding-app
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Anonymous sign-in)
4. Enable **Firestore Database** (start in test mode)
5. Enable **Storage** (start in test mode)
6. Get your Firebase config from Project Settings → General → Your apps

### 3. Environment Variables

```bash
cp .env.example .env
```

Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
devera-wedding-app/
├── public/
│   └── images/              # Couple photos (couple-1.jpg to couple-10.jpg)
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── Footer.jsx       # Footer
│   │   └── HeroSlideshow.jsx # Hero Ken Burns slideshow
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page
│   │   ├── Upload.jsx       # Photo upload page
│   │   ├── Gallery.jsx      # Live gallery
│   │   ├── VideoGenerator.jsx # AI video generator
│   │   └── Admin.jsx        # Admin dashboard
│   ├── firebase.js          # Firebase configuration & utilities
│   ├── styles/
│   │   └── index.css        # Global styles + Tailwind
│   ├── App.jsx              # Main router
│   └── main.jsx             # Entry point
├── functions/               # Firebase Cloud Functions (future)
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind theme customization
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🎨 Design System

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Blush | `#F8E1E7` | Backgrounds, accents |
| Champagne | `#E6C9A8` | Primary buttons, highlights |
| Ivory | `#FAF9F6` | Page background |
| Soft Gray | `#8B8680` | Body text |
| Warm Gray | `#D4CFC7` | Borders, dividers |

### Typography
- **Headings**: Playfair Display (serif) — Elegant, romantic
- **Body**: Inter (sans-serif) — Clean, modern

### Animations
- Ken Burns zoom on hero slideshow
- Fade + slide-up on scroll
- Smooth page transitions
- Confetti on upload success

---

## 🔧 Firebase Setup Details

### Authentication
1. Go to Authentication → Sign-in method
2. Enable **Anonymous**
3. No additional config needed

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guestPhotos/{photoId} {
      allow read: if true;
      allow create: if true;
      allow delete: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /guest-photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 🎬 Video Generation

The video generator uses the **Canvas API** + **MediaRecorder** for client-side rendering:

1. Loads all couple photos
2. Applies Ken Burns zoom effect
3. Adds smooth crossfade transitions
4. Overlays title card
5. Exports as WebM video

**Note**: For production with music sync, consider using FFmpeg.wasm or server-side rendering.

---

## 📱 Mobile Optimization

- Touch-friendly buttons (min 44px)
- Camera access on mobile browsers
- Responsive grid layouts
- Optimized image sizes
- PWA-ready structure

---

## 🔒 Security Considerations

- Anonymous auth for guests
- Admin password protection (change default!)
- File type validation (images only)
- File size limit (5MB)
- Firebase Security Rules

**Important**: Change the default admin password in production!

---

## 🚀 Deployment

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 📝 Customization

### Change Couple Names
Edit in `src/App.jsx`, `src/pages/Home.jsx`, and `src/pages/VideoGenerator.jsx`

### Change Wedding Date
Update in `src/pages/Home.jsx` and `src/pages/VideoGenerator.jsx`

### Add More Photos
1. Add images to `public/images/`
2. Update the `couplePhotos` array in components

### Change Color Theme
Edit `tailwind.config.js` color palette

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not working | Ensure HTTPS or localhost, check permissions |
| Upload fails | Check Firebase Storage rules, verify auth |
| Video won't generate | Use Chrome/Edge, check console for errors |
| Gallery not updating | Verify Firestore rules allow reads |

---

## 💖 Credits

Built with love for **Mr & Mrs De Vera**

**Technologies:**
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Firebase (Auth, Firestore, Storage)
- Lucide Icons

---

## 📄 License

Private — For wedding use only.

---

**Happy Wedding! 🎉💍**
