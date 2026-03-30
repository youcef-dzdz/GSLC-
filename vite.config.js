import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'; // <-- 1. Import React

export default defineConfig({
    plugins: [
        laravel({
            // <-- 2. Change app.js to app.jsx so Vite knows it contains React code
            input: ['resources/css/app.css', 'resources/js/app.jsx'], 
            refresh: true,
        }),
        tailwindcss(),
        react(), // <-- 3. Activate the React plugin
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});