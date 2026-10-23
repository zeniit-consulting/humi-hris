import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2022',
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    if (id.includes('mapbox-gl')) {
                        return 'vendor-mapbox';
                    }

                    if (id.includes('@vladmandic/face-api')) {
                        return 'vendor-faceapi';
                    }
                },
            },
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: process.env.VITE_REACT_COMPILER === 'true'
                ? {
                      plugins: ['babel-plugin-react-compiler'],
                  }
                : undefined,
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
