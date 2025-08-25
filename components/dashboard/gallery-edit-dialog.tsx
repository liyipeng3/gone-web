'use client'

import React, { useState, useEffect } from 'react'
import type { gallery } from '@prisma/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCountries, getProvinces, getCities } from '@/lib/regions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/date-time-picker'

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

  const parseLocationString = (location: string | null): {
    country: string
    province: string
    city: string
  } => {
    if (!location) {
      return { country: '中国', province: '', city: '' }
    }

    const parts = location.split('·').map(part => part.trim()).filter(Boolean)
    if (parts.length === 0) {
      return { country: '中国', province: '', city: '' }
    }

    if (parts.length === 1) {
      const singlePart = parts[0]
      const countries = getCountries()
      if (countries.includes(singlePart)) {
        return { country: singlePart, province: '', city: '' }
      }
      return { country: '中国', province: singlePart, city: '' }
    }

    if (parts.length === 2) {
      const countries = getCountries()
      if (countries.includes(parts[0])) {
        return { country: parts[0], province: parts[1], city: '' }
      } else {
        return { country: '中国', province: parts[0], city: parts[1] }
      }
    }

    if (parts.length >= 3) {
      return { country: parts[0], province: parts[1], city: parts[2] }
    }

    return { country: '中国', province: '', city: '' }
  }

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

  const parseTags = (tagsString: string): string[] => {
    return tagsString
      .split(/[,，\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }

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
          location: [formData.country, formData.province, formData.city].filter(Boolean).join(' · ') || formData.location || undefined,
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

          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <div className="space-y-2">
                <Label>国家 <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.country ?? ''}
                  onValueChange={(val) => {
                    setFormData(prev => ({
                      ...prev,
                      country: val || undefined,
                      province: undefined,
                      city: undefined,
                      errors: {
                        ...prev.errors,
                        country: false,
                        province: false,
                        city: false
                      }
                    }))
                  }}
                  required
                >
                  <SelectTrigger className={formData.errors?.country ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder="选择国家" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCountries().map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.errors?.country && (
                  <p className="text-sm text-red-500">请选择国家</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>省/州 <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.province ?? ''}
                  onValueChange={(val) => {
                    setFormData(prev => ({
                      ...prev,
                      province: val || undefined,
                      city: undefined,
                      errors: {
                        ...prev.errors,
                        province: false,
                        city: false
                      }
                    }))
                  }}
                  disabled={!formData.country}
                  required
                >
                  <SelectTrigger className={formData.errors?.province ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder="选择省/州" />
                  </SelectTrigger>
                  <SelectContent>
                    {getProvinces(formData.country).map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.errors?.province && (
                  <p className="text-sm text-red-500">请选择省/州</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>市/地区 <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.city ?? ''}
                  onValueChange={(val) => {
                    setFormData(prev => ({
                      ...prev,
                      city: val || undefined,
                      errors: {
                        ...prev.errors,
                        city: false
                      }
                    }))
                  }}
                  disabled={!formData.country || !formData.province}
                  required
                >
                  <SelectTrigger className={formData.errors?.city ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder="选择市/地区" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCities(formData.country, formData.province).map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.errors?.city && (
                  <p className="text-sm text-red-500">请选择市/地区</p>
                )}
              </div>
            </div>
          </div>

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
