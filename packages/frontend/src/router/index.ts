import HomePage from "@/pages/HomePage.vue";
import { authGuard } from "@auth0/auth0-vue";
import { createRouter, createWebHistory } from "vue-router";

const NotFoundPage = () => import("@/pages/NotFoundPage.vue");
const ProfilePage = () => import("@/pages/ProfilePage.vue");
const CallbackPage = () => import("@/pages/CallBackPage.vue");
const DashboardPage = () => import("@/pages/DashboardPage.vue");
const TransformSinglePage = () => import("@/pages/TransformSinglePage.vue");
const TransformMultiplePage = () => import("@/pages/TransformMultiplePage.vue");
const BuyTokensPage = () => import("@/pages/BuyTokensPage.vue");
const ImprintPage = () => import("@/pages/ImprintPage.vue");

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
    path: "/buytokens",
    name: "buytokens",
    component: BuyTokensPage,
    beforeEnter: authGuard
  },
  {
    path: "/transform/single",
    name: "transform-single",
    component: TransformSinglePage,
    beforeEnter: authGuard
  },
  {
    path: "/transform/multiple",
    name: "transform-multiple",
    component: TransformMultiplePage,
    beforeEnter: authGuard
  },
  {
    path: "/imprint",
    name: "imprint",
    component: ImprintPage,
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
