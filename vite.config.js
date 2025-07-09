import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',        // Cho phép truy cập từ máy khác
    port: 5173,             // Chọn port mong muốn
    strictPort: true,       // Không tự đổi nếu port đang bị chiếm
  }
})
