import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Proxy will handle the redirect based on role
  // This should never be reached, but just in case
  redirect('/login')
}
