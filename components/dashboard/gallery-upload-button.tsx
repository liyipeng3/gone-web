'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import GalleryUploadDialog from './gallery-upload-dialog'

interface GalleryUploadButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
}

const GalleryUploadButton: React.FC<GalleryUploadButtonProps> = ({ variant = 'default' }) => {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        onClick={() => { setShowDialog(true) }}
      >
        <Plus className="mr-2 h-4 w-4" />
        上传照片
      </Button>

      <GalleryUploadDialog
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  )
}

export default GalleryUploadButton
