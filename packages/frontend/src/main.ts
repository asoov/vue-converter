import { createApp } from "vue";
import { createAuth0 } from "@auth0/auth0-vue";
import App from "./app.vue";
import "./assets/css/styles.css";
import router from "./router/index";
import { Quasar, Notify } from 'quasar'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

const app = createApp(App);
console.log(import.meta.env.VITE_AUTH0_CALLBACK_URL)
app
  .use(router)
  .use(Quasar, {
    plugins: { Notify }
  })
  .use(
    createAuth0({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
      },
    })
  ).mount("#root");
