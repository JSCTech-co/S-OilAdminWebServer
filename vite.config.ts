import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    basicSsl()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    https: true,
    // proxy: {
    //   '/qlikticket': {
    //     target: 'https://dev.jsct.site',
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
  }
})
