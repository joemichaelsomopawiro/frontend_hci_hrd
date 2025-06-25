import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// 1. Import mitt
import mitt from 'mitt';

// 2. Buat instance Vue App dan Pinia
const app = createApp(App);
const pinia = createPinia();

// 3. Buat instance emitter
const emitter = mitt();

// 4. Setup Pinia terlebih dahulu sebelum router
app.use(pinia);

// 5. Tambahkan emitter ke dalam app
app.config.globalProperties.$emitter = emitter;

// 6. Setup router dan mount app
app.use(router);
app.mount('#app');