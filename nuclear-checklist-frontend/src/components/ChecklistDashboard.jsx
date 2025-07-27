import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react'

export function ChecklistDashboard() {
  const [statistics, setStatistics] = useState({
    total_items: 0,
    completed_items: 0,
    pending_items: 0,
    completion_rate: 0
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
    fetchCategories()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:8000/statistics/')
      const data = await response.json()
      setStatistics(data)
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/categories/')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Toplam Madde',
      value: statistics.total_items,
      icon: FileText,
      description: 'Sistemdeki toplam çeklist maddesi',
      color: 'text-blue-600'
    },
    {
      title: 'Tamamlanan',
      value: statistics.completed_items,
      icon: CheckCircle,
      description: 'Tamamlanan çeklist maddeleri',
      color: 'text-green-600'
    },
    {
      title: 'Bekleyen',
      value: statistics.pending_items,
      icon: Clock,
      description: 'Henüz tamamlanmayan maddeler',
      color: 'text-orange-600'
    },
    {
      title: 'Tamamlanma Oranı',
      value: `%${statistics.completion_rate}`,
      icon: TrendingUp,
      description: 'Genel ilerleme durumu',
      color: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Çeklist yönetim sistemi genel görünümü</p>
          </div>
        </div>
        <div className="text-center py-8">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Nükleer güvenlik standartları çeklist yönetim sistemi
          </p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* İlerleme Durumu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Genel İlerleme</span>
          </CardTitle>
          <CardDescription>
            Çeklist maddelerinin tamamlanma durumu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tamamlanma Oranı</span>
              <span>{statistics.completion_rate}%</span>
            </div>
            <Progress value={statistics.completion_rate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics.completed_items}
              </div>
              <div className="text-sm text-muted-foreground">Tamamlanan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {statistics.pending_items}
              </div>
              <div className="text-sm text-muted-foreground">Bekleyen</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kategoriler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Kategoriler</span>
          </CardTitle>
          <CardDescription>
            Sistemdeki çeklist kategorileri ({categories.length} kategori)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="p-2 text-center">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uyarılar ve Bilgiler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Sistem Bilgileri</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">IAEA-TECDOC-1848</Badge>
            <span className="text-sm text-muted-foreground">
              Diverse Protection System standartları
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">SSG-39</Badge>
            <span className="text-sm text-muted-foreground">
              Design of Instrumentation and Control Systems
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">IEC 61513</Badge>
            <span className="text-sm text-muted-foreground">
              Nuclear power plants - Instrumentation and control
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

