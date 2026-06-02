import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date, pattern = 'MMMM d, yyyy') => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return format(d, pattern)
}

export const timeAgo = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export const formatWeddingDate = () => {
  return format(new Date(2026, 5, 3), 'MMMM d, yyyy') // June 3, 2026
}
