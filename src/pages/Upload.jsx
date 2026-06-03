import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Check, Heart, Sparkles, User, MessageSquare, Plus } from 'lucide-react'
import { savePhoto, signInAnonymous } from '../firebase'
import toast from 'react-hot-toast'

const UploadPage = () => {
  const [selectedImages, setSelectedImages] = useState([]) // Array of {file, previewUrl}
  const [isUploading, setIsUploading] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [message, setMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch((err) => {
        console.error('Video play error:', err)
      })
    }
  }, [isCameraOpen, cameraStream])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl))
    }
  }, [])

  const addImages = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        return false
      }
      return true
    })

    const newImages = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random()}`,
    }))

    setSelectedImages(prev => [...prev, ...newImages])
  }

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      addImages(e.target.files)
      e.target.value = '' // Reset so same files can be re-selected
    }
  }

  const removeImage = (id) => {
    setSelectedImages(prev => {
      const removed = prev.find(img => img.id === id)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter(img => img.id !== id)
    })
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false 
      })
      streamRef.current = stream
      setCameraStream(stream)
      setIsCameraOpen(true)
    } catch (err) {
      toast.error('Could not access camera. Please use file upload instead.')
      console.error('Camera error:', err)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
        addImages([file])
        closeCamera()
      }, 'image/jpeg', 0.9)
    }
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraStream(null)
    setIsCameraOpen(false)
  }

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one photo')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      await signInAnonymous()

      for (let i = 0; i < selectedImages.length; i++) {
        await savePhoto(selectedImages[i].file, {
          guestName: guestName || 'Anonymous Guest',
          message: message || '',
        })
        setUploadProgress(Math.round(((i + 1) / selectedImages.length) * 100))
      }

      setShowSuccess(true)
      triggerConfetti()
      toast.success(`${selectedImages.length} photo${selectedImages.length > 1 ? 's' : ''} uploaded successfully!`)

      setTimeout(() => {
        selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl))
        setSelectedImages([])
        setGuestName('')
        setMessage('')
        setShowSuccess(false)
        setIsUploading(false)
        setUploadProgress(0)
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
      setIsUploading(false)
    }
  }

  const triggerConfetti = () => {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '9999'
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const colors = ['#E6C9A8', '#F8E1E7', '#C9A9B6', '#FAF9F6', '#D4CFC7']

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.5
        p.rotation += p.rotationSpeed
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      })
      frame++
      if (frame < 120) {
        requestAnimationFrame(animate)
      } else {
        document.body.removeChild(canvas)
      }
    }
    animate()
  }

  const hasImages = selectedImages.length > 0

  return (
    <div className="min-h-screen bg-ivory pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-px bg-champagne mx-auto mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl text-soft-gray mb-3">
            Share Your Moment
          </h1>
          <p className="text-soft-gray/60">
            Capture the joy and upload it to our gallery
          </p>
        </motion.div>

        {/* Camera overlay */}
        <AnimatePresence>
          {isCameraOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black flex flex-col"
              style={{ height: '100vh', height: '100dvh' }}
            >
              <div className="flex-1 relative" style={{ minHeight: '50vh' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    e.target.play().catch(console.error)
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ backgroundColor: '#000' }}
                />
                <button
                  onClick={closeCamera}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 flex justify-center bg-black">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full border-4 border-champagne flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-champagne rounded-full" />
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl"
        >
          {/* Upload buttons — always visible so user can add more */}
          <div className="space-y-4">
            {!hasImages && (
              <>
                <button
                  onClick={openCamera}
                  className="w-full py-6 bg-gradient-to-r from-champagne/20 to-blush/20 rounded-2xl border-2 border-dashed border-champagne/40 hover:border-champagne transition-colors flex flex-col items-center gap-3 group"
                >
                  <div className="w-14 h-14 bg-champagne/10 rounded-full flex items-center justify-center group-hover:bg-champagne/20 transition-colors">
                    <Camera className="w-7 h-7 text-champagne" />
                  </div>
                  <span className="text-soft-gray font-medium">Take a Photo</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-warm-gray" />
                  <span className="text-soft-gray/40 text-sm">or</span>
                  <div className="flex-1 h-px bg-warm-gray" />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 bg-gradient-to-r from-blush/20 to-champagne/20 rounded-2xl border-2 border-dashed border-champagne/40 hover:border-champagne transition-colors flex flex-col items-center gap-3 group"
                >
                  <div className="w-14 h-14 bg-blush/50 rounded-full flex items-center justify-center group-hover:bg-blush transition-colors">
                    <Upload className="w-7 h-7 text-champagne" />
                  </div>
                  <span className="text-soft-gray font-medium">Upload from Device</span>
                  <span className="text-soft-gray/40 text-xs">JPG, PNG up to 5MB each · Multiple allowed</span>
                </button>
              </>
            )}

            {/* Photo grid */}
            {hasImages && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {selectedImages.map((img) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-xl overflow-hidden"
                    >
                      <img
                        src={img.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}

                  {/* Add more tile */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-champagne/40 hover:border-champagne bg-champagne/5 hover:bg-champagne/10 transition-colors flex flex-col items-center justify-center gap-1 group"
                  >
                    <Plus className="w-6 h-6 text-champagne/60 group-hover:text-champagne transition-colors" />
                    <span className="text-xs text-soft-gray/40 group-hover:text-soft-gray/60 transition-colors">Add more</span>
                  </button>
                </div>

                <p className="text-center text-soft-gray/50 text-sm">
                  {selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''} selected
                </p>

                {/* Name & message fields */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-soft-gray text-sm font-medium mb-2">
                      <User className="w-4 h-4 text-champagne" />
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-white focus:border-champagne focus:ring-2 focus:ring-champagne/20 outline-none transition-all text-soft-gray"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-soft-gray text-sm font-medium mb-2">
                      <MessageSquare className="w-4 h-4 text-champagne" />
                      Message (optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a sweet message..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-white focus:border-champagne focus:ring-2 focus:ring-champagne/20 outline-none transition-all text-soft-gray resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full py-4 bg-champagne text-white rounded-xl font-medium hover:shadow-lg hover:shadow-champagne/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : showSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      Uploaded Successfully!
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      Share {selectedImages.length} Photo{selectedImages.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>

                {isUploading && (
                  <div className="w-full h-2 bg-warm-gray/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-champagne rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>

        {/* Success overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
            >
              <div className="glass-card rounded-3xl p-8 text-center shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="w-20 h-20 bg-champagne/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-champagne" />
                  </div>
                </motion.div>
                <h3 className="font-serif text-2xl text-soft-gray mb-2">Thank You!</h3>
                <p className="text-soft-gray/60">Your photos have been added to our gallery</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-soft-gray/40 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Photos stored securely on Cloudinary</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default UploadPage