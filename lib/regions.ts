'use client'

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

// 精简示例数据，可按需扩充
export const regionsData: RegionCountry[] = [
  {
    code: 'CN',
    name: '中国',
    provinces: [
      { name: '北京', cities: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'] },
      { name: '上海', cities: ['黄浦区', '徐汇区', '浦东新区', '静安区'] },
      { name: '广东', cities: ['广州', '深圳', '珠海', '佛山', '东莞'] },
      { name: '江苏', cities: ['南京', '苏州', '无锡', '常州'] },
      { name: '浙江', cities: ['杭州', '宁波', '温州', '绍兴'] }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    provinces: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
      { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester'] }
    ]
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


