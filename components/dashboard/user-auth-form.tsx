'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'

import { cn } from '@/lib/utils'
import { userAuthSchema } from '@/lib/validations/auth'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/common/icons'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
}

type FormData = z.infer<typeof userAuthSchema>

export function UserAuthForm ({
  className,
  ...props
}: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema)
  })
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const searchParams = useSearchParams()

  async function onSubmit (data: FormData) {
    setIsLoading(true)

    const signInResult = await signIn('credentials', {
      redirect: false,
      // callbackUrl: searchParams?.get('from') ?? '/dashboard',
      username: data.username,
      password: data.password
    })

    setIsLoading(false)

    console.log(signInResult)

    if (signInResult?.error) {
      return toast({
        title: 'Check your account and password',
        description: 'account or password is wrong.',
        variant: 'destructive'
      })
    } else {
      router.push(searchParams?.get('from') ?? '/dashboard')
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="账号"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              {...register('username')}
            />
            {(Boolean((errors?.username))) && (
              <p className="px-1 text-xs text-red-600">
                {errors?.username?.message}
              </p>
            )}
            <Input
              id="password"
              placeholder="密码"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              {...register('password')}
            />
            {(Boolean((errors?.password))) && (
              <p className="px-1 text-xs text-red-600">
                {errors?.password?.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
            )}
            Sign In
          </button>
        </div>
      </form>
    </div>
  )
}
