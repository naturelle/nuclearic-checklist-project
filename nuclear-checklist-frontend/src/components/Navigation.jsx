import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react'

export function Navigation({ user, onLogout }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/checklist', label: 'Çeklist', icon: CheckSquare },
    { path: '/visualization', label: 'Görselleştirme', icon: BarChart3 },
    { path: '/data-management', label: 'Veri Yönetimi', icon: Settings },
  ]

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo ve Başlık */}
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Nuclear Checklist
              </h1>
              <p className="text-xs text-muted-foreground">
                IAEA-TECDOC-1848, SSG-39, IEC 61513
              </p>
            </div>
          </div>

          {/* Navigasyon Menüsü */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Kullanıcı Bilgileri ve Çıkış */}
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <div className="font-medium text-foreground">{user?.username}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Çıkış</span>
            </Button>
          </div>
        </div>

        {/* Mobil Navigasyon */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

