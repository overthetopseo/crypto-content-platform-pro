import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const postId = searchParams.get('postId')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Check if slug exists for current user
    const existingPost = await db.post.findFirst({
      where: {
        slug,
        authorId: userId,
        ...(postId && { id: { not: postId } }) // Exclude current post when editing
      }
    })

    return NextResponse.json({ 
      unique: !existingPost,
      existingPostId: existingPost?.id || null
    })
  } catch (error) {
    console.error('Error checking slug:', error)
    return NextResponse.json(
      { error: 'Failed to check slug' },
      { status: 500 }
    )
  }
}