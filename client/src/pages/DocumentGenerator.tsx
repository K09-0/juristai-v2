import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { trpc } from '@/lib/trpc'
import { useState } from 'react'
import { toast } from 'sonner'

/**
 * Страница генерации юридических документов
 * Поддерживает: иски, претензии, договоры
 * Все документы основаны на законодательстве РК
 */

interface GeneratedDocument {
  success: boolean
  document?: {
    id: number
    title: string
    type: string
    fileUrl: string
    format: string
    fileSize: number
    createdAt: Date
  } | null
  error?: string
}

const DOCUMENT_TYPES = [
  { value: 'исковое_заявление', label: 'Исковое заявление' },
  { value: 'претензия', label: 'Претензия' },
  { value: 'договор', label: 'Договор' },
  { value: 'другое', label: 'Другое' }
]

const STYLES = [
  { value: 'формальный', label: 'Формальный' },
  { value: 'нейтральный', label: 'Нейтральный' },
  { value: 'агрессивный', label: 'Агрессивный' },
  { value: 'защитный', label: 'Защитный' }
]

const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'txt', label: 'TXT' }
]

export default function DocumentGenerator() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('generate')
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    type: 'исковое_заявление',
    title: '',
    content: '',
    style: 'формальный',
    format: 'pdf',
    language: language === 'kk' ? 'kk' : 'ru'
  })

  // tRPC mutation
  const generateMutation = trpc.documents.generate.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedDoc(data)
        toast.success('Документ успешно создан!')
        setError('')
      } else {
        setError(data.error || 'Ошибка при генерации документа')
        toast.error(data.error || 'Ошибка при генерации документа')
      }
    },
    onError: (error) => {
      const errorMsg = error.message || 'Ошибка при генерации документа'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  })

  const handleGenerate = async () => {
    if (!formData.title || !formData.content) {
      setError('Пожалуйста, заполните все поля')
      toast.error('Пожалуйста, заполните все поля')
      return
    }

    setError('')
    setGeneratedDoc(null)

    generateMutation.mutate({
      type: formData.type as any,
      title: formData.title,
      content: formData.content,
      style: formData.style as any,
      format: formData.format as any,
      language: formData.language as any
    })
  }

  const handleDownload = () => {
    if (generatedDoc?.document?.fileUrl) {
      window.open(generatedDoc.document.fileUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container max-w-6xl h-16 flex items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">
              {language === 'kk' ? 'Құжат құрастырғыш' : 'Генератор документов'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">
              {language === 'kk' ? 'Құжат құру' : 'Создать документ'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {language === 'kk' ? 'Тарихы' : 'История'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                {/* Document Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'kk' ? 'Құжат түрі' : 'Тип документа'}
                  </label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'kk' ? 'Құжат атауы' : 'Название документа'}
                  </label>
                  <Input
                    placeholder={language === 'kk' ? 'Құжат атауын енгізіңіз' : 'Введите название документа'}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'kk' ? 'Құжат мазмұны' : 'Содержание документа'}
                  </label>
                  <Textarea
                    placeholder={language === 'kk' ? 'Құжат деректерін енгізіңіз' : 'Введите данные для документа'}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                  />
                </div>

                {/* Style */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'kk' ? 'Стилі' : 'Стиль'}
                  </label>
                  <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map(style => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'kk' ? 'Формат' : 'Формат'}
                  </label>
                  <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'kk' ? 'Құрастырылуда...' : 'Создание...'}
                    </>
                  ) : (
                    language === 'kk' ? 'Құжат құру' : 'Создать документ'
                  )}
                </Button>
              </div>
            </Card>

            {/* Generated Document */}
            {generatedDoc?.success && generatedDoc.document && (
              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{generatedDoc.document.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(generatedDoc.document.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {language === 'kk' ? 'Жүктеу' : 'Скачать'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'kk' ? 'Размер' : 'Размер'}: {(generatedDoc.document.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <p className="text-muted-foreground text-center py-8">
                {language === 'kk' ? 'Құжат тарихы бос' : 'История документов пуста'}
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
