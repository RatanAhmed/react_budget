import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        
            colors: {
                brand: {
                    light: "#4C8577",
                    surface: "#4C8577",
                    primary: "#90B494",
                    secondary: "#718F94",
                    dark: "#545775",
                },

                // semantic aliases
                background: "#4C8577",
                card: "#4C8577",
                button: "#90B494",
                muted: "#718F94",
                foreground: "#545775",
            },
        },
    },

    plugins: [forms],
};
