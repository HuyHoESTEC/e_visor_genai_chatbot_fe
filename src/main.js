import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// If you want to create WebSocket global here
// import { useWebSocket } from './composables/useWebSocket';
// const { connect, isConnected } = useWebSocket('ws://localhost:3000');
// connect(); // Auto connect when start app

const app = createApp(App);
const pinia = createPinia(); // Create pinia instance

app.use(router);
app.use(pinia);
app.use(ElementPlus);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Global properties (nếu cần, ví dụ: $socket, nhưng Composables được khuyến khích hơn)
// app.config.globalProperties.$socket = socket;

app.mount('#app')
