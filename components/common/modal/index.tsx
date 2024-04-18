import React, { type FC } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Icons } from '../icons'

interface ModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  onCancel?: () => void
  onOk?: () => void
  title?: string
  children: React.ReactNode
  loading?: boolean
  okButtonProps?: any

}

const Modal: FC<ModalProps> = ({
  visible,
  onCancel,
  onOk,
  title = '提示',
  children,
  loading = false,
  onVisibleChange,
  okButtonProps = {}
}) => {
  return (
    <AlertDialog open={visible} onOpenChange={onVisibleChange}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>
          {children}
        </AlertDialogDescription>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel>
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Button onClick={onOk} {...okButtonProps}>
              {loading
                ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
                : null}
              确认
            </Button>
          </AlertDialogAction>
        </div>

      </AlertDialogContent>
    </AlertDialog>

  )
}

export default Modal
