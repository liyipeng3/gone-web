import { getAvatarUrl } from '@/lib/avatar'

interface AvatarProps {
  email: string
  author: string
}

const Avatar = ({ email, author }: AvatarProps) => (
  <img className="w-10 h-10 rounded-full" src={getAvatarUrl(email)} alt={author} />
)

export default Avatar
