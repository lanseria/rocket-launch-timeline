import type { Config } from '@playwright/test'

export default {
  testDir: 'tests',
  timeout: 30000,
  retries: 1,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    port: 3005,
    reuseExistingServer: true,
    timeout: 60000,
  },
} satisfies Config
