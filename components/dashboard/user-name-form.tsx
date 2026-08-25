'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'

import { cn } from '@/lib/utils'
import { userNameSchema } from '@/lib/validations/user'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/common/icons'
import http from '@/lib/http'

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: {
    id: string | number
    name?: string | null
  }
}

type FormData = z.infer<typeof userNameSchema>

export function UserNameForm ({
  user,
  className,
  ...props
}: UserNameFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(userNameSchema),
    defaultValues: {
      name: user?.name ?? ''
    }
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit (data: FormData) {
    setIsSaving(true)

    try {
      await http.patch(`/api/user/${user.id}`, { name: data.name })

      toast({
        description: 'Your name has been updated.'
      })

      router.refresh()
    } catch (error) {
      console.error('更新用户名失败:', error)
      toast({
        title: 'Something went wrong.',
        description: 'Your name was not updated. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Name</CardTitle>
          <CardDescription>
            Please enter your full name or a display name you are comfortable
            with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-[400px]"
              size={32}
              {...register('name')}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <button
            type="submit"
            className={cn(buttonVariants(), className)}
            disabled={isSaving}
          >
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
            )}
            <span>Save</span>
          </button>
        </CardFooter>
      </Card>
    </form>
  )
}
