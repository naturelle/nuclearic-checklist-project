import { useState, useEffect } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function VisualizationCharts() {
  const [statistics, setStatistics] = useState({
    total_items: 0,
    completed_items: 0,
    pending_items: 0,
    completion_rate: 0
  })
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // İstatistikleri çek
      const statsResponse = await fetch('http://localhost:8000/statistics/')
      const statsData = await statsResponse.json()
      setStatistics(statsData)

      // Kategorileri çek ve her kategori için veri oluştur
      const categoriesResponse = await fetch('http://localhost:8000/categories/')
      const categories = await categoriesResponse.json()
      
      // Her kategori için madde sayısını hesapla
      const categoryStats = await Promise.all(
        categories.map(async (category) => {
          const itemsResponse = await fetch(`http://localhost:8000/checklist-items/?category=${encodeURIComponent(category)}`)
          const items = await itemsResponse.json()
          const completed = items.filter(item => item.status).length
          const total = items.length
          
          return {
            name: category.length > 20 ? category.substring(0, 20) + '...' : category,
            fullName: category,
            total: total,
            completed: completed,
            pending: total - completed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
          }
        })
      )
      
      setCategoryData(categoryStats)
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pasta grafiği için veri
  const pieData = [
    { name: 'Tamamlanan', value: statistics.completed_items, color: '#00C49F' },
    { name: 'Bekleyen', value: statistics.pending_items, color: '#FF8042' }
  ]

  // Trend verisi (demo)
  const trendData = [
    { month: 'Ocak', completed: 0, target: 20 },
    { month: 'Şubat', completed: 0, target: 40 },
    { month: 'Mart', completed: 0, target: 60 },
    { month: 'Nisan', completed: 0, target: 80 },
    { month: 'Mayıs', completed: 0, target: 100 },
    { month: 'Haziran', completed: 0, target: 116 }
  ]

  if (loading) {
    return <div className="text-center py-8">Veriler yükleniyor...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pasta Grafiği - Tamamlanma Durumu */}
      <Card>
        <CardHeader>
          <CardTitle>Tamamlanma Durumu</CardTitle>
          <CardDescription>
            Çeklist maddelerinin genel durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (%${(percent * 100).toFixed(0)})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Çubuk Grafiği - Kategori Bazında */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bazında Analiz</CardTitle>
          <CardDescription>
            Her kategorideki madde sayıları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'total' ? 'Toplam' : name === 'completed' ? 'Tamamlanan' : 'Bekleyen']}
                labelFormatter={(label) => {
                  const item = categoryData.find(d => d.name === label)
                  return item ? item.fullName : label
                }}
              />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Toplam" />
              <Bar dataKey="completed" fill="#00C49F" name="Tamamlanan" />
              <Bar dataKey="pending" fill="#FF8042" name="Bekleyen" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tamamlanma Oranları */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Tamamlanma Oranları</CardTitle>
          <CardDescription>
            Her kategorinin tamamlanma yüzdesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={10}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`%${value}`, 'Tamamlanma Oranı']}
                labelFormatter={(label) => {
                  const item = categoryData.find(d => d.name === label)
                  return item ? item.fullName : label
                }}
              />
              <Bar dataKey="completionRate" fill="#FFBB28" name="Tamamlanma Oranı (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Analizi */}
      <Card>
        <CardHeader>
          <CardTitle>İlerleme Trendi</CardTitle>
          <CardDescription>
            Hedef vs gerçekleşen ilerleme (demo veri)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#8884d8" 
                strokeDasharray="5 5"
                name="Hedef"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#00C49F" 
                name="Gerçekleşen"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

