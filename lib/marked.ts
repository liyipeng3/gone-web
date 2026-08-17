import { Marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import { markedHighlight } from 'marked-highlight'

// 按需注册常用语言，避免全量引入 highlight.js（190+ 语言）导致 bundle 膨胀
import plaintext from 'highlight.js/lib/languages/plaintext'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import shell from 'highlight.js/lib/languages/shell'
import json from 'highlight.js/lib/languages/json'
import go from 'highlight.js/lib/languages/go'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import sql from 'highlight.js/lib/languages/sql'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import rust from 'highlight.js/lib/languages/rust'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import kotlin from 'highlight.js/lib/languages/kotlin'
import swift from 'highlight.js/lib/languages/swift'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import diff from 'highlight.js/lib/languages/diff'

hljs.registerLanguage('plaintext', plaintext)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('json', json)
hljs.registerLanguage('go', go)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('diff', diff)

const marked = new Marked()

const highLightExtension = markedHighlight({
  highlight: function (code, lang) {
    // 已知语言用 highlight（更快更准）；未注册语言回退 plaintext
    const language = (hljs.getLanguage(lang) != null) ? lang : 'plaintext'
    try {
      return hljs.highlight(code, { language }).value
    } catch {
      // 兜底：任何未注册语言都不应导致渲染崩溃
      return hljs.highlight(code, { language: 'plaintext' }).value
    }
  }
})

marked.use(highLightExtension)
export default marked
