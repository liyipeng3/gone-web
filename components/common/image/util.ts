export async function isImageValid (src: string) {
  return await new Promise(resolve => {
    const img = document.createElement('img')
    img.onerror = () => { resolve(false) }
    img.onload = () => { resolve(true) }
    img.src = src
  })
}
