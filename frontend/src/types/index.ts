export interface User {
  id: string
  username: string
  email: string
  role: 'USER' | 'CREATOR' | 'ADMIN'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Creator {
  id: string
  userId: string
  username: string
  avatar?: string
  bio: string
  expertise: string[]
  socialLinks?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export interface Column {
  id: string
  creatorId: string
  creator: Creator
  title: string
  description: string
  cover?: string
  category: string
  monthlyPrice: number
  quarterlyPrice: number
  yearlyPrice: number
  articleCount: number
  subscriberCount: number
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
}

export interface Article {
  id: string
  columnId: string
  title: string
  content: string
  summary?: string
  sequence: number
  createdAt: string
}

export interface AudioCourse {
  id: string
  creatorId: string
  creator: Creator
  title: string
  description: string
  cover?: string
  price: number
  episodeCount: number
  totalDuration: number
  isSeries: boolean
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
}

export interface AudioEpisode {
  id: string
  courseId: string
  title: string
  description?: string
  duration: number
  fileUrl: string
  sequence: number
  createdAt: string
}

export interface Ebook {
  id: string
  creatorId: string
  creator: Creator
  title: string
  description: string
  cover?: string
  price: number
  fileUrl: string
  fileType: 'PDF' | 'EPUB'
  pageCount?: number
  wordCount?: number
  sampleEndPercent: number
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
}

export interface Order {
  id: string
  orderNo: string
  userId: string
  type: 'COLUMN_SUBSCRIPTION' | 'AUDIO_PURCHASE' | 'EBOOK_PURCHASE'
  itemId: string
  itemTitle: string
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  paymentMethod?: 'ALIPAY'
  paidAt?: string
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  columnId: string
  column: Column
  plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED'
}

export interface PointsAccount {
  id: string
  userId: string
  balance: number
  totalEarned: number
  totalSpent: number
}

export interface PointsRecord {
  id: string
  userId: string
  type: 'EARN' | 'SPEND'
  points: number
  reason: string
  createdAt: string
}

export interface Coupon {
  id: string
  userId: string
  code: string
  type: 'DISCOUNT' | 'FREE'
  discountValue?: number
  minAmount?: number
  validFrom: string
  validUntil: string
  used: boolean
  usedAt?: string
}

export interface MallItem {
  id: string
  name: string
  description: string
  pointsCost: number
  type: 'COUPON' | 'AUDIO' | 'EBOOK'
  targetId?: string
  stock: number
  image?: string
}

export interface SearchResult {
  type: 'COLUMN' | 'ARTICLE' | 'AUDIO' | 'EBOOK'
  id: string
  title: string
  summary: string
  score: number
}
