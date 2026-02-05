import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Triggering the restart command
    // Note: This assumes the server has permission to run this.
    // In a local dev environment, it should work if pm2 is in path.
    const { stdout, stderr } = await execAsync('pm2.cmd restart openclaw-engine openclaw-voice')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Gateway restart triggered',
      stdout,
      stderr 
    })
  } catch (error: any) {
    console.error('Restart failed:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to restart gateway',
      error: error.message 
    }, { status: 500 })
  }
}
