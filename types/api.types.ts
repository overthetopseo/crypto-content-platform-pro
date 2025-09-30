// Post related types
export interface Post {
  id: string
  title: string
  content: string
  slug: string
  excerpt?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  authorId: string
  categoryId?: string | null
  author: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  }
  category?: {
    id: string
    name: string
    slug: string
  } | null
  tags: PostTag[]
}

export interface PostTag {
  id: string
  postId: string
  tagId: string
  tag: {
    id: string
    name: string
  }
}

// Category related types
export interface Category {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
  }
}

// Tag related types
export interface Tag {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
  }
}

// User settings types
export interface UserSettings {
  id: string
  userId: string
  preferences: Record<string, any>
  createdAt: string
  updatedAt: string
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiError {
  error: string
  details?: any
}

// Request payload types
export interface CreatePostRequest {
  title: string
  content: string
  slug: string
  excerpt?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  publishedAt?: string
  categoryId?: string
  tagIds?: string[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  slug?: string
  excerpt?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  publishedAt?: string
  categoryId?: string | null
  tagIds?: string[]
}

export interface CreateCategoryRequest {
  name: string
  slug: string
}

export interface CreateTagRequest {
  name: string
}

export interface UpdateUserSettingsRequest {
  preferences: Record<string, any>
}