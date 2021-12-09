module.exports = {
    mode: 'jit',
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    prefix: 'tw-',
    darkMode: false, // or 'media' or 'class'
    theme: {
        fontFamily: {
            montserrat: ['Montserrat', 'sans-serif'],
        },
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        container: false,
        outline: false,
    }
}
