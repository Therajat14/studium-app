import { NavLink } from 'react-router'
import {
  Home,
  MessageCircle,
  BookOpen,
  User,
  Search,
  LogOut,
  HelpCircle,
  Briefcase,
  MapPin,
  Award,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth.js'
import { Avatar } from '@/components/ui/avatar.js'
import { ThemeToggle } from '@/components/ui/ThemeToggle.js'

const NAV = [
  { to: '/dashboard',    icon: Home,          label: 'Community Feed' },
  { to: '/knowledge',    icon: BookOpen,       label: 'Knowledge Hub' },
  { to: '/qna',          icon: HelpCircle,     label: 'Q&A' },
  { to: '/messages',     icon: MessageCircle,  label: 'Messages' },
  { to: '/opportunities',icon: Briefcase,      label: 'Opportunities' },
  { to: '/campus',       icon: MapPin,         label: 'Campus Life' },
  { to: '/search',       icon: Search,         label: 'Discover' },
  { to: '/profile',      icon: User,           label: 'Profile' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export const Sidebar = ({ open, onClose }: Props) => {
  const { user, logout } = useAuth()

  const connections = (user as any)?._count?.followers ?? 0

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-border bg-card
          transition-transform duration-300
          lg:static lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary">Studium</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="lg:hidden rounded p-1 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} fallback={user.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.branch ? `${user.branch}${user.year ? ` • Year ${user.year}` : ''}` : user.role}
                </p>
              </div>
            </div>

            {/* Karma + connections */}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-yellow-500" />
                <span className="font-medium text-foreground">{(user as any).karma ?? 0}</span> karma
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{connections}</span> connections
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {NAV.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  end={to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-r-2 border-primary bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
