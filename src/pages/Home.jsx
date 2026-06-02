import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Camera, Heart, Image, Sparkles, Calendar, MapPin, Clock } from 'lucide-react'
import HeroSlideshow from '../components/HeroSlideshow'
import QRCodeGenerator from '../components/QRCodeGenerator'

const Home = () => {
  // Get the current domain for QR code
  const uploadUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/upload`
    : 'https://devera-wedding.app/upload'

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSlideshow />

      {/* Wedding Details Section */}
      <section className="py-20 sm:py-32 bg-ivory section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-px bg-champagne mx-auto mb-8" />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-6">
              Our Special Day
            </h2>
            <p className="text-soft-gray/70 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
              We are so excited to celebrate our love with you. Your presence means the world to us,
              and we can't wait to create beautiful memories together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: Calendar, label: 'Date', value: 'June 3, 2026' },
              { icon: Clock, label: 'Time', value: '4:00 PM' },
              { icon: MapPin, label: 'Venue', value: 'To be announced' },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-14 h-14 bg-blush/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-champagne" />
                  </div>
                  <p className="text-soft-gray/50 text-sm uppercase tracking-wider mb-2">{item.label}</p>
                  <p className="font-serif text-xl text-soft-gray">{item.value}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section id="upload-section" className="py-20 sm:py-32 bg-white section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-px bg-champagne mb-8" />
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-6">
                Share Your Moments
              </h2>
              <p className="text-soft-gray/70 text-lg leading-relaxed mb-8">
                Capture the magic of our wedding day! Upload your photos and be part of our
                live gallery. Every moment you share becomes a treasured memory.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/upload" className="btn-primary text-center flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" />
                  Upload Photo
                </Link>
                <Link to="/gallery" className="btn-secondary text-center flex items-center justify-center gap-2">
                  <Image className="w-5 h-5" />
                  View Gallery
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <div className="glass-card rounded-3xl p-8 shadow-xl">
                <QRCodeGenerator value={uploadUrl} size={220} />
                <p className="text-center text-soft-gray/60 text-sm mt-4 font-medium">
                  Scan to upload your photos
                </p>
                <p className="text-center text-soft-gray/40 text-xs mt-1">
                  {uploadUrl}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-blush/30 section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-px bg-champagne mx-auto mb-8" />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-6">
              Wedding Experience
            </h2>
            <p className="text-soft-gray/70 text-lg max-w-2xl mx-auto">
              Everything you need to be part of our special day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Instant Upload',
                description: 'Take photos and upload them in real-time. Your moments appear in our live gallery instantly.',
              },
              {
                icon: Image,
                title: 'Live Gallery',
                description: 'Watch the gallery grow throughout the day. See photos from every angle and perspective.',
              },
              {
                icon: Sparkles,
                title: 'Wedding Film',
                description: 'All photos are automatically compiled into a cinematic wedding video with beautiful music.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-card rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-16 h-16 bg-champagne/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-champagne/20 transition-colors">
                    <Icon className="w-8 h-8 text-champagne" />
                  </div>
                  <h3 className="font-serif text-xl text-soft-gray mb-3">{feature.title}</h3>
                  <p className="text-soft-gray/60 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Couple Photos Preview */}
      <section className="py-20 sm:py-32 bg-ivory section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-px bg-champagne mx-auto mb-8" />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-6">
              Our Journey
            </h2>
            <p className="text-soft-gray/70 text-lg max-w-2xl mx-auto">
              A glimpse into our love story
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {coupleImages.slice(0, 5).map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg group"
              >
                <img
                  src={src}
                  alt={`Couple photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-blush/50 to-champagne/20 section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Heart className="w-12 h-12 text-champagne mx-auto mb-6 animate-pulse-slow" />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-6">
              Be Part of Our Story
            </h2>
            <p className="text-soft-gray/70 text-lg mb-10 max-w-2xl mx-auto">
              Every photo you share becomes a part of our wedding film. Let's create something beautiful together.
            </p>
            <Link to="/upload" className="btn-primary inline-flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Start Sharing
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const coupleImages = [
  '/images/couple-1.jpg',
  '/images/couple-2.jpg',
  '/images/couple-3.jpg',
  '/images/couple-4.jpg',
  '/images/couple-5.jpg',
]

export default Home
