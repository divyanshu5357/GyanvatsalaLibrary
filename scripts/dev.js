#!/usr/bin/env node

const http = require('http')
const { spawn } = require('child_process')

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const port = Number(process.env.PORT) || 3001
const children = []
let shuttingDown = false

function runNpm(args) {
  const child = spawn(npmCmd, args, { stdio: 'inherit' })
  children.push(child)

  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    shuttingDown = true

    for (const otherChild of children) {
      if (otherChild !== child && !otherChild.killed) {
        otherChild.kill('SIGTERM')
      }
    }

    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 0)
  })

  return child
}

function cleanupAndExit(signal) {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }

  process.exit(0)
}

function checkHealth() {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: '127.0.0.1',
        port,
        path: '/health',
        timeout: 1000,
      },
      (response) => {
        let body = ''
        response.on('data', chunk => {
          body += chunk
        })
        response.on('end', () => {
          try {
            const parsed = JSON.parse(body)
            resolve(response.statusCode === 200 && parsed?.status === 'ok')
          } catch (_) {
            resolve(false)
          }
        })
      }
    )

    request.on('timeout', () => {
      request.destroy()
      resolve(false)
    })

    request.on('error', () => {
      resolve(false)
    })
  })
}

async function main() {
  process.on('SIGINT', cleanupAndExit)
  process.on('SIGTERM', cleanupAndExit)

  const backendRunning = await checkHealth()

  if (backendRunning) {
    console.log(`Backend already running on http://localhost:${port}; starting frontend only.`)
    runNpm(['run', 'dev', '--workspace', 'client'])
    return
  }

  runNpm(['run', 'dev', '--workspace', 'server'])
  runNpm(['run', 'dev', '--workspace', 'client'])
}

main().catch((error) => {
  console.error('Failed to start development environment')
  console.error(error)
  process.exit(1)
})
