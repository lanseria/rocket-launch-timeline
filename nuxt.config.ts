import { appDescription } from './app/constants/index'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
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

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  devServer: {
    port: 3005,
  },
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },
  compatibilityDate: '2025-11-01',
  nitro: {
    experimental: {
      websocket: true,
    },
  },
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
