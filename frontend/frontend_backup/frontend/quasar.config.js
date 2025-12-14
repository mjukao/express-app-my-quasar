// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'
import { config } from 'dotenv'

// โหลดค่า .env (API_URL)
config()

export default defineConfig(() => {
  return {
    // app boot file (/src/boot)
    boot: [],

    // CSS
    css: ['app.scss'],

    // Extras
    extras: [
      'roboto-font',
      'material-icons',
    ],

    // Build configuration
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      vueRouterMode: 'hash',

      // ⭐ สำคัญ: map API_URL ให้ Vue ใช้ผ่าน process.env.API_URL
      env: {
        API_URL: process.env.API_URL || 'http://localhost:3000',
      },

      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    // Dev server
    devServer: {
      port: 9500,
      open: true,
    },

    // Quasar framework
    framework: {
      config: {},
      plugins: [],
    },

    animations: [],

    // SSR (ไม่ได้ใช้ใน lab นี้ แต่ปล่อยไว้)
    ssr: {
      prodPort: 3000,
      middlewares: ['render'],
      pwa: false,
    },

    // PWA
    pwa: {
      workboxMode: 'GenerateSW',
    },

    // Capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Electron
    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
      builder: {
        appId: 'frontend',
      },
    },

    // BEX
    bex: {
      extraScripts: [],
    },
  }
})
