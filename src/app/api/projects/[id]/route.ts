import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pool } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, colors } = await request.json()
    const { id: projectId } = await params

    const client = await pool.connect()
    try {
      const result = await client.query(
        `UPDATE projects 
         SET name = COALESCE($1, name), 
             colors = COALESCE($2, colors), 
             updated_at = NOW() 
         WHERE id = $3 AND user_id = $4 
         RETURNING *`,
        [name, colors ? JSON.stringify(colors) : null, projectId, session.user.id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

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
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
        [projectId, session.user.id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}