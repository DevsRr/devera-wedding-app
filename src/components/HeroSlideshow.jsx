import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const coupleImages = [
  '/images/couple-1.jpg',
  '/images/couple-2.jpg',
  '/images/couple-3.jpg',
  '/images/couple-4.jpg',
  '/images/couple-5.jpg',
  '/images/couple-6.jpg',
  '/images/couple-7.jpg',
  '/images/couple-8.jpg',
  '/images/couple-9.jpg',
  '/images/couple-10.jpg',
]

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Preload images
    const preloadImages = async () => {
      const promises = coupleImages.map((src) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.src = src
          img.onload = resolve
          img.onerror = resolve
        })
      })
      await Promise.all(promises)
      setIsLoaded(true)
    }
    preloadImages()
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coupleImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isLoaded])

  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section')
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Ken Burns Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.15 }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 1.5 },
            scale: { duration: 8, ease: 'linear' }
          }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${coupleImages[currentIndex]})` }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse-slow" />
        <div className="absolute bottom-32 right-16 w-24 h-24 border border-champagne/20 rounded-full animate-pulse-slow animation-delay-400" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/5 rounded-full animate-pulse-slow animation-delay-200" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-6"
        >
          <div className="w-16 h-px bg-champagne/60 mx-auto mb-6" />
          <p className="text-champagne/90 text-sm sm:text-base tracking-[0.3em] uppercase font-medium">
            We are getting married
          </p>
          <div className="w-16 h-px bg-champagne/60 mx-auto mt-6" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white font-bold mb-4"
        >
          Mr & Mrs
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl text-champagne/90 mb-8"
        >
          De Vera
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mb-10"
        >
          <p className="text-white/80 text-lg sm:text-xl font-light tracking-wide">
            June 3, 2026
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="text-white/60 text-base sm:text-lg mb-10 max-w-md"
        >
          Share your moments with us 💖
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToUpload}
          className="btn-primary text-base sm:text-lg shadow-xl shadow-champagne/20"
        >
          Upload Your Photo
        </motion.button>

        {/* Slide Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2"
        >
          {coupleImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'bg-champagne w-8' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSlideshow
