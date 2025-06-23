import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// 1. Import mitt
import mitt from 'mitt';

// 2. Buat instance Vue App terlebih dahulu
const app = createApp(App);

// 3. Buat instance emitter
const emitter = mitt();

// 4. SEKARANG baru kita tambahkan emitter ke dalam app yang sudah ada
app.config.globalProperties.$emitter = emitter;

// 5. Lanjutkan seperti biasa
app.use(router);
app.mount('#app');