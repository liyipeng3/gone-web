'use client'

import React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { type FilePreview } from './gallery-upload-utils'
import { parseTags } from '../gallery-form/location'
import RegionSelect from '../gallery-form/region-select'

interface GalleryUploadFileCardProps {
  filePreview: FilePreview
  index: number
  onRemove: (index: number) => void
  onUpdate: (index: number, updates: Partial<FilePreview>) => void
}

/**
 * 单个待上传文件的预览与元信息表单。
 */
const GalleryUploadFileCard: React.FC<GalleryUploadFileCardProps> = ({
  filePreview,
  index,
  onRemove,
  onUpdate
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={filePreview.preview}
              alt={filePreview.title}
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={() => { onRemove(index) }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow"
            aria-label="移除"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`title-${index}`}>标题 *</Label>
              <Input
                id={`title-${index}`}
                value={filePreview.title}
                onChange={(e) => {
                  onUpdate(index, {
                    title: e.target.value,
                    errors: {
                      ...filePreview.errors,
                      title: false
                    }
                  })
                }}
                placeholder="照片标题"
                className={filePreview.errors?.title ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {filePreview.errors?.title && (
                <p className="text-sm text-red-500">请填写照片标题</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`category-${index}`}>分类</Label>
              <Input
                id={`category-${index}`}
                value={filePreview.category}
                onChange={(e) => { onUpdate(index, { category: e.target.value }) }}
                placeholder="如：旅行、生活、摄影"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`description-${index}`}>描述</Label>
            <Textarea
              id={`description-${index}`}
              value={filePreview.description}
              onChange={(e) => { onUpdate(index, { description: e.target.value }) }}
              placeholder="照片描述..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`tags-${index}`}>标签</Label>
              <Input
                id={`tags-${index}`}
                value={filePreview.tags.join(', ')}
                onChange={(e) => { onUpdate(index, { tags: parseTags(e.target.value) }) }}
                placeholder="标签1, 标签2, 标签3"
              />
            </div>
            <div className="space-y-2">
              <DateTimePicker
                label="拍摄时间"
                value={filePreview.takenAt}
                onChange={(date) => {
                  onUpdate(index, {
                    takenAt: date,
                    errors: {
                      ...filePreview.errors,
                      takenAt: false
                    }
                  })
                }}
                placeholder="选择拍摄日期和时间"
                error={filePreview.errors?.takenAt}
                required
              />
              {filePreview.errors?.takenAt && (
                <p className="text-sm text-red-500">请填写拍摄时间</p>
              )}
            </div>
          </div>

          <RegionSelect
            value={{ country: filePreview.country, province: filePreview.province, city: filePreview.city }}
            errors={filePreview.errors}
            onCountryChange={(country) => {
              onUpdate(index, {
                country,
                province: undefined,
                city: undefined,
                errors: { ...filePreview.errors, country: false, province: false, city: false }
              })
            }}
            onProvinceChange={(province) => {
              onUpdate(index, {
                province,
                city: undefined,
                errors: { ...filePreview.errors, province: false, city: false }
              })
            }}
            onCityChange={(city) => {
              onUpdate(index, {
                city,
                errors: { ...filePreview.errors, city: false }
              })
            }}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id={`public-${index}`}
              checked={filePreview.isPublic}
              onCheckedChange={(checked) => { onUpdate(index, { isPublic: checked }) }}
            />
            <Label htmlFor={`public-${index}`}>公开显示</Label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GalleryUploadFileCard
