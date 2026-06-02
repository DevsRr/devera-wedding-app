import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore'

// Your Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
}

// Initialize Firebase (Firestore + Auth only, NO Storage)
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "db4bcdoce"
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "YOUR_UPLOAD_PRESET"

// Upload image to Cloudinary
export const uploadToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Cloudinary upload failed')
  }

  const data = await response.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
    thumbnailUrl: data.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/'),
  }
}

// Delete image from Cloudinary (requires backend signature in production)
export const deleteFromCloudinary = async (publicId) => {
  console.log('Image deleted from Firestore. Cloudinary cleanup can be done via admin.')
  return true
}

// ============================================
// FIRESTORE FUNCTIONS
// ============================================

// Anonymous authentication
export const signInAnonymous = async () => {
  try {
    const result = await signInAnonymously(auth)
    return result.user
  } catch (error) {
    console.error('Anonymous auth error:', error)
    throw error
  }
}

// Save photo metadata to Firestore + upload to Cloudinary
export const savePhoto = async (file, metadata = {}) => {
  // Upload image to Cloudinary
  const cloudinaryData = await uploadToCloudinary(file)

  // Save metadata to Firestore
  const docRef = await addDoc(collection(db, 'guestPhotos'), {
    ...metadata,
    imageUrl: cloudinaryData.url,
    thumbnailUrl: cloudinaryData.thumbnailUrl,
    publicId: cloudinaryData.publicId,
    fileName: file.name,
    fileSize: file.size,
    createdAt: serverTimestamp(),
    approved: true,
    featured: false
  })

  return { id: docRef.id, ...cloudinaryData }
}

// Get all photos (Firestore metadata with Cloudinary URLs)
export const getPhotos = (callback) => {
  const q = query(
    collection(db, 'guestPhotos'),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const photos = []
    snapshot.forEach((docSnapshot) => {
      photos.push({ id: docSnapshot.id, ...docSnapshot.data() })
    })
    callback(photos)
  }, (error) => {
    console.error('Firestore snapshot error:', error)
    callback([])
  })
}

// Delete photo (Firestore + Cloudinary)
export const deletePhoto = async (publicId, docId) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'guestPhotos', docId))
    // Note: Cloudinary deletion requires backend signature
    // For now, we just remove from Firestore
    return true
  } catch (error) {
    console.error('Error deleting photo:', error)
    throw error
  }
}

// Get all uploads for admin
export const getAllUploads = async () => {
  try {
    // Ensure user is authenticated first
    if (!auth.currentUser) {
      await signInAnonymous()
    }

    const q = query(collection(db, 'guestPhotos'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    const uploads = []
    snapshot.forEach((docSnapshot) => {
      uploads.push({ id: docSnapshot.id, ...docSnapshot.data() })
    })
    return uploads
  } catch (error) {
    console.error('Error getting uploads:', error)
    return []
  }
}

export default app
