import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Страница генерации юридических документов
 * Поддерживает: иски, претензии, договоры
 * Все документы основаны на законодательстве РК
 */

interface GeneratedDocument {
  status: 'success' | 'error'
  document_type: string
  document_type_name: string
  content: string
  metadata?: {
    generated_at: string
    model: string
  }
}

const TONES = [
  { value: 'formal', label: 'Формальный' },
  { value: 'neutral', label: 'Нейтральный' },
  { value: 'aggressive', label: 'Агрессивный' },
  { value: 'protective', label: 'Защитный' }
]

export default function DocumentGenerator() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('claim')
  const [loading, setLoading] = useState(false)
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null)
  const [error, setError] = useState('')

  // Claim form
  const [claimData, setClaimData] = useState({
    plaintiff: '',
    defendant: '',
    claim_amount: '',
    claim_description: '',
    tone: 'formal'
  })

  // Complaint form
  const [complaintData, setComplaintData] = useState({
    complainant: '',
    respondent: '',
    complaint_subject: '',
    complaint_description: '',
    tone: 'formal'
  })

  // Contract form
  const [contractData, setContractData] = useState({
    party_a: '',
    party_b: '',
    contract_subject: '',
    contract_terms: '',
    contract_type: 'general',
    tone: 'formal'
  })

  const handleGenerateClaim = async () => {
    if (!claimData.plaintiff || !claimData.defendant || !claimData.claim_amount) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedDoc(null)

    try {
      const response = await fetch('/api/documents/generate-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      })

      if (!response.ok) throw new Error('Ошибка при генерации')

      const data = await response.json()
      setGeneratedDoc(data)
    } catch (err) {
      setError('Ошибка при генерации документа')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateComplaint = async () => {
    if (!complaintData.complainant || !complaintData.respondent) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedDoc(null)

    try {
      const response = await fetch('/api/documents/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData)
      })

      if (!response.ok) throw new Error('Ошибка при генерации')

      const data = await response.json()
      setGeneratedDoc(data)
    } catch (err) {
      setError('Ошибка при генерации документа')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateContract = async () => {
    if (!contractData.party_a || !contractData.party_b || !contractData.contract_subject) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedDoc(null)

    try {
      const response = await fetch('/api/documents/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData)
      })

      if (!response.ok) throw new Error('Ошибка при генерации')

      const data = await response.json()
      setGeneratedDoc(data)
    } catch (err) {
      setError('Ошибка при генерации документа')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: 'pdf' | 'docx') => {
    if (!generatedDoc?.content) return

    const link = document.createElement('a')
    const file = new Blob([generatedDoc.content], { type: 'text/plain' })
    link.href = URL.createObjectURL(file)
    link.download = `document.${format === 'pdf' ? 'pdf' : 'docx'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 py-8">
        <div className="container max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">{t('documents.title')}</h1>
          <p className="text-muted-foreground">
            Генерируйте юридические документы на основе законодательства РК
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="claim">{t('documents.claim')}</TabsTrigger>
                <TabsTrigger value="complaint">{t('documents.complaint')}</TabsTrigger>
                <TabsTrigger value="contract">{t('documents.contract')}</TabsTrigger>
              </TabsList>

              {/* Claim */}
              <TabsContent value="claim" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Исковое заявление</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Истец (ваше имя)</label>
                      <Input
                        placeholder="ФИО или название компании"
                        value={claimData.plaintiff}
                        onChange={(e) => setClaimData({...claimData, plaintiff: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Ответчик</label>
                      <Input
                        placeholder="ФИО или название компании"
                        value={claimData.defendant}
                        onChange={(e) => setClaimData({...claimData, defendant: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Сумма иска (тенге)</label>
                      <Input
                        type="number"
                        placeholder="100000"
                        value={claimData.claim_amount}
                        onChange={(e) => setClaimData({...claimData, claim_amount: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание требований</label>
                      <Textarea
                        placeholder="Подробно опишите суть спора и ваши требования..."
                        value={claimData.claim_description}
                        onChange={(e) => setClaimData({...claimData, claim_description: e.target.value})}
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Стиль документа</label>
                      <Select value={claimData.tone} onValueChange={(value) => setClaimData({...claimData, tone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONES.map(tone => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleGenerateClaim}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Генерация...' : 'Создать исковое заявление'}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Complaint */}
              <TabsContent value="complaint" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Претензия</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Истец (ваше имя)</label>
                      <Input
                        placeholder="ФИО или название компании"
                        value={complaintData.complainant}
                        onChange={(e) => setComplaintData({...complaintData, complainant: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Ответчик</label>
                      <Input
                        placeholder="ФИО или название компании"
                        value={complaintData.respondent}
                        onChange={(e) => setComplaintData({...complaintData, respondent: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Предмет претензии</label>
                      <Input
                        placeholder="Например: неисполнение договора поставки"
                        value={complaintData.complaint_subject}
                        onChange={(e) => setComplaintData({...complaintData, complaint_subject: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание нарушения</label>
                      <Textarea
                        placeholder="Подробно опишите нарушение и требуемые действия..."
                        value={complaintData.complaint_description}
                        onChange={(e) => setComplaintData({...complaintData, complaint_description: e.target.value})}
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Стиль документа</label>
                      <Select value={complaintData.tone} onValueChange={(value) => setComplaintData({...complaintData, tone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONES.map(tone => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleGenerateComplaint}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Генерация...' : 'Создать претензию'}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Contract */}
              <TabsContent value="contract" className="space-y-4">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Договор</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Сторона А</label>
                      <Input
                        placeholder="ФИО или название компании"
                        value={contractData.party_a}
                        onChange={(e) => setContractData({...contractData, party_a: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Сторона Б</label>
                      <Input
                        placeholder="ФИО или название компании"
                        value={contractData.party_b}
                        onChange={(e) => setContractData({...contractData, party_b: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Предмет договора</label>
                      <Input
                        placeholder="Например: поставка товаров"
                        value={contractData.contract_subject}
                        onChange={(e) => setContractData({...contractData, contract_subject: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Основные условия</label>
                      <Textarea
                        placeholder="Опишите основные условия договора (сроки, цена, обязанности и т.д.)..."
                        value={contractData.contract_terms}
                        onChange={(e) => setContractData({...contractData, contract_terms: e.target.value})}
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Тип договора</label>
                      <Select value={contractData.contract_type} onValueChange={(value) => setContractData({...contractData, contract_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Общий договор</SelectItem>
                          <SelectItem value="supply">Договор поставки</SelectItem>
                          <SelectItem value="service">Договор услуг</SelectItem>
                          <SelectItem value="employment">Трудовой договор</SelectItem>
                          <SelectItem value="lease">Договор аренды</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Стиль документа</label>
                      <Select value={contractData.tone} onValueChange={(value) => setContractData({...contractData, tone: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONES.map(tone => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleGenerateContract}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Генерация...' : 'Создать договор'}
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Error */}
            {error && (
              <Card className="p-4 border-red-200 bg-red-50 text-red-700 mt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            {generatedDoc && (
              <Card className="p-6 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{generatedDoc.document_type_name}</h3>
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto text-sm">
                  <p className="whitespace-pre-wrap text-foreground">
                    {generatedDoc.content.substring(0, 500)}...
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleExport('pdf')}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('documents.export_pdf')}
                  </Button>
                  <Button
                    onClick={() => handleExport('docx')}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('documents.export_docx')}
                  </Button>
                </div>

                {generatedDoc.metadata && (
                  <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    <p>Модель: {generatedDoc.metadata.model}</p>
                    <p>Создано: {new Date(generatedDoc.metadata.generated_at).toLocaleString('ru-RU')}</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
