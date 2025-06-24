import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool, initializeDatabase } from '@/lib/database'

// Initialize database on first request
let dbInitialized = false

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase()
    dbInitialized = true
  }
}

export async function GET() {
  try {
    await ensureDbInitialized()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
        [session.user.id]
      )

      const projects = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        colors: row.colors,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      return NextResponse.json(projects)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, colors } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const client = await pool.connect()
    try {
      // Ensure user exists in database
      await client.query(
        `INSERT INTO users (id, email, name, image) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO UPDATE SET 
           email = EXCLUDED.email,
           name = EXCLUDED.name,
           image = EXCLUDED.image,
           updated_at = NOW()`,
        [session.user.id, session.user.email, session.user.name, session.user.image]
      )

      const result = await client.query(
        `INSERT INTO projects (id, user_id, name, colors, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         RETURNING *`,
        [projectId, session.user.id, name, JSON.stringify(colors || {})]
      )

      const project = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        colors: result.rows[0].colors,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }

      return NextResponse.json(project)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}