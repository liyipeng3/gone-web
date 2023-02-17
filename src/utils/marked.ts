import { marked } from 'marked'
import highlight from 'highlight.js'

marked.setOptions({
  highlight: function (code, lang) {
    const language = (highlight.getLanguage(lang) != null) ? lang : 'plaintext'
    return highlight.highlightAuto(code, [language]).value
  }
})

export default marked
