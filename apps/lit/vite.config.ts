import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        modulePreload: {
            polyfill: false,
        },
    },
    esbuild: { legalComments: "none" },
})
