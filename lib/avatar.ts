import crypto from 'crypto'

export function getAvatarUrl (email: string) {
  return `https://cravatar.com/avatar/${crypto.createHash('md5').update(email).digest('hex')}?d=identicon`
}
