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

marked.use(highLightExtension)

export default marked
