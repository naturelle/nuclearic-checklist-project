import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { VisualizationCharts } from './VisualizationCharts'

export function Visualization() {
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Görselleştirme</h1>
          <p className="text-muted-foreground">
            Çeklist verilerinin görsel analizi ve raporları
          </p>
        </div>
      </div>

      {/* Interaktif Grafikler */}
      <VisualizationCharts />

      {/* Geliştirilecek Özellikler */}
      <Card>
        <CardHeader>
          <CardTitle>Geliştirilecek Görselleştirmeler</CardTitle>
          <CardDescription>
            Plotly ve D3.js ile entegre edilecek ek özellikler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Standart Karşılaştırması</h4>
              <p className="text-sm text-muted-foreground">
                IAEA, IEC standartlarının detaylı karşılaştırılması
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Risk Analizi</h4>
              <p className="text-sm text-muted-foreground">
                Tamamlanmayan maddelerin risk seviyesi analizi
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Zaman Serisi Analizi</h4>
              <p className="text-sm text-muted-foreground">
                Gerçek zamanlı ilerleme trendlerinin analizi
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Kategori Heatmap</h4>
              <p className="text-sm text-muted-foreground">
                Kategorilerin yoğunluk haritası
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Dashboard Widgets</h4>
              <p className="text-sm text-muted-foreground">
                Özelleştirilebilir dashboard bileşenleri
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Rapor Oluşturma</h4>
              <p className="text-sm text-muted-foreground">
                PDF/Excel formatında otomatik rapor oluşturma
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

