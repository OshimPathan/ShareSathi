/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                },
                mero: {
                    teal: '#238b96',
                    darkTeal: '#1c6f78',
                    orange: '#eda34c',
                    darkOrange: '#d68e36'
                }
            }
        },
    },
    plugins: [],
}
