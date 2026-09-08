import { defineConfig, devices } from '@playwright/test'

const port = 3100
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  workers: 1,
  use: {
    baseURL,
  },
  webServer: {
    command: `pnpm exec vite dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      BETTER_AUTH_URL: baseURL,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
