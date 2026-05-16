import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PronosticosView from '../views/PronosticosView.vue'
import RankingView from '../views/RankingView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',              component: HomeView },
    { path: '/pronosticos',   component: PronosticosView },
    { path: '/ranking',       component: RankingView }
  ]
})

export default router