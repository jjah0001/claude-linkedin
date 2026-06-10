import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const serverOnlyStub = {
  name: 'server-only-stub',
  resolveId(id: string) {
    if (id === 'server-only') return id
  },
  load(id: string) {
    if (id === 'server-only') return ''
  },
}

export default defineConfig({
  plugins: [serverOnlyStub, tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
  },
})