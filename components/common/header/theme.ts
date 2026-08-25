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

/**
 * 初始化主题并订阅系统深色偏好变化。
 *
 * 在挂载时根据 localStorage / prefers-color-scheme 应用一次主题，
 * 并监听系统偏好变化实时切换。返回清理函数以移除监听，供 effect 卸载时调用。
 */
const initTheme = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  // On page load or when changing themes, best to add inline in `head` to avoid FOUC
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme('dark')
  } else {
    setTheme('light')
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = (event: MediaQueryListEvent): void => {
    setTheme(event.matches ? 'dark' : 'light')
  }
  mediaQuery.addEventListener('change', onChange)

  return () => {
    mediaQuery.removeEventListener('change', onChange)
  }
}

export { updateTheme, setTheme, initTheme }
