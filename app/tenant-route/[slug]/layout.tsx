import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
})

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${fraunces.variable} font-sans bg-site-bg text-site-text min-h-screen flex flex-col`}>
      {children}
    </div>
  )
}
