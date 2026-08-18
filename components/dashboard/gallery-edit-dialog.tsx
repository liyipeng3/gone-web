'use client'

import React, { useState, useEffect } from 'react'
import type { gallery } from '@prisma/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import RegionSelect from './gallery-form/region-select'
import { parseLocationString, parseTags, joinLocation } from './gallery-form/location'

interface GalleryEditDialogProps {
  item: gallery
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GalleryEditDialog: React.FC<GalleryEditDialogProps> = ({
  item,
  open,
  onOpenChange
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    location: '',
    isPublic: true,
    country: '中国' as string | undefined,
    province: '' as string | undefined,
    city: '' as string | undefined,
    takenAt: null as Date | null,
    errors: {
      title: false,
      country: false,
      province: false,
      city: false,
      takenAt: false
    }
  })

  useEffect(() => {
    if (item) {
      const tags = item.tags ? JSON.parse(item.tags) : []
      const parsedLocation = parseLocationString(item.location)
      setFormData({
        title: item.title ?? '',
        description: item.description ?? '',
        category: item.category ?? '',
        tags: tags.join(', '),
        location: item.location ?? '',
        isPublic: item.isPublic,
        country: parsedLocation.country || undefined,
        province: parsedLocation.province || undefined,
        city: parsedLocation.city || undefined,
        takenAt: item.takenAt ?? null,
        errors: {
          title: false,
          country: false,
          province: false,
          city: false,
          takenAt: false
        }
      })
    }
  }, [item])

  const validateForm = (): boolean => {
    const errors = {
      title: !formData.title?.trim(),
      country: !formData.country,
      province: !formData.province,
      city: !formData.city,
      takenAt: !formData.takenAt
    }

    setFormData(prev => ({ ...prev, errors }))
    return !Object.values(errors).some(error => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = validateForm()
    if (!isValid) {
      return
    }

    setLoading(true)

    try {
      const finalTakenAt = formData.takenAt
        ? Math.floor(formData.takenAt.getTime() / 1000)
        : undefined

      const response = await fetch(`/api/gallery/${item.gid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title || undefined,
          description: formData.description || undefined,
          category: formData.category || undefined,
          tags: parseTags(formData.tags),
          location: joinLocation(formData.country, formData.province, formData.city) || formData.location || undefined,
          isPublic: formData.isPublic,
          takenAt: finalTakenAt
        })
      })

      if (response.ok) {
        onOpenChange(false)
        router.refresh()
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      console.error('更新相册项失败:', error)
      alert('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑照片</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题 <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                    errors: { ...prev.errors, title: false }
                  }))
                }}
                placeholder="照片标题"
                className={formData.errors?.title ? 'border-red-500 focus:border-red-500' : ''}
                required
              />
              {formData.errors?.title && (
                <p className="text-sm text-red-500">请填写照片标题</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => { setFormData(prev => ({ ...prev, category: e.target.value })) }}
                placeholder="如：旅行、生活、摄影"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => { setFormData(prev => ({ ...prev, description: e.target.value })) }}
              placeholder="照片描述..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => { setFormData(prev => ({ ...prev, tags: e.target.value })) }}
                placeholder="标签1, 标签2, 标签3"
              />
            </div>
            <div className="space-y-2">
              <DateTimePicker
                label="拍摄时间"
                value={formData.takenAt}
                onChange={(date) => {
                  setFormData(prev => ({
                    ...prev,
                    takenAt: date,
                    errors: { ...prev.errors, takenAt: false }
                  }))
                }}
                placeholder="选择拍摄日期和时间"
                error={formData.errors?.takenAt}
                required
              />
              {formData.errors?.takenAt && (
                <p className="text-sm text-red-500">请填写拍摄时间</p>
              )}
            </div>
          </div>

          <RegionSelect
            value={{ country: formData.country, province: formData.province, city: formData.city }}
            errors={formData.errors}
            onCountryChange={(country) => {
              setFormData(prev => ({
                ...prev,
                country,
                province: undefined,
                city: undefined,
                errors: { ...prev.errors, country: false, province: false, city: false }
              }))
            }}
            onProvinceChange={(province) => {
              setFormData(prev => ({
                ...prev,
                province,
                city: undefined,
                errors: { ...prev.errors, province: false, city: false }
              }))
            }}
            onCityChange={(city) => {
              setFormData(prev => ({
                ...prev,
                city,
                errors: { ...prev.errors, city: false }
              }))
            }}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => { setFormData(prev => ({ ...prev, isPublic: checked })) }}
            />
            <Label htmlFor="isPublic">公开显示</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { onOpenChange(false) }}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default GalleryEditDialog
