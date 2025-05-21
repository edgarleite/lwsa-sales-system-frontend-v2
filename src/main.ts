import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import authPlugin from './plugins/auth-plugin';

const app = createApp(App);

app.use(router);
app.use(authPlugin); // Registrar o plugin de autenticação

app.mount('#app');