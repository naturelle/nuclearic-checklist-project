import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Database } from 'lucide-react'
import { DataManagementAdvanced } from './DataManagementAdvanced'

export function DataManagement() {
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center space-x-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Veri Yönetimi</h1>
          <p className="text-muted-foreground">
            Çeklist verilerini yönetin ve güncelleyin
          </p>
        </div>
      </div>

      {/* Gelişmiş Veri Yönetimi */}
      <DataManagementAdvanced />

      {/* Veritabanı Yönetimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Veritabanı Yönetimi</span>
          </CardTitle>
          <CardDescription>
            Veritabanı bakım işlemleri ve sistem yönetimi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Geliştirilecek Özellikler</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Veritabanı yedekleme ve geri yükleme</li>
              <li>• Sistem temizliği ve optimizasyon</li>
              <li>• Veri doğrulama ve tutarlılık kontrolü</li>
              <li>• Kullanıcı yetkilendirme yönetimi</li>
              <li>• Sistem logları ve audit trail</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

