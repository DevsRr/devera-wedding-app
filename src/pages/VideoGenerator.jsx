import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Film, Download, Music, Sparkles, Clock, Image as ImageIcon, Loader2, Users } from 'lucide-react'
import { getPhotos } from '../firebase'

const VideoGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
  const [loopAudio, setLoopAudio] = useState(true)
  const [allPhotos, setAllPhotos] = useState([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true)
  const [musicDuration, setMusicDuration] = useState(180) // default 3 min
  const canvasRef = useRef(null)
  const videoRef = useRef(null)

  // HARDCODED MUSIC URL - Your Wedding Song!
  const MUSIC_URL = "https://res.cloudinary.com/db4bcdoce/video/upload/v1780425640/Cant_Help_Falling_In_Love_Instrumental_Wedding_March_ucjcso.mp3"

  // Couple photos (fallback)
  const couplePhotos = [
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

  // Get actual music duration
  useEffect(() => {
    const audio = new Audio(MUSIC_URL)
    audio.addEventListener('loadedmetadata', () => {
      setMusicDuration(audio.duration)
    })
    audio.addEventListener('error', () => {
      console.warn('Could not load music metadata, using default 180s')
    })
  }, [])

  // Fetch ALL photos from Firestore (guest uploads + couple photos)
  useEffect(() => {
    setIsLoadingPhotos(true)
    const unsubscribe = getPhotos((fetchedPhotos) => {
      const guestPhotos = fetchedPhotos
        .filter(p => p.imageUrl)
        .map(p => ({
          src: p.imageUrl,
          type: 'guest',
          guestName: p.guestName || 'Anonymous',
          message: p.message || ''
        }))

      const couplePhotoObjects = couplePhotos.map(src => ({
        src,
        type: 'couple',
        guestName: 'Mr & Mrs De Vera',
        message: ''
      }))

      const combined = [...couplePhotoObjects, ...guestPhotos]
      setAllPhotos(combined)
      setIsLoadingPhotos(false)
    })

    return () => unsubscribe()
  }, [])

  // DYNAMIC: Calculate photo duration based on music length
  const getPhotoDuration = () => {
    if (allPhotos.length === 0) return 4000
    // Give each photo equal time, with 1.5s for crossfade overlap
    // Reserve 3s for intro title
    const availableTime = (musicDuration * 1000) - 3000
    const transitionOverlap = 1500
    const perPhoto = availableTime / allPhotos.length
    return Math.max(3000, Math.min(8000, perPhoto + transitionOverlap))
  }

  const photoDuration = getPhotoDuration()
  const totalVideoDuration = allPhotos.length * photoDuration

  // Easing function for smooth transitions
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  const generateVideo = async () => {
    if (allPhotos.length === 0) {
      alert('No photos available! Upload some photos first.')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGeneratedVideoUrl(null)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const width = 1280
      const height = 720
      canvas.width = width
      canvas.height = height

      // Load ALL images
      const images = await Promise.all(
        allPhotos.map((photo) => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = () => {
              console.warn(`Failed to load image: ${photo.src}`)
              resolve(null)
            }
            img.src = photo.src
          })
        })
      )

      const validImages = images.filter(img => img !== null)
      const validPhotos = allPhotos.filter((_, i) => images[i] !== null)

      if (validImages.length === 0) {
        alert('No valid photos to generate video!')
        setIsGenerating(false)
        return
      }

      const videoDuration = validImages.length * photoDuration

      // AUDIO SETUP
      let combinedStream = null
      let audioElement = null
      let audioContext = null

      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()

        audioElement = new Audio(MUSIC_URL)
        audioElement.crossOrigin = 'anonymous'
        audioElement.loop = loopAudio

        const sourceNode = audioContext.createMediaElementSource(audioElement)
        const destination = audioContext.createMediaStreamDestination()

        sourceNode.connect(destination)
        sourceNode.connect(audioContext.destination)

        const canvasStream = canvas.captureStream(30)

        destination.stream.getAudioTracks().forEach(track => {
          canvasStream.addTrack(track)
        })

        combinedStream = canvasStream

        await audioElement.play()

      } catch (audioErr) {
        console.warn('Audio setup failed, generating silent video:', audioErr)
        combinedStream = canvas.captureStream(30)
      }

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: 128000,
      })

      const chunks = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        if (audioElement) {
          audioElement.pause()
          audioElement = null
        }
        if (audioContext) {
          audioContext.close()
        }

        combinedStream.getTracks().forEach(track => track.stop())

        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setGeneratedVideoUrl(url)
        setIsGenerating(false)
        setProgress(100)
      }

      mediaRecorder.start(100)

      // Animation loop with smooth crossfade
      const startTime = Date.now()
      const transitionDuration = 1500 // 1.5s crossfade

      const animate = () => {
        const elapsed = Date.now() - startTime
        const currentProgress = Math.min((elapsed / videoDuration) * 100, 100)
        setProgress(Math.round(currentProgress))

        if (elapsed >= videoDuration) {
          mediaRecorder.stop()
          return
        }

        // Clear canvas with black background (for letterbox effect)
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, width, height)

        const currentPhotoIndex = Math.floor(elapsed / photoDuration)
        const nextPhotoIndex = Math.min(currentPhotoIndex + 1, validImages.length - 1)
        const photoElapsed = elapsed % photoDuration

        // Calculate crossfade progress with easing
        let fadeProgress = 0
        if (photoElapsed > (photoDuration - transitionDuration)) {
          const fadeStart = photoDuration - transitionDuration
          const rawProgress = (photoElapsed - fadeStart) / transitionDuration
          fadeProgress = easeInOutCubic(rawProgress)
        }

        // ===== DRAW CURRENT PHOTO (fading out) =====
        const currentImg = validImages[currentPhotoIndex]
        const currentPhotoTime = currentPhotoIndex * photoDuration
        const currentPhotoElapsed = elapsed - currentPhotoTime
        const currentKenBurnsProgress = Math.min(currentPhotoElapsed / photoDuration, 1)

        ctx.globalAlpha = 1 - fadeProgress
        drawImageContain(ctx, currentImg, width, height, currentKenBurnsProgress)

        // ===== DRAW NEXT PHOTO (fading in) =====
        if (fadeProgress > 0 && nextPhotoIndex !== currentPhotoIndex) {
          const nextImg = validImages[nextPhotoIndex]
          ctx.globalAlpha = fadeProgress
          drawImageContain(ctx, nextImg, width, height, 0) // next photo starts fresh
        }

        ctx.globalAlpha = 1

        // ===== TITLE OVERLAY (first 4 seconds) =====
        if (elapsed < 4000) {
          const titleAlpha = elapsed < 1000 
            ? easeInOutCubic(elapsed / 1000) 
            : elapsed > 3000 
              ? 1 - easeInOutCubic((elapsed - 3000) / 1000) 
              : 1

          // Gradient overlay
          const gradient = ctx.createLinearGradient(0, 0, 0, height)
          gradient.addColorStop(0, `rgba(0, 0, 0, ${titleAlpha * 0.5})`)
          gradient.addColorStop(0.5, `rgba(0, 0, 0, ${titleAlpha * 0.3})`)
          gradient.addColorStop(1, `rgba(0, 0, 0, ${titleAlpha * 0.5})`)
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, width, height)

          ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`
          ctx.font = 'bold 56px "Playfair Display", Georgia, serif'
          ctx.textAlign = 'center'
          ctx.shadowColor = 'rgba(0,0,0,0.5)'
          ctx.shadowBlur = 20
          ctx.fillText('Mr & Mrs De Vera', width / 2, height / 2 - 25)
          ctx.shadowBlur = 0

          ctx.font = '300 22px Inter, sans-serif'
          ctx.fillStyle = `rgba(230, 201, 168, ${titleAlpha})`
          ctx.letterSpacing = '4px'
          ctx.fillText('JUNE 3, 2026', width / 2, height / 2 + 35)
          ctx.letterSpacing = '0'
        }

        // ===== PHOTO COUNTER =====
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.font = '14px Inter, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${currentPhotoIndex + 1} / ${validImages.length}`, width - 30, 35)

        // ===== PROGRESS BAR =====
        const barWidth = width - 60
        const barHeight = 3
        const barY = height - 20
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.fillRect(30, barY, barWidth, barHeight)
        
        // Progress
        ctx.fillStyle = 'rgba(230, 201, 168, 0.9)'
        ctx.fillRect(30, barY, barWidth * (currentProgress / 100), barHeight)

        // ===== GUEST NAME OVERLAY (for guest photos) =====
        const currentPhotoData = validPhotos[currentPhotoIndex]
        if (currentPhotoData?.type === 'guest' && currentPhotoData.guestName && fadeProgress < 0.8) {
          ctx.fillStyle = `rgba(0, 0, 0, ${0.4 * (1 - fadeProgress)})`
          ctx.fillRect(0, height - 70, width, 70)
          
          ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * (1 - fadeProgress)})`
          ctx.font = '16px Inter, sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(`Captured by ${currentPhotoData.guestName}`, 30, height - 35)
        }

        requestAnimationFrame(animate)
      }

      animate()

    } catch (error) {
      console.error('Video generation error:', error)
      setIsGenerating(false)
    }
  }

  // ===== ORIGINAL PHOTO LOOK: object-fit: contain =====
  // Shows full photo with black letterbox bars (no cropping)
  const drawImageContain = (ctx, img, width, height, kenBurnsProgress = 0) => {
    const imgRatio = img.width / img.height
    const canvasRatio = width / height
    
    let drawWidth, drawHeight, offsetX, offsetY
    let scale = 1 + kenBurnsProgress * 0.08 // Subtle zoom: 1.0 -> 1.08

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas - fit to width
      drawWidth = width * scale
      drawHeight = drawWidth / imgRatio
      offsetX = (width - drawWidth) / 2
      offsetY = (height - drawHeight) / 2
    } else {
      // Image is taller than canvas - fit to height
      drawHeight = height * scale
      drawWidth = drawHeight * imgRatio
      offsetX = (width - drawWidth) / 2
      offsetY = (height - drawHeight) / 2
    }

    // Subtle pan during Ken Burns (very gentle)
    const panX = Math.sin(kenBurnsProgress * Math.PI) * 10
    const panY = Math.cos(kenBurnsProgress * Math.PI) * 5

    ctx.drawImage(img, offsetX + panX, offsetY + panY, drawWidth, drawHeight)
  }

  const downloadVideo = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a')
      link.href = generatedVideoUrl
      link.download = 'DeVera-Wedding-Film-2026.webm'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-ivory pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-px bg-champagne mx-auto mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-3">
            Wedding Film
          </h1>
          <p className="text-soft-gray/60 max-w-xl mx-auto">
            Create a cinematic video with all your photos and your wedding song
          </p>
        </motion.div>

        {/* Photo Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="glass-card rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="font-serif text-2xl text-champagne">{allPhotos.length}</p>
              <p className="text-soft-gray/50 text-xs">Total Photos</p>
            </div>
            <div className="w-px h-10 bg-warm-gray" />
            <div className="text-center">
              <p className="font-serif text-2xl text-champagne">{Math.round(totalVideoDuration / 1000)}s</p>
              <p className="text-soft-gray/50 text-xs">Video Length</p>
            </div>
            <div className="w-px h-10 bg-warm-gray" />
            <div className="text-center">
              <p className="font-serif text-2xl text-champagne">{Math.round(photoDuration / 100) / 10}s</p>
              <p className="text-soft-gray/50 text-xs">Per Photo</p>
            </div>
          </div>
        </motion.div>

        {/* Now Playing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="glass-card rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-champagne/20 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-champagne" />
            </div>
            <div className="flex-1">
              <p className="text-soft-gray text-sm font-medium">Now Playing</p>
              <p className="text-soft-gray/70 text-sm">Can't Help Falling In Love (Instrumental Wedding March)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-soft-gray/50 text-xs">Loop</span>
              <button
                onClick={() => setLoopAudio(!loopAudio)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  loopAudio ? 'bg-champagne' : 'bg-warm-gray'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                  loopAudio ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview / Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl mb-8"
        >
          <div className="aspect-video bg-black rounded-2xl overflow-hidden relative">
            {generatedVideoUrl ? (
              <video
                ref={videoRef}
                src={generatedVideoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <Film className="w-16 h-16 text-champagne/40 mb-4" />
                <p className="text-white/60 text-lg font-serif">
                  {isGenerating ? 'Generating your wedding film...' : 'Your wedding film will appear here'}
                </p>
                {isGenerating && (
                  <div className="mt-6 w-64">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-champagne rounded-full"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-white/40 text-sm mt-2 text-center">{progress}%</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {!generatedVideoUrl && !isGenerating && (
              <button
                onClick={generateVideo}
                disabled={isLoadingPhotos || allPhotos.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {isLoadingPhotos ? 'Loading Photos...' : `Generate Film (${allPhotos.length} photos)`}
              </button>
            )}

            {isGenerating && (
              <button
                disabled
                className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating... {progress}%
              </button>
            )}

            {generatedVideoUrl && (
              <>
                <button
                  onClick={generateVideo}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Regenerate
                </button>
                <button
                  onClick={downloadVideo}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Video
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* All Photos Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-champagne/10 rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-champagne" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl text-soft-gray">Photos in Film</h3>
              <p className="text-soft-gray/50 text-sm">
                {allPhotos.length > 0 
                  ? `${allPhotos.length} photos will be included (${allPhotos.filter(p => p.type === 'guest').length} guest uploads)`
                  : 'Loading photos...'}
              </p>
            </div>
          </div>

          {isLoadingPhotos ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-champagne animate-spin mx-auto mb-2" />
              <p className="text-soft-gray/50 text-sm">Loading photos from gallery...</p>
            </div>
          ) : allPhotos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-warm-gray mx-auto mb-2" />
              <p className="text-soft-gray/50 text-sm">No photos yet. Upload some first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {allPhotos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="aspect-square rounded-lg overflow-hidden relative group"
                  title={photo.guestName}
                >
                  <img
                    src={photo.src}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {photo.type === 'guest' && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-champagne rounded-full" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-soft-gray/40 text-sm">
            Music: "Can't Help Falling In Love" (Instrumental) | 
            Video includes {allPhotos.length} photos | 
            Length: {Math.round(totalVideoDuration / 1000)} seconds | 
            Smooth crossfade transitions
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default VideoGenerator