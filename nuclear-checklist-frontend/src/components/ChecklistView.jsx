import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  CheckSquare, 
  Square,
  FileText,
  Tag,
  Clock,
  CheckCircle
} from 'lucide-react'

export function ChecklistView() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchItems()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory)
    } else {
      setSubCategories([])
      setSelectedSubCategory('')
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchItems()
  }, [selectedCategory, selectedSubCategory, statusFilter])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedSubCategory) params.append('sub_category', selectedSubCategory)
      if (statusFilter !== '') params.append('status', statusFilter)
      
      const response = await fetch(`http://localhost:8000/checklist-items/?${params}`)
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Çeklist maddeleri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/categories/')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error)
    }
  }

  const fetchSubCategories = async (category) => {
    try {
      const response = await fetch(`http://localhost:8000/sub-categories/?category=${encodeURIComponent(category)}`)
      const data = await response.json()
      setSubCategories(data)
    } catch (error) {
      console.error('Alt kategoriler yüklenirken hata:', error)
    }
  }

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/checklist-items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        setItems(items.map(item => 
          item.item_id === itemId ? { ...item, status: newStatus } : item
        ))
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error)
    }
  }

  const filteredItems = items.filter(item =>
    item.item_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sub_category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedSubCategory('')
    setStatusFilter('')
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center space-x-3">
        <CheckSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Çeklist Görünümü</h1>
          <p className="text-muted-foreground">
            Nükleer güvenlik standartları çeklist maddeleri
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtreler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Metin ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Alt Kategori */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Alt Kategori</label>
              <Select 
                value={selectedSubCategory} 
                onValueChange={setSelectedSubCategory}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alt kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {subCategories.map((subCategory) => (
                    <SelectItem key={subCategory} value={subCategory}>
                      {subCategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Durum */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="true">Tamamlanan</SelectItem>
                  <SelectItem value="false">Bekleyen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {filteredItems.length} madde gösteriliyor
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Çeklist Maddeleri */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Hiç çeklist maddesi bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.item_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <Checkbox
                      checked={item.status}
                      onCheckedChange={(checked) => updateItemStatus(item.item_id, checked)}
                      className="h-5 w-5"
                    />
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 space-y-3">
                    {/* Başlık ve Durum */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.sub_category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Tamamlandı
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Bekliyor
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Madde Metni */}
                    <p className={`text-sm leading-relaxed ${item.status ? 'line-through text-muted-foreground' : ''}`}>
                      {item.item_text}
                    </p>

                    {/* Standartlar */}
                    {item.standards && (
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Standartlar: {item.standards}
                        </span>
                      </div>
                    )}

                    {/* Tarihler */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>
                        Oluşturulma: {new Date(item.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      <span>
                        Güncelleme: {new Date(item.updated_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

