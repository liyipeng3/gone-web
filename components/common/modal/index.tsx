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

interface ModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  onCancel?: () => void
  onOk?: () => void
  title?: string
  children: React.ReactNode

}

const Modal: FC<ModalProps> = ({
  visible,
  onCancel,
  onOk,
  title = '提示',
  children,
  onVisibleChange
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
            <Button variant="outline" color="gray" onClick={onCancel}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Button variant="destructive" color="red" onClick={onOk}>
              Confirm
            </Button>
          </AlertDialogAction>
        </div>

      </AlertDialogContent>
    </AlertDialog>

  )
}

export default Modal
