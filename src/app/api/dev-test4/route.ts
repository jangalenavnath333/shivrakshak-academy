import { NextResponse } from 'next/server'
import { exec } from 'child_process'

export async function GET() {
  return new Promise((resolve) => {
    exec('npx tsc --noEmit', (error, stdout, stderr) => {
      resolve(NextResponse.json({ stdout, stderr, error: error?.message }))
    })
  })
}
