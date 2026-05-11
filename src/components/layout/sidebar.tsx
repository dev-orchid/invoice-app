'use client'

import Link from 'next/link'
import { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Package,
  Tags,
  FolderTree,
  Hash,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  userRole: 'admin' | 'user'
  onClose?: () => void
}

// Renders the nav item's icon, swapping to a spinner while the link's
// navigation is pending. Must live inside <Link> for useLinkStatus to work.
function NavItemContent({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  const { pending } = useLinkStatus()
  return (
    <>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {title}
    </>
  )
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    title: 'HSN Codes',
    href: '/dashboard/hsn-codes',
    icon: Hash,
    adminOnly: true,
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: FileText,
    adminOnly: false,
  },
  {
    title: 'Products',
    href: '/dashboard/products',
    icon: Package,
    adminOnly: true,
  },
  {
    title: 'Brands',
    href: '/dashboard/brands',
    icon: Tags,
    adminOnly: true,
  },
  {
    title: 'Categories',
    href: '/dashboard/categories',
    icon: FolderTree,
    adminOnly: true,
  },
  
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    adminOnly: true,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    adminOnly: false,
  },
]

export function Sidebar({ userRole, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    onClose?.()
  }

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  )

  return (
    <div className="flex h-full w-full flex-col bg-card">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleNavClick}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight">Bill Desk</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Invoice Management</span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {filteredMenuItems.map((item) => {
          // Dashboard should only be active when exactly on /dashboard
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <NavItemContent icon={item.icon} title={item.title} />
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
