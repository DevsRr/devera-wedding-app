import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Film, Download, Music, Sparkles, Clock, Image as ImageIcon, Loader2, Users } from 'lucide-react'
import { getPhotos } from '../firebase'

const TRANSITIONS = ['crossfade', 'zoomBurst', 'slideLeft', 'slideUp', 'flashWhite', 'radialReveal', 'filmBurn']

const VideoGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null)
  const [loopAudio, setLoopAudio] = useState(true)
  const [allPhotos, setAllPhotos] = useState([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true)
  const [musicDuration, setMusicDuration] = useState(180)
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const progressRef = useRef(0)

  const MUSIC_URL = "https://res.cloudinary.com/db4bcdoce/video/upload/v1780425640/Cant_Help_Falling_In_Love_Instrumental_Wedding_March_ucjcso.mp3"

  const couplePhotos = [
    '/images/couple-1.jpg', '/images/couple-2.jpg', '/images/couple-3.jpg',
    '/images/couple-4.jpg', '/images/couple-5.jpg', '/images/couple-6.jpg',
    '/images/couple-7.jpg', '/images/couple-8.jpg', '/images/couple-9.jpg',
    '/images/couple-10.jpg',
  ]

  useEffect(() => {
    const audio = new Audio(MUSIC_URL)
    audio.addEventListener('loadedmetadata', () => setMusicDuration(audio.duration))
    audio.addEventListener('error', () => console.warn('Could not load music metadata'))
  }, [])

  useEffect(() => {
    setIsLoadingPhotos(true)
    const unsubscribe = getPhotos((fetchedPhotos) => {
      const guestPhotos = fetchedPhotos
        .filter(p => p.imageUrl)
        .map(p => ({ src: p.imageUrl, type: 'guest', guestName: p.guestName || 'Anonymous', message: p.message || '' }))
      const couplePhotoObjects = couplePhotos.map(src => ({ src, type: 'couple', guestName: 'Mr & Mrs De Vera', message: '' }))
      setAllPhotos([...couplePhotoObjects, ...guestPhotos])
      setIsLoadingPhotos(false)
    })
    return () => unsubscribe()
  }, [])

  const getPhotoDuration = () => {
    if (allPhotos.length === 0) return 4000
    const availableTime = (musicDuration * 1000) - 3000
    const perPhoto = availableTime / allPhotos.length
    return Math.max(3000, Math.min(8000, perPhoto + 1500))
  }

  // Fixed 4 seconds per photo
  const photoDuration = 3000
  const totalVideoDuration = allPhotos.length * photoDuration

  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  const easeInExpo = (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10)

  const drawImageCover = (ctx, img, width, height, scale = 1, offsetXExtra = 0, offsetYExtra = 0) => {
    const imgRatio = img.width / img.height
    const canvasRatio = width / height
    let drawWidth, drawHeight

    if (imgRatio > canvasRatio) {
      drawHeight = height * scale
      drawWidth = drawHeight * imgRatio
    } else {
      drawWidth = width * scale
      drawHeight = drawWidth / imgRatio
    }

    const offsetX = (width - drawWidth) / 2 + offsetXExtra
    const offsetY = (height - drawHeight) / 2 + offsetYExtra
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  }

  const drawImageContain = (ctx, img, width, height, scale = 1, offsetXExtra = 0, offsetYExtra = 0) => {
    const imgRatio = img.width / img.height
    const canvasRatio = width / height
    let drawWidth, drawHeight

    if (imgRatio > canvasRatio) {
      drawWidth = width * scale
      drawHeight = drawWidth / imgRatio
    } else {
      drawHeight = height * scale
      drawWidth = drawHeight * imgRatio
    }

    const offsetX = (width - drawWidth) / 2 + offsetXExtra
    const offsetY = (height - drawHeight) / 2 + offsetYExtra
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  }

  const renderTransition = (ctx, currentImg, nextImg, t, width, height, type, elapsed, photoDuration) => {
    const e = easeInOutCubic(t)
    const eOut = easeOutExpo(t)
    const eIn = easeInExpo(t)

    const kenBurns = Math.min((elapsed % photoDuration) / photoDuration, 1)
    const kbScale = 1 + kenBurns * 0.06

    switch (type) {
      case 'crossfade': {
        ctx.globalAlpha = 1
        drawImageContain(ctx, currentImg, width, height, kbScale)
        ctx.globalAlpha = e
        drawImageContain(ctx, nextImg, width, height, 1 + (1 - e) * 0.04)
        ctx.globalAlpha = 1
        break
      }
      case 'zoomBurst': {
        ctx.globalAlpha = 1 - eOut
        drawImageCover(ctx, currentImg, width, height, 1 + e * 0.3)
        ctx.globalAlpha = eOut
        drawImageCover(ctx, nextImg, width, height, 1.3 - e * 0.3)
        ctx.globalAlpha = 1
        break
      }
      case 'slideLeft': {
        const slide = easeInOutCubic(t) * width
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.clip()
        drawImageContain(ctx, currentImg, width, height, kbScale, -slide * 0.5, 0)
        drawImageContain(ctx, nextImg, width, height, 1, width - slide, 0)
        ctx.restore()
        ctx.fillStyle = `rgba(255,255,255,${0.6 * Math.sin(t * Math.PI)})`
        ctx.fillRect(width - slide - 2, 0, 4, height)
        break
      }
      case 'slideUp': {
        const slide = easeInOutCubic(t) * height
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, width, height)
        ctx.clip()
        drawImageContain(ctx, currentImg, width, height, kbScale, 0, -slide * 0.5)
        drawImageContain(ctx, nextImg, width, height, 1, 0, height - slide)
        ctx.restore()
        ctx.fillStyle = `rgba(255,255,255,${0.5 * Math.sin(t * Math.PI)})`
        ctx.fillRect(0, height - slide - 2, width, 4)
        break
      }
      case 'flashWhite': {
        drawImageContain(ctx, t < 0.5 ? currentImg : nextImg, width, height, kbScale)
        const flashAlpha = Math.sin(t * Math.PI)
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.95})`
        ctx.fillRect(0, 0, width, height)
        break
      }
      case 'radialReveal': {
        drawImageContain(ctx, currentImg, width, height, kbScale)
        const maxRadius = Math.sqrt(width * width + height * height) / 2
        const radius = easeInOutCubic(t) * maxRadius * 1.05
        ctx.save()
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
        ctx.clip()
        drawImageContain(ctx, nextImg, width, height, 1)
        ctx.restore()
        if (radius < maxRadius) {
          ctx.beginPath()
          ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(230, 201, 168, ${0.8 * (1 - t)})`
          ctx.lineWidth = 4
          ctx.stroke()
        }
        break
      }
      case 'filmBurn': {
        drawImageContain(ctx, currentImg, width, height, kbScale)
        const burnX = easeInOutCubic(t) * width
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, burnX, height)
        ctx.clip()
        drawImageContain(ctx, nextImg, width, height, 1)
        ctx.restore()
        const glowWidth = 60
        const burnGrad = ctx.createLinearGradient(burnX - glowWidth, 0, burnX + glowWidth * 0.3, 0)
        burnGrad.addColorStop(0, 'rgba(0,0,0,0)')
        burnGrad.addColorStop(0.4, `rgba(180, 80, 20, ${0.7 * Math.sin(t * Math.PI)})`)
        burnGrad.addColorStop(0.7, `rgba(255, 140, 0, ${0.9 * Math.sin(t * Math.PI)})`)
        burnGrad.addColorStop(0.9, `rgba(255, 255, 180, ${Math.sin(t * Math.PI)})`)
        burnGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = burnGrad
        ctx.fillRect(burnX - glowWidth, 0, glowWidth * 1.5, height)
        break
      }
      default: {
        ctx.globalAlpha = 1 - e
        drawImageContain(ctx, currentImg, width, height, kbScale)
        ctx.globalAlpha = e
        drawImageContain(ctx, nextImg, width, height, 1)
        ctx.globalAlpha = 1
      }
    }

    ctx.globalAlpha = 1
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
      const width = 960
      const height = 540
      canvas.width = width
      canvas.height = height

      const images = await Promise.all(
        allPhotos.map((photo) => new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = () => { console.warn(`Failed to load: ${photo.src}`); resolve(null) }
          img.src = photo.src
        }))
      )

      const validImages = images.filter(img => img !== null)
      const validPhotos = allPhotos.filter((_, i) => images[i] !== null)

      if (validImages.length === 0) {
        alert('No valid photos!')
        setIsGenerating(false)
        return
      }

      const videoDuration = validImages.length * photoDuration
      const transitionDuration = 800
      const transitionTypes = validImages.map((_, i) => TRANSITIONS[i % TRANSITIONS.length])

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
        const canvasStream = canvas.captureStream(24)
        destination.stream.getAudioTracks().forEach(track => canvasStream.addTrack(track))
        combinedStream = canvasStream
        await audioElement.play()
      } catch (audioErr) {
        console.warn('Audio setup failed, generating silent video:', audioErr)
        combinedStream = canvas.captureStream(30)
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
  mimeType: 'video/webm;codecs=vp8,opus',
  videoBitsPerSecond: 3000000,
  audioBitsPerSecond: 128000,
})

      const chunks = []
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

      mediaRecorder.onstop = () => {
        if (audioElement) { audioElement.pause(); audioElement = null }
        if (audioContext) audioContext.close()
        combinedStream.getTracks().forEach(track => track.stop())
        const blob = new Blob(chunks, { type: 'video/webm' })
        setGeneratedVideoUrl(URL.createObjectURL(blob))
        setIsGenerating(false)
        setProgress(100)
      }

      mediaRecorder.start(100)

      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const currentProgress = Math.min((elapsed / videoDuration) * 100, 100)

const roundedProgress = Math.round(currentProgress)

if (roundedProgress !== progressRef.current) {
  progressRef.current = roundedProgress
  setProgress(roundedProgress)
}

        if (elapsed >= videoDuration) {
          mediaRecorder.stop()
          return
        }

        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, width, height)

        const currentIndex = Math.floor(elapsed / photoDuration)
        const nextIndex = Math.min(currentIndex + 1, validImages.length - 1)
        const photoElapsed = elapsed % photoDuration

        const currentImg = validImages[currentIndex]
        const nextImg = validImages[nextIndex]
        const transType = transitionTypes[currentIndex]

        const inTransition = photoElapsed > (photoDuration - transitionDuration)
        const kenBurns = Math.min(photoElapsed / photoDuration, 1)
        const kbScale = 1 + kenBurns * 0.06
        const kbPanX = Math.sin(kenBurns * Math.PI) * 12
        const kbPanY = Math.cos(kenBurns * Math.PI) * 6

        if (!inTransition || nextIndex === currentIndex) {
          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, width, height)
          drawImageContain(ctx, currentImg, width, height, kbScale, kbPanX, kbPanY)
        } else {
          const fadeStart = photoDuration - transitionDuration
          const rawT = (photoElapsed - fadeStart) / transitionDuration
          const t = Math.max(0, Math.min(1, rawT))
          renderTransition(ctx, currentImg, nextImg, t, width, height, transType, elapsed, photoDuration)
        }

        // ===== TITLE INTRO (first 4s) =====
        if (elapsed < 4000) {
          const titleAlpha = elapsed < 1000
            ? easeInOutCubic(elapsed / 1000)
            : elapsed > 3000
              ? 1 - easeInOutCubic((elapsed - 3000) / 1000)
              : 1

          const grad = ctx.createLinearGradient(0, 0, 0, height)
          grad.addColorStop(0, `rgba(0,0,0,${titleAlpha * 0.6})`)
          grad.addColorStop(0.5, `rgba(0,0,0,${titleAlpha * 0.2})`)
          grad.addColorStop(1, `rgba(0,0,0,${titleAlpha * 0.6})`)
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, width, height)

          ctx.strokeStyle = `rgba(230, 201, 168, ${titleAlpha * 0.8})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(width / 2 - 100, height / 2 - 60)
          ctx.lineTo(width / 2 + 100, height / 2 - 60)
          ctx.stroke()

          ctx.fillStyle = `rgba(255, 255, 255, ${titleAlpha})`
          ctx.font = 'bold 58px "Playfair Display", Georgia, serif'
          ctx.textAlign = 'center'
          ctx.shadowColor = 'rgba(0,0,0,0.4)'
          ctx.shadowBlur = 8
          ctx.fillText('Mr & Mrs De Vera', width / 2, height / 2 - 8)
          ctx.shadowBlur = 0

          ctx.font = '300 20px Inter, sans-serif'
          ctx.fillStyle = `rgba(230, 201, 168, ${titleAlpha})`
          ctx.fillText('J U N E   3,   2 0 2 6', width / 2, height / 2 + 36)

          ctx.strokeStyle = `rgba(230, 201, 168, ${titleAlpha * 0.8})`
          ctx.beginPath()
          ctx.moveTo(width / 2 - 100, height / 2 + 58)
          ctx.lineTo(width / 2 + 100, height / 2 + 58)
          ctx.stroke()
        }

        // ===== OUTRO (last 5s) =====
        const outroStart = videoDuration - 5000
        if (elapsed > outroStart) {
          const outroElapsed = elapsed - outroStart
          const outroAlpha = outroElapsed < 1000
            ? easeInOutCubic(outroElapsed / 1000)
            : outroElapsed > 4000
              ? 1 - easeInOutCubic((outroElapsed - 4000) / 1000)
              : 1

          const outroGrad = ctx.createLinearGradient(0, 0, 0, height)
          outroGrad.addColorStop(0, `rgba(0,0,0,${outroAlpha * 0.6})`)
          outroGrad.addColorStop(0.5, `rgba(0,0,0,${outroAlpha * 0.2})`)
          outroGrad.addColorStop(1, `rgba(0,0,0,${outroAlpha * 0.6})`)
          ctx.fillStyle = outroGrad
          ctx.fillRect(0, 0, width, height)

          ctx.strokeStyle = `rgba(230, 201, 168, ${outroAlpha * 0.8})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(width / 2 - 120, height / 2 - 60)
          ctx.lineTo(width / 2 + 120, height / 2 - 60)
          ctx.stroke()

          ctx.fillStyle = `rgba(255, 255, 255, ${outroAlpha})`
          ctx.font = 'bold 52px "Playfair Display", Georgia, serif'
          ctx.textAlign = 'center'
          ctx.shadowColor = 'rgba(0,0,0,0.8)'
          ctx.shadowBlur = 24
          ctx.fillText('Thank You for Coming', width / 2, height / 2 - 8)
          ctx.shadowBlur = 0

          ctx.font = '300 18px Inter, sans-serif'
          ctx.fillStyle = `rgba(230, 201, 168, ${outroAlpha})`
          ctx.fillText('Mr & Mrs De Vera  ·  June 3, 2026', width / 2, height / 2 + 36)

          ctx.strokeStyle = `rgba(230, 201, 168, ${outroAlpha * 0.8})`
          ctx.beginPath()
          ctx.moveTo(width / 2 - 120, height / 2 + 58)
          ctx.lineTo(width / 2 + 120, height / 2 + 58)
          ctx.stroke()
        }

        // ===== CINEMATIC LETTERBOX BARS =====
        const barHeight = 36
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, width, barHeight)
        ctx.fillRect(0, height - barHeight, width, barHeight)

        // ===== PHOTO COUNTER (in letterbox bar) =====
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${currentIndex + 1} / ${validImages.length}`, width - 24, 23)

        // ===== PROGRESS BAR (in bottom letterbox) =====
        const barW = width - 60
        const progressBarY = height - barHeight / 2 - 1
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.fillRect(30, progressBarY, barW, 2)
        ctx.fillStyle = 'rgba(230, 201, 168, 0.85)'
        ctx.fillRect(30, progressBarY, barW * (currentProgress / 100), 2)

        // ===== GUEST NAME OVERLAY =====
        const currentPhotoData = validPhotos[currentIndex]
        if (currentPhotoData?.type === 'guest' && currentPhotoData.guestName) {
          const nameAlpha = inTransition ? 0 : Math.min(photoElapsed / 500, 1) * 0.9
          if (nameAlpha > 0) {
            const nameGrad = ctx.createLinearGradient(0, height - barHeight - 50, 0, height - barHeight)
            nameGrad.addColorStop(0, 'rgba(0,0,0,0)')
            nameGrad.addColorStop(1, `rgba(0,0,0,${nameAlpha * 0.5})`)
            ctx.fillStyle = nameGrad
            ctx.fillRect(0, height - barHeight - 50, width, 50)
            ctx.fillStyle = `rgba(255, 255, 255, ${nameAlpha})`
            ctx.font = '500 14px Inter, sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(`📷  ${currentPhotoData.guestName}`, 30, height - barHeight - 14)
          }
        }

        requestAnimationFrame(animate)
      }

      animate()

    } catch (error) {
      console.error('Video generation error:', error)
      setIsGenerating(false)
    }
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-px bg-champagne mx-auto mb-6" />
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-soft-gray mb-3">Wedding Film</h1>
          <p className="text-soft-gray/60 max-w-xl mx-auto">
            Create a cinematic video with all your photos and your wedding song
          </p>
        </motion.div>

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
            <div className="w-px h-10 bg-warm-gray" />
            <div className="text-center">
              <p className="font-serif text-2xl text-champagne">{TRANSITIONS.length}</p>
              <p className="text-soft-gray/50 text-xs">Transitions</p>
            </div>
          </div>
        </motion.div>

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
                className={`w-10 h-5 rounded-full transition-colors relative ${loopAudio ? 'bg-champagne' : 'bg-warm-gray'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${loopAudio ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* FIX: canvas must NOT be display:none — use opacity:0 + fixed position so captureStream() works */}
        <canvas
          ref={canvasRef}
          style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
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
              <button disabled className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating... {progress}%
              </button>
            )}
            {generatedVideoUrl && (
              <>
                <button onClick={generateVideo} className="btn-secondary flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Regenerate
                </button>
                <button onClick={downloadVideo} className="btn-primary flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Video
                </button>
              </>
            )}
          </div>
        </motion.div>

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
                  ? `${allPhotos.length} photos (${allPhotos.filter(p => p.type === 'guest').length} guest uploads)`
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
                  transition={{ delay: index * 0.02 }}
                  className="aspect-square rounded-lg overflow-hidden relative group"
                  title={`${photo.guestName} · ${TRANSITIONS[index % TRANSITIONS.length]}`}
                >
                  <img src={photo.src} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  {photo.type === 'guest' && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-champagne rounded-full" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-soft-gray/40 text-sm">
            Music: "Can't Help Falling In Love" (Instrumental) · {allPhotos.length} photos ·{' '}
            {Math.round(totalVideoDuration / 1000)}s · 7 cinematic transitions
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default VideoGenerator