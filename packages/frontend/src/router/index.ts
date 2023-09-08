import HomePage from "@/pages/HomePage.vue";
import { authGuard } from "@auth0/auth0-vue";
import { createRouter, createWebHistory } from "vue-router";

const NotFoundPage = () => import("@/pages/NotFoundPage.vue");
const ProfilePage = () => import("@/pages/ProfilePage.vue");
const CallbackPage = () => import("@/pages/CallBackPage.vue");
const DashboardPage = () => import("@/pages/DashboardPage.vue");

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    beforeEnter: authGuard
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
    beforeEnter: authGuard
  },
  {
    path: "/:catchAll(.*)",
    name: "Not Found",
    component: NotFoundPage,
  },
  {
    path: "/callback",
    name: "callback",
    component: CallbackPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
