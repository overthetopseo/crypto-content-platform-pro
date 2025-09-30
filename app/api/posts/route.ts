import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Get all posts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { authorId: userId }
    
    if (status) {
      where.status = status
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true }
              }
            }
          },
          _count: {
            select: { tags: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// Create a new post
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const postSchema = z.object({
      title: z.string().min(1, 'Title is required'),
      content: z.string().min(1, 'Content is required'),
      slug: z.string().min(1, 'Slug is required'),
      excerpt: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).default('DRAFT'),
      publishedAt: z.string().optional(),
      categoryId: z.string().optional(),
      tagIds: z.array(z.string()).optional()
    })

    const validatedData = postSchema.parse(body)

    // Check if slug is unique
    const existingPost = await db.post.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      )
    }

    // Ensure user exists in database
    let user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // Create user if not exists
      user = await db.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com` // Placeholder - would be populated from Clerk
        }
      })
    }

    // Create the post
    const postData: any = {
      title: validatedData.title,
      content: validatedData.content,
      slug: validatedData.slug,
      excerpt: validatedData.excerpt,
      status: validatedData.status,
      authorId: user.id,
      categoryId: validatedData.categoryId || null
    }

    if (validatedData.publishedAt) {
      postData.publishedAt = new Date(validatedData.publishedAt)
    }

    const post = await db.post.create({
      data: postData,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    // Add tags if provided
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      const postTags = validatedData.tagIds.map(tagId => ({
        postId: post.id,
        tagId
      }))

      await db.postTag.createMany({
        data: postTags
      })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}