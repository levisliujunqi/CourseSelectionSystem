import { createApp } from 'vue'
import ViewUIPlus from 'view-ui-plus'
import App from './App.vue'
import router from './router'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import store from './store'

const app = createApp(App)

app.use(router)
   .use(store)
   .use(ViewUIPlus)

app.mount('#app')
