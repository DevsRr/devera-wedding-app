import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Camera, Instagram, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-champagne/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Heart className="w-5 h-5 text-champagne" />
              <span className="font-serif text-xl font-semibold text-soft-gray">
                Mr & Mrs De Vera
              </span>
            </div>
            <p className="text-soft-gray/70 text-sm leading-relaxed">
              A celebration of love, laughter, and happily ever after.
              Thank you for being part of our special day.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="font-serif text-lg font-semibold text-soft-gray mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              <Link to="/upload" className="text-soft-gray/70 hover:text-champagne transition-colors text-sm">
                Upload Your Photo
              </Link>
              <Link to="/gallery" className="text-soft-gray/70 hover:text-champagne transition-colors text-sm">
                View Gallery
              </Link>
              <Link to="/video" className="text-soft-gray/70 hover:text-champagne transition-colors text-sm">
                Wedding Film
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h3 className="font-serif text-lg font-semibold text-soft-gray mb-4">
              Connect
            </h3>
            <div className="flex items-center justify-center md:justify-end gap-4">
              <a href="#" className="p-2 rounded-full bg-blush/50 text-champagne hover:bg-champagne hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-blush/50 text-champagne hover:bg-champagne hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-blush/50 text-champagne hover:bg-champagne hover:text-white transition-all">
                <Camera className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-4 text-soft-gray/50 text-xs">
              June 3, 2026
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-champagne/10 text-center">
          <p className="text-soft-gray/40 text-xs">
            Made with <Heart className="w-3 h-3 inline text-champagne" /> for Mr & Mrs De Vera
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
