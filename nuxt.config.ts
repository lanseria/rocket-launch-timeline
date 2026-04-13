import { appDescription } from './app/constants/index'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxt/eslint',
  ],
  ssr: false,
  devtools: {
    enabled: false,
  },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', content: '#222222' },
      ],
    },
  },
  css: [
    '~/assets/css/main.css',
  ],
  devServer: {
    port: 3000,
  },
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  compatibilityDate: '2025-11-01',
  vite: {
    optimizeDeps: {
      include: [
        'es-toolkit',
      ],
    },
  },
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
  unocss: {
    nuxtLayers: true,
  },
})
