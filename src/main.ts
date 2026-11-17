import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import { startAutoSync } from './sync'

createApp(App).mount('#app')
startAutoSync()
