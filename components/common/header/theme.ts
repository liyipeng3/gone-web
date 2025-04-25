const updateTheme = () => {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark', 'changing-theme')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#161b22')
  } else {
    document.documentElement.classList.remove('dark', 'changing-theme')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff')
  }
  window.setTimeout(() => {
    document.documentElement.classList.remove('changing-theme')
  })
}

const setTheme = (theme: 'dark' | 'light') => {
  switch (theme) {
    case 'dark':
      localStorage.theme = 'dark'
      break
    case 'light':
      localStorage.theme = 'light'
      break
    default:
      break
  }

  updateTheme()
}

export { updateTheme, setTheme }
