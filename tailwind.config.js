/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {

            textColor: {
                white: "#FFF",
                black: "#000",
            }
        },
        colors: {
            dark: "#0d1117",
            "dark-light": "#161b22",
        }
    },
    plugins: [],
}
