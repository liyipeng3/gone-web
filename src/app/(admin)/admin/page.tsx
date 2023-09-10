import { redirect } from 'next/navigation'

const AdminPage = () => {
  if (Math.random() > 0.5) {
    redirect('/admin/login')
  } else {
    redirect('/admin/manage')
  }

  return null
}

export default AdminPage
