import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Upload, 
  Download, 
  Database, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react'

export function DataManagementAdvanced() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [jsonData, setJsonData] = useState('')
  const [csvData, setCsvData] = useState('')
  const [replaceExisting, setReplaceExisting] = useState(false)

  const showMessage = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleExportJson = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/data-management/export/json')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'checklist_data.json'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showMessage('JSON dosyası başarıyla indirildi', 'success')
      } else {
        throw new Error('Dışa aktarma başarısız')
      }
    } catch (error) {
      showMessage('JSON dışa aktarma hatası: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCsv = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/data-management/export/csv')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'checklist_data.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showMessage('CSV dosyası başarıyla indirildi', 'success')
      } else {
        throw new Error('Dışa aktarma başarısız')
      }
    } catch (error) {
      showMessage('CSV dışa aktarma hatası: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImportJson = async () => {
    if (!jsonData.trim()) {
      showMessage('JSON verisi boş olamaz', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/data-management/import/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: jsonData,
          replace_existing: replaceExisting
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        showMessage(
          `${result.imported_count} kayıt içe aktarıldı, ${result.skipped_count} kayıt atlandı`,
          'success'
        )
        setJsonData('')
      } else {
        throw new Error(result.detail || 'İçe aktarma başarısız')
      }
    } catch (error) {
      showMessage('JSON içe aktarma hatası: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImportCsv = async () => {
    if (!csvData.trim()) {
      showMessage('CSV verisi boş olamaz', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/data-management/import/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: csvData,
          replace_existing: replaceExisting
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        showMessage(
          `${result.imported_count} kayıt içe aktarıldı, ${result.skipped_count} kayıt atlandı`,
          'success'
        )
        setCsvData('')
      } else {
        throw new Error(result.detail || 'İçe aktarma başarısız')
      }
    } catch (error) {
      showMessage('CSV içe aktarma hatası: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('replace_existing', replaceExisting)

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/data-management/import/file/${type}`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (response.ok) {
        showMessage(
          `${result.imported_count} kayıt içe aktarıldı, ${result.skipped_count} kayıt atlandı`,
          'success'
        )
      } else {
        throw new Error(result.detail || 'Dosya yükleme başarısız')
      }
    } catch (error) {
      showMessage('Dosya yükleme hatası: ' + error.message, 'error')
    } finally {
      setLoading(false)
      event.target.value = '' // Input'u temizle
    }
  }

  const downloadTemplate = async (type) => {
    try {
      const response = await fetch(`http://localhost:8000/data-management/template/${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `checklist_template.${type}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showMessage(`${type.toUpperCase()} şablonu indirildi`, 'success')
      }
    } catch (error) {
      showMessage('Şablon indirme hatası: ' + error.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Mesaj */}
      {message && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
          {messageType === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : messageType === 'error' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Genel Ayarlar */}
      <Card>
        <CardHeader>
          <CardTitle>İçe Aktarma Ayarları</CardTitle>
          <CardDescription>
            Veri içe aktarma işlemleri için genel ayarlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="replace-existing"
              checked={replaceExisting}
              onCheckedChange={setReplaceExisting}
            />
            <Label htmlFor="replace-existing">
              Mevcut verileri değiştir (Dikkat: Tüm mevcut veriler silinecek!)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Dışa Aktarma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Veri Dışa Aktarma</span>
            </CardTitle>
            <CardDescription>
              Mevcut çeklist verilerini farklı formatlarda indirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleExportJson} 
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              JSON Olarak İndir
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportCsv}
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              CSV Olarak İndir
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Şablon Dosyaları</span>
            </CardTitle>
            <CardDescription>
              İçe aktarma için örnek şablon dosyalarını indirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline"
              onClick={() => downloadTemplate('json')}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              JSON Şablonu İndir
            </Button>
            <Button 
              variant="outline"
              onClick={() => downloadTemplate('csv')}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV Şablonu İndir
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* İçe Aktarma */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JSON İçe Aktarma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>JSON İçe Aktarma</span>
            </CardTitle>
            <CardDescription>
              JSON formatında veri yapıştırın veya dosya yükleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-data">JSON Verisi</Label>
              <Textarea
                id="json-data"
                placeholder='[{"category": "Kategori", "sub_category": "Alt Kategori", "item_text": "Madde metni", "standards": "IEC 61513", "status": false}]'
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={6}
              />
            </div>
            <Button 
              onClick={handleImportJson}
              className="w-full"
              disabled={loading || !jsonData.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              JSON Verisi İçe Aktar
            </Button>
            <div className="space-y-2">
              <Label htmlFor="json-file">JSON Dosyası Yükle</Label>
              <Input
                id="json-file"
                type="file"
                accept=".json"
                onChange={(e) => handleFileUpload(e, 'json')}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* CSV İçe Aktarma */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>CSV İçe Aktarma</span>
            </CardTitle>
            <CardDescription>
              CSV formatında veri yapıştırın veya dosya yükleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-data">CSV Verisi</Label>
              <Textarea
                id="csv-data"
                placeholder="Kategori,Alt Kategori,Madde Metni,Standartlar,Durum&#10;Örnek Kategori,Örnek Alt Kategori,Örnek madde metni,IEC 61513,Bekliyor"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={6}
              />
            </div>
            <Button 
              onClick={handleImportCsv}
              className="w-full"
              disabled={loading || !csvData.trim()}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              CSV Verisi İçe Aktar
            </Button>
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV Dosyası Yükle</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'csv')}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

