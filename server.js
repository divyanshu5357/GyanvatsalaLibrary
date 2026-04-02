#!/usr/bin/env node

import('./server/server.js').catch((error) => {
  console.error('Failed to start backend from root server.js')
  console.error(error)
  process.exit(1)
})
