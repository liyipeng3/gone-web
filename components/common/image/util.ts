export async function isImageValid (src: string) {
  return await new Promise(resolve => {
    const img = document.createElement('img')
    img.onerror = () => { resolve(false) }
    img.onload = () => { resolve(true) }
    img.src = src
  })
}

export const getFilter = (blurIntensity: number) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='$'%3E%3CfeGaussianBlur stdDeviation='${blurIntensity}'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0,0 1 0 0 0,0 0 1 0 0,0 0 0 9 0'/%3E%3CfeComposite in2='SourceGraphic' operator='in'/%3E%3C/filter%3E%3C/svg%3E#$");`
