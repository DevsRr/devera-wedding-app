import { useState, useEffect } from 'react'
import { getPhotos } from '../firebase'

export const usePhotos = () => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = getPhotos((fetchedPhotos) => {
      setPhotos(fetchedPhotos)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { photos, loading }
}
