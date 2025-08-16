/**
 * 相机品牌识别工具
 * 根据相机型号自动识别品牌并返回对应的logo
 */

export interface CameraBrand {
  name: string
  logo: string
  keywords: string[]
}

export const cameraBrands: CameraBrand[] = [
  {
    name: 'Canon',
    logo: '/image/camera/canon.png',
    keywords: ['canon', 'eos', 'powershot', 'rebel']
  },
  {
    name: 'Sony',
    logo: '/image/camera/sony.png',
    keywords: ['sony', 'alpha', 'a7', 'a6', 'fx', 'cyber-shot']
  },
  {
    name: 'Nikon',
    logo: '/image/camera/nikon.png',
    keywords: ['nikon', 'd850', 'd750', 'd500', 'z6', 'z7', 'coolpix']
  },
  {
    name: 'Fujifilm',
    logo: '/image/camera/fujifilm.png',
    keywords: ['fujifilm', 'fuji', 'x-t', 'x-pro', 'x-e', 'gfx']
  },
  {
    name: 'Panasonic',
    logo: '/image/camera/panasonic.png',
    keywords: ['panasonic', 'lumix', 'gh', 'g9', 'fx']
  },
  {
    name: 'Samsung',
    logo: '/image/camera/samsung.png',
    keywords: ['samsung', 'galaxy', 'nx']
  },
  {
    name: 'Huawei',
    logo: '/image/camera/huawei.png',
    keywords: ['huawei', 'p30', 'p40', 'mate', 'nova']
  },
  {
    name: 'Xiaomi',
    logo: '/image/camera/xiaomi.png',
    keywords: ['xiaomi', 'mi', 'redmi', 'poco']
  },
  {
    name: 'iPhone',
    logo: '/image/camera/iphone.png',
    keywords: ['iphone', 'apple', 'ios']
  }
]

/**
 * 根据相机型号识别品牌
 * @param cameraModel 相机型号字符串
 * @returns 匹配的品牌信息，如果没有匹配则返回null
 */
export function getCameraBrand (cameraModel: string): CameraBrand | null {
  if (!cameraModel) return null

  const modelLower = cameraModel.toLowerCase()

  for (const brand of cameraBrands) {
    for (const keyword of brand.keywords) {
      if (modelLower.includes(keyword.toLowerCase())) {
        return brand
      }
    }
  }

  return null
}

/**
 * 格式化相机型号显示
 * @param cameraModel 原始相机型号
 * @returns 格式化后的相机型号
 */
export function formatCameraModel (cameraModel: string): string {
  if (!cameraModel) return ''

  // 移除常见的前缀，保持简洁
  return cameraModel
    .replace(/^(Canon|Sony|Nikon|Fujifilm|Panasonic|Samsung|Huawei|Xiaomi|Apple)\s*/i, '')
    .trim()
}
