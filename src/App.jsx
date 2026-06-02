import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'))
const Upload = lazy(() => import('./pages/Upload'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Admin = lazy(() => import('./pages/Admin'))
const VideoGenerator = lazy(() => import('./pages/VideoGenerator'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-ivory">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-3 border-champagne border-t-transparent rounded-full animate-spin" />
      <p className="text-soft-gray font-serif text-lg">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/video" element={<VideoGenerator />} />
            <Route path="/event/devera-2026" element={<Upload />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export default App
