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
    country: '中国',
    province: '',
    city: ''
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
        country: parsedLocation.country,
        province: parsedLocation.province,
        city: parsedLocation.city
      })
    }
  }, [item])

  const parseTags = (tagsString: string): string[] => {
    return tagsString
      .split(/[,，\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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
          isPublic: formData.isPublic
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>编辑照片</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => { setFormData(prev => ({ ...prev, title: e.target.value })) }}
              placeholder="照片标题"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => { setFormData(prev => ({ ...prev, description: e.target.value })) }}
              placeholder="照片描述..."
              rows={3}
            />
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

          <div className="space-y-2">
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => { setFormData(prev => ({ ...prev, tags: e.target.value })) }}
              placeholder="标签1, 标签2, 标签3"
            />
            <p className="text-xs text-gray-500 mt-1">用逗号分隔多个标签</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>国家</Label>
              <Select
                value={formData.country}
                onValueChange={(val) => {
                  setFormData(prev => ({ ...prev, country: val, province: '', city: '' }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择国家" />
                </SelectTrigger>
                <SelectContent>
                  {getCountries().map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>省/州</Label>
              <Select
                value={formData.province}
                onValueChange={(val) => {
                  setFormData(prev => ({ ...prev, province: val, city: '' }))
                }}
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择省/州" />
                </SelectTrigger>
                <SelectContent>
                  {getProvinces(formData.country).map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>市/地区</Label>
              <Select
                value={formData.city}
                onValueChange={(val) => {
                  setFormData(prev => ({ ...prev, city: val }))
                }}
                disabled={!formData.country || !formData.province}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择市/地区" />
                </SelectTrigger>
                <SelectContent>
                  {getCities(formData.country, formData.province).map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
