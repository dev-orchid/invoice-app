import Image from 'next/image'
import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Banner Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/banner-invoice.jpg"
          alt="Invoice App Banner"
          fill
          className="object-cover"
          priority
        />
        {/* Optional overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Right side - Auth Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-4">
        {children}
      </div>

      <Toaster />
    </div>
  )
}
