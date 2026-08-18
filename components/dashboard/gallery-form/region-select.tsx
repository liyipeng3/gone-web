'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCountries, getProvinces, getCities } from '@/lib/regions'

export interface RegionValue {
  country?: string
  province?: string
  city?: string
}

export interface RegionErrors {
  country?: boolean
  province?: boolean
  city?: boolean
}

interface RegionSelectProps {
  value: RegionValue
  errors?: RegionErrors
  onCountryChange: (country: string | undefined) => void
  onProvinceChange: (province: string | undefined) => void
  onCityChange: (city: string | undefined) => void
}

/**
 * 国家 / 省·州 / 市·地区 三级联动选择器（上传与编辑对话框共用）。
 */
const RegionSelect: React.FC<RegionSelectProps> = ({
  value,
  errors,
  onCountryChange,
  onProvinceChange,
  onCityChange
}) => {
  const { country, province, city } = value

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <div className="space-y-2">
          <Label>国家 <span className="text-red-500">*</span></Label>
          <Select
            value={country ?? ''}
            onValueChange={(val) => { onCountryChange(val || undefined) }}
            required
          >
            <SelectTrigger className={errors?.country ? 'border-red-500 focus:border-red-500' : ''}>
              <SelectValue placeholder="选择国家" />
            </SelectTrigger>
            <SelectContent>
              {getCountries().map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.country && (
            <p className="text-sm text-red-500">请选择国家</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>省/州 <span className="text-red-500">*</span></Label>
          <Select
            value={province ?? ''}
            onValueChange={(val) => { onProvinceChange(val || undefined) }}
            disabled={!country}
            required
          >
            <SelectTrigger className={errors?.province ? 'border-red-500 focus:border-red-500' : ''}>
              <SelectValue placeholder="选择省/州" />
            </SelectTrigger>
            <SelectContent>
              {getProvinces(country).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.province && (
            <p className="text-sm text-red-500">请选择省/州</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>市/地区 <span className="text-red-500">*</span></Label>
          <Select
            value={city ?? ''}
            onValueChange={(val) => { onCityChange(val || undefined) }}
            disabled={!country || !province}
            required
          >
            <SelectTrigger className={errors?.city ? 'border-red-500 focus:border-red-500' : ''}>
              <SelectValue placeholder="选择市/地区" />
            </SelectTrigger>
            <SelectContent>
              {getCities(country, province).map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.city && (
            <p className="text-sm text-red-500">请选择市/地区</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegionSelect
