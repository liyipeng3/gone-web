import { Marked } from 'marked'
import highlight from 'highlight.js'
import { markedHighlight } from 'marked-highlight'

const marked = new Marked()

const highLightExtension = markedHighlight({
  highlight: function (code, lang) {
    const language = (highlight.getLanguage(lang) != null) ? lang : 'plaintext'
    return highlight.highlightAuto(code, [language]).value
  }
})
// const renderer = {
//   image (href: any, title: any, text: any) {
//     return `<a href="${href}" class="glightbox3" data-gallery="gallery">
//                 <img src="${href}"  alt="${text}" title="${title}" />
//             </a>`
//   }
// }

marked.use(highLightExtension)
// marked.use({ renderer })

export default marked
