import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Get a specific post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await db.post.findFirst({
      where: {
        id: params.id,
        authorId: userId // Only allow users to access their own posts
      },
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
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// Update a specific post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const postSchema = z.object({
      title: z.string().min(1, 'Title is required').optional(),
      content: z.string().min(1, 'Content is required').optional(),
      slug: z.string().min(1, 'Slug is required').optional(),
      excerpt: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).optional(),
      publishedAt: z.string().optional(),
      categoryId: z.string().nullable().optional(),
      tagIds: z.array(z.string()).optional()
    })

    const validatedData = postSchema.parse(body)

    // Check if post exists and belongs to user
    const existingPost = await db.post.findFirst({
      where: {
        id: params.id,
        authorId: userId
      }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if new slug conflicts with existing posts (if slug is being updated)
    if (validatedData.slug && validatedData.slug !== existingPost.slug) {
      const slugConflict = await db.post.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.content !== undefined) updateData.content = validatedData.content
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug
    if (validatedData.excerpt !== undefined) updateData.excerpt = validatedData.excerpt
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.publishedAt !== undefined) {
      updateData.publishedAt = validatedData.publishedAt ? 
        new Date(validatedData.publishedAt) : null
    }
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId

    // Update the post
    const post = await db.post.update({
      where: { id: params.id },
      data: updateData,
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
        }
      }
    })

    // Update tags if provided
    if (validatedData.tagIds !== undefined) {
      // Remove existing tags
      await db.postTag.deleteMany({
        where: { postId: params.id }
      })

      // Add new tags
      if (validatedData.tagIds.length > 0) {
        const postTags = validatedData.tagIds.map(tagId => ({
          postId: params.id,
          tagId
        }))

        await db.postTag.createMany({
          data: postTags
        })
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating post:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// Delete a specific post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if post exists and belongs to user
    const existingPost = await db.post.findFirst({
      where: {
        id: params.id,
        authorId: userId
      }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete the post (tags will be deleted automatically due to cascade)
    await db.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}