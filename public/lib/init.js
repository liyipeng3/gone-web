try {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#161b22')
    } else {
        document.documentElement.classList.remove('dark')
    }
} catch (_) {
}

let loadedLive2d = false

function loadLive2d() {
    if (window.matchMedia('(min-width: 768px)').matches && !loadedLive2d) {
        const script = document.createElement('script')
        script.src = '/lib/l2d.min.js'
        script.async = true
        document.head.appendChild(script)
        loadedLive2d = true
    }
}

loadLive2d()

window.addEventListener('resize', loadLive2d)

