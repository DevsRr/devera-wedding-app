import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Trash2, Image as ImageIcon, Users, Film, Check, X, Lock, Eye, Download } from 'lucide-react'
import { getAllUploads, deletePhoto } from '../firebase'
import toast from 'react-hot-toast'

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [uploads, setUploads] = useState([])
  const [selectedUploads, setSelectedUploads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('photos')
  const [stats, setStats] = useState({ total: 0, today: 0, approved: 0 })

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === 'devera2026') {
      setIsAuthenticated(true)
      toast.success('Welcome, Admin!')
    } else {
      toast.error('Invalid password')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadUploads()
    }
  }, [isAuthenticated])

  const loadUploads = async () => {
    try {
      setIsLoading(true)
      const data = await getAllUploads()
      setUploads(data)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      setStats({
        total: data.length,
        today: data.filter(u => u.createdAt?.toDate?.() > today).length,
        approved: data.filter(u => u.approved !== false).length,
      })
    } catch (error) {
      console.error('Error loading uploads:', error)
      toast.error('Failed to load uploads')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (publicId, docId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return

    try {
      await deletePhoto(publicId, docId)
      setUploads(uploads.filter(u => u.id !== docId))
      toast.success('Photo deleted')
    } catch (error) {
      toast.error('Failed to delete photo')
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUploads.length} photos?`)) return

    for (const docId of selectedUploads) {
      const upload = uploads.find(u => u.id === docId)
      if (upload) {
        await deletePhoto(upload.publicId, docId)
      }
    }
    setUploads(uploads.filter(u => !selectedUploads.includes(u.id)))
    setSelectedUploads([])
    toast.success('Selected photos deleted')
  }

  const toggleSelection = (id) => {
    setSelectedUploads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 sm:p-12 shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-champagne/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-champagne" />
            </div>
            <h1 className="font-serif text-2xl text-soft-gray mb-2">Admin Access</h1>
            <p className="text-soft-gray/50 text-sm">Enter password to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-white focus:border-champagne focus:ring-2 focus:ring-champagne/20 outline-none transition-all text-soft-gray"
            />
            <button
              type="submit"
              className="w-full py-3 bg-champagne text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Access Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-champagne" />
            <h1 className="font-serif text-3xl text-soft-gray">Admin Dashboard</h1>
          </div>
          <p className="text-soft-gray/50">Manage wedding photos and content</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: ImageIcon, label: 'Total Photos', value: stats.total, color: 'bg-champagne/10 text-champagne' },
            { icon: Users, label: "Today's Uploads", value: stats.today, color: 'bg-blush/50 text-deep-rose' },
            { icon: Check, label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-600' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-soft-gray/50 text-sm">{stat.label}</p>
                    <p className="font-serif text-2xl text-soft-gray">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          {[
            { id: 'photos', label: 'All Photos', icon: ImageIcon },
            { id: 'pending', label: 'Pending', icon: Eye },
            { id: 'video', label: 'Video', icon: Film },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-champagne text-white'
                    : 'bg-white text-soft-gray hover:bg-champagne/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </motion.div>

        {selectedUploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <p className="text-soft-gray text-sm">
              {selectedUploads.length} photo{selectedUploads.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'photos' && (
          <div>
            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-champagne border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-soft-gray/50">Loading uploads...</p>
              </div>
            ) : uploads.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl">
                <ImageIcon className="w-16 h-16 text-warm-gray mx-auto mb-4" />
                <p className="text-soft-gray/50">No uploads yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {uploads.map((upload, index) => (
                  <motion.div
                    key={upload.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div 
                      className={`aspect-square rounded-xl overflow-hidden shadow-md ${
                        selectedUploads.includes(upload.id) ? 'ring-2 ring-champagne' : ''
                      }`}
                    >
                      <img
                        src={upload.imageUrl}
                        alt={upload.guestName || 'Upload'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleSelection(upload.id)}
                        className={`p-2 rounded-full transition-colors ${
                          selectedUploads.includes(upload.id) 
                            ? 'bg-champagne text-white' 
                            : 'bg-white/20 text-white hover:bg-white/40'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(upload.publicId, upload.id)}
                        className="p-2 bg-white/20 rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs text-soft-gray truncate">{upload.guestName || 'Anonymous'}</p>
                      <p className="text-xs text-soft-gray/40">
                        {upload.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Eye className="w-16 h-16 text-warm-gray mx-auto mb-4" />
            <p className="text-soft-gray/50">No pending approvals</p>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Film className="w-16 h-16 text-champagne mx-auto mb-4" />
            <h3 className="font-serif text-xl text-soft-gray mb-2">Video Generation</h3>
            <p className="text-soft-gray/50 mb-6">Generate a cinematic wedding film from all photos</p>
            <button
              onClick={() => window.location.href = '/video'}
              className="btn-primary"
            >
              Go to Video Generator
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
