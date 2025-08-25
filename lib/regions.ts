import pcaRaw from '@/public/lib/pca.json'

export interface RegionCity {
  name: string
}

export interface RegionProvince {
  name: string
  cities: string[]
}

export interface RegionCountry {
  code: string
  name: string
  provinces: RegionProvince[]
}

type PCAMap = Record<string, Record<string, string[]>>

const MUNICIPALITIES = new Set(['北京市', '上海市', '天津市', '重庆市'])
const SPECIAL_BUCKET_KEYS = new Set([
  '市辖区',
  '县',
  '省直辖县级行政区划',
  '自治区直辖县级行政区划'
])

function buildCNProvincesFromPCA (pca: PCAMap): RegionProvince[] {
  const provinces: RegionProvince[] = []

  Object.entries(pca).forEach(([provinceName, sub]) => {
    const cities: string[] = []

    if (MUNICIPALITIES.has(provinceName)) {
      // 直辖市：合并所有子键下的区县列表
      for (const list of Object.values(sub)) {
        cities.push(...list)
      }
    } else {
      // 普通省份：优先使用地级市名（键名）
      for (const [subKey, list] of Object.entries(sub)) {
        if (SPECIAL_BUCKET_KEYS.has(subKey)) {
          // 对于“直辖/市辖区/县”等桶，将其子项并入城市列表
          cities.push(...list)
        } else {
          cities.push(subKey)
        }
      }
    }

    // 去重并保持顺序
    const uniqueCities = Array.from(new Set(cities))

    provinces.push({
      name: provinceName,
      cities: uniqueCities
    })
  })

  return provinces
}

const cnProvinces = buildCNProvincesFromPCA(pcaRaw as unknown as PCAMap)

export const regionsData: RegionCountry[] = [
  {
    code: 'CN',
    name: '中国',
    provinces: cnProvinces
  }
]

export function getCountries (): string[] {
  return regionsData.map(r => r.name)
}

export function getProvinces (countryName?: string): string[] {
  if (!countryName) return []
  const country = regionsData.find(r => r.name === countryName)
  return country ? country.provinces.map(p => p.name) : []
}

export function getCities (countryName?: string, provinceName?: string): string[] {
  if (!countryName || !provinceName) return []
  const country = regionsData.find(r => r.name === countryName)
  if (!country) return []
  const province = country.provinces.find(p => p.name === provinceName)
  return province ? province.cities : []
}

export function getSimpleLocation (location: string): string {
  return location.replaceAll(/中国 · |省|市|区|地区|壮族自治区|回族自治区|蒙古族自治区|苗族自治区|彝族自治区|藏族自治区|维吾尔自治区|壮族自治区|回族自治区|蒙古族自治区|苗族自治区|彝族自治区/g, '')
}
