import { createRouter, createWebHistory } from 'vue-router'

const routes=[
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/Index.vue'),
    },
    {
        path: '/test',
        name: 'test',
        component: () => import('@/tests/TestSize.vue'),
    }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
