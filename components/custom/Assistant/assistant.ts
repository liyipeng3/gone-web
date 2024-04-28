export const assistant = function (prop: {
  hidden?: any
  model?: any
  tips?: any
  selector?: any
  content?: {
    touch?: any
    article?: string
    referer?: string
    welcome?: string
  }
} = { content: {} }) {
  const current = {
    canvas: document.getElementById('assistant') as HTMLCanvasElement,
    body: document.querySelector('.assistant-container') as HTMLDivElement,
    dialog: document.querySelector('.assistant-dialog') as HTMLDivElement,
    root: document.location.protocol + '//' + document.location.hostname + '/'
  }

  let t: any = null

  const modules = {
    rand: function (arr: string | any[]) {
      return arr[Math.floor(Math.random() * arr.length + 1) - 1]
    },
    // 创建对话框方法
    render: function (text: string | any[], times?: number | undefined) {
      if (times === undefined) times = 3000
      if (text.constructor === Array) {
        current.dialog.innerText = modules.rand(text)
      } else if (text.constructor === String) {
        current.dialog.innerText = text
      } else {
        current.dialog.innerText = '输入内容出现问题了 X_X'
      }

      current.dialog.classList.add('active')

      clearTimeout(t)
      t = setTimeout(function () {
        current.dialog.classList.remove('active')
      }, times)
    },

    // 移除方法
    destroy: function () {
      current.body.parentNode?.removeChild(current.body)
    }
  }

  /* - 提示操作 */
  const action = {
    // 欢迎
    welcome: function () {
      if (document.referrer !== '' && !document.referrer.includes(current.root)) {
        const referrer = document.createElement('a')
        referrer.href = document.referrer
        const host = referrer.hostname
        const domain = host.split('.')[1]
        if (domain === 'baidu') {
          modules.render('哈喽啊！来自 “百度” 的朋友！', 8000)
        } else if (domain === 'so') {
          modules.render('哈喽啊！来自 “360搜索” 的朋友！', 8000)
        } else if (domain === 'google') {
          modules.render('哈喽啊！来自 “Google” 的朋友！', 8000)
        } else if (domain === 'csdn') {
          modules.render('哈喽啊！来自 “CSDN” 的朋友！', 8000)
        } else {
          ((prop.content?.referer) != null) ? modules.render(prop.content?.referer.replace(/%t/, '“' + referrer.hostname + '”')) : modules.render('哈喽啊！来自 “' + referrer.hostname + '” 的朋友！')
        }
      } else if (prop.tips !== undefined) {
        let text
        const hour = new Date().getHours()

        if (hour > 22 || hour <= 5) {
          text = '你是夜猫子呀？这么晚还不睡觉，明天起的来嘛'
        } else if (hour > 5 && hour <= 8) {
          text = '早上好！'
        } else if (hour > 8 && hour <= 11) {
          text = '上午好！工作顺利嘛，不要久坐，多起来走动走动哦！'
        } else if (hour > 11 && hour <= 14) {
          text = '中午了，工作了一个上午，现在是午餐时间！'
        } else if (hour > 14 && hour <= 17) {
          text = '午后很容易犯困呢，今天的运动目标完成了吗？'
        } else if (hour > 17 && hour <= 19) {
          text = '傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~'
        } else if (hour > 19 && hour <= 21) {
          text = '晚上好，今天过得怎么样？'
        } else if (hour > 21 && hour <= 23) {
          text = '已经这么晚了呀，早点休息吧，晚安~'
        } else {
          text = '来逗我玩吧~'
        }

        modules.render(text)
      } else {
        ((prop.content?.welcome) != null) ? modules.render(prop.content?.welcome) : modules.render('欢迎来到本站！')
      }
    },
    // 文章
    article: function () {
      if (prop?.selector?.articles !== undefined) {
        const a = document.querySelectorAll(prop.selector?.articles)
        const b = ((prop.content?.article) != null) ? prop.content?.article : '想阅读 %t 吗？'

        for (let i = 0; i < a.length; i++) {
          a[i].onmouseover = function () {
            modules.render(b.replace(/%t/, `“${this.innerText as string}”`))
          }
        }
      }
    },
    // 触摸
    touch: function () {
      if (prop.content?.touch !== undefined) {
        current.canvas.onclick = function () {
          modules.render(prop.content?.touch)
        }
      } else {
        current.canvas.onclick = function () {
          modules.render(['你看到我的小熊了吗？', '嘻嘻嘻，你也要开心啊~', '好了啦~', '你喜欢我嘛？'])
        }
      }
    }
  }

  if (prop.hidden === true && window.innerWidth < 400) {
    current.body.classList.add('hidden')
  } else {
    action.welcome()
    action.article()
    action.touch()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window?.loadlive2d('assistant', prop.model)
  }

  const hitokoto = async () => {
    try {
      await fetch('/api/sentence').then(async res => await res.json()).then((res: {
        hitokoto: string
        from: string
      }) => {
        const str = `${res.hitokoto} ——《${res.from}》`
        modules.render(str, 9000)
      })
    } catch (e) {

    }
  }

  setInterval(function () {
    void hitokoto()
  }, 15000)
  // 血小板移动端适配
  const canvas = document.getElementById('assistant') as HTMLCanvasElement

  const styleW = 280
  const styleH = 280

  let dpr = 1
  if (window.devicePixelRatio !== 0) {
    dpr = window.devicePixelRatio
  }

  // const dpr = (window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1) as number

  if (dpr !== 1) {
    canvas.width = Math.round(styleW * dpr)
    canvas.height = Math.round(styleH * dpr)
    canvas.style.width = String(styleW) + 'px'
    canvas.style.height = String(styleH) + 'px'
  }
  return prop
}
