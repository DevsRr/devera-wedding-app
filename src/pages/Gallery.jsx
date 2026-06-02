import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, User, MessageSquare, Images, RefreshCw } from 'lucide-react'
import { getPhotos } from '../firebase'
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import DownloadPlugin from "yet-another-react-lightbox/plugins/download";

const Gallery = () => {
  const [photos, setPhotos] = useState([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = getPhotos((fetchedPhotos) => {
      setPhotos(fetchedPhotos)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const couplePhotos = [
    { id: 'c1', imageUrl: '/images/couple-1.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c2', imageUrl: '/images/couple-2.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c3', imageUrl: '/images/couple-3.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c4', imageUrl: '/images/couple-4.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c5', imageUrl: '/images/couple-5.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c6', imageUrl: '/images/couple-6.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c7', imageUrl: '/images/couple-7.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c8', imageUrl: '/images/couple-8.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c9', imageUrl: '/images/couple-9.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
    { id: 'c10', imageUrl: '/images/couple-10.jpg', guestName: 'Mr & Mrs De Vera', isCouplePhoto: true },
  ]

  const allPhotos = [...couplePhotos, ...photos]

  const filteredPhotos = allPhotos.filter((photo) => {
    if (filter === 'all') return true
    if (filter === 'couple') return photo.isCouplePhoto
    if (filter === 'guest') return !photo.isCouplePhoto
    return true
  })

  const lightboxSlides = filteredPhotos.map(photo => ({
    src: photo.imageUrl,
    title: photo.guestName || 'Anonymous',
    description: photo.message || '',
  }))

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <div className="min-h-screen bg-ivory pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-px bg-champagne mx-auto mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-3">
            Wedding Gallery
          </h1>
          <p className="text-soft-gray/60 max-w-xl mx-auto">
            A collection of beautiful moments from our special day
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-8 mb-10"
        >
          <div className="text-center">
            <p className="font-serif text-2xl text-champagne">{allPhotos.length}</p>
            <p className="text-soft-gray/50 text-sm">Photos</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-2xl text-champagne">{photos.length}</p>
            <p className="text-soft-gray/50 text-sm">Guest Uploads</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-2 mb-10"
        >
          {[
            { key: 'all', label: 'All Photos' },
            { key: 'couple', label: 'Couple' },
            { key: 'guest', label: 'Guest Uploads' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-champagne text-white shadow-md'
                  : 'bg-white text-soft-gray hover:bg-champagne/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-champagne animate-spin mb-4" />
            <p className="text-soft-gray/60">Loading gallery...</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={photo.imageUrl}
                      alt={photo.guestName || 'Wedding photo'}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-medium truncate">
                          {photo.guestName || 'Anonymous'}
                        </p>
                        {photo.message && (
                          <p className="text-white/70 text-xs truncate mt-1">
                            {photo.message}
                          </p>
                        )}
                      </div>
                    </div>
                    {photo.isCouplePhoto && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-champagne/90 rounded-full">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && photos.length === 0 && filter !== 'couple' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Images className="w-16 h-16 text-warm-gray mx-auto mb-4" />
            <h3 className="font-serif text-xl text-soft-gray mb-2">No photos yet</h3>
            <p className="text-soft-gray/50">Be the first to upload a photo!</p>
          </motion.div>
        )}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[DownloadPlugin]}
        animation={{ fade: 300, swipe: 300 }}
        carousel={{ finite: false }}
        render={{
          slideHeader: ({ slide }) => (
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex items-center gap-2 text-white/80">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{slide.title}</span>
              </div>
              {slide.description && (
                <p className="text-white/60 text-xs mt-1">{slide.description}</p>
              )}
            </div>
          ),
        }}
      />
    </div>
  )
}

export default Gallery
