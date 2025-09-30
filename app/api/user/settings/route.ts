import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Get user settings
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in database
    let user = await db.user.findUnique({
      where: { id: userId },
      include: {
        settings: true
      }
    })

    if (!user) {
      // Create user if not exists
      user = await db.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com`, // Placeholder - would be populated from Clerk
          settings: {
            create: {
              preferences: {}
            }
          }
        },
        include: {
          settings: true
        }
      })
    }

    // Create settings if they don't exist
    if (!user.settings) {
      user.settings = await db.userSettings.create({
        data: {
          userId: user.id,
          preferences: {}
        }
      })
    }

    return NextResponse.json(user.settings)
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

// Update user settings
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const settingsSchema = z.object({
      preferences: z.object({}).optional() // Allow any JSON object for preferences
    })

    const validatedData = settingsSchema.parse(body)

    // Ensure user exists
    let user = await db.user.findUnique({
      where: { id: userId },
      include: {
        settings: true
      }
    })

    if (!user) {
      // Create user if not exists
      user = await db.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com`, // Placeholder - would be populated from Clerk
          settings: {
            create: {
              preferences: validatedData.preferences || {}
            }
          }
        },
        include: {
          settings: true
        }
      })

      return NextResponse.json(user.settings)
    }

    // Update or create settings
    const settings = await db.userSettings.upsert({
      where: { userId: user.id },
      update: {
        preferences: validatedData.preferences || {}
      },
      create: {
        userId: user.id,
        preferences: validatedData.preferences || {}
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating user settings:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}