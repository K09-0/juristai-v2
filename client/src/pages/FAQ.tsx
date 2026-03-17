import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FAQItem {
  id: string
  question_ru: string
  question_kk: string
  answer_ru: string
  answer_kk: string
  category: 'general' | 'search' | 'documents' | 'account' | 'technical'
}

const faqItems: FAQItem[] = [
  {
    id: 'q1',
    question_ru: 'Что такое JuristAI?',
    question_kk: 'JuristAI дегеніме?',
    answer_ru: 'JuristAI - это юридический AI-ассистент для Казахстана, который помогает найти информацию в законодательстве РК, генерировать юридические документы и отслеживать изменения в законах.',
    answer_kk: 'JuristAI - бұл Қазақстан үшін құрылған заң ісінің AI-ассистенты, ол РК заңнамасындағы ақпаратты табуға, заңды құжаттарды құрастыруға және заңдардағы өзгерістерді бақылауға көмектеседі.',
    category: 'general'
  },
  {
    id: 'q2',
    question_ru: 'Это бесплатно?',
    question_kk: 'Бұл тегін бе?',
    answer_ru: 'Да! JuristAI полностью бесплатен. Мы используем только бесплатные AI модели и не берем плату за использование.',
    answer_kk: 'Иә! JuristAI толығымен тегін. Біз тек ақысыз AI модельдерін қолданамыз және пайдалану үшін ақы алмаймыз.',
    category: 'general'
  },
  {
    id: 'q3',
    question_ru: 'Как использовать поиск?',
    question_kk: 'Іздеуді қалай пайдалану керек?',
    answer_ru: 'Перейдите в раздел "Поиск", введите ваш вопрос о законодательстве РК и нажмите кнопку поиска. Система найдет релевантные статьи и даст ответ с указанием источников.',
    answer_kk: '"Іздеу" бөліміне өтіңіз, РК заңнамасы туралы сұрақты енгізіңіз және іздеу түймесін басыңыз. Жүйе сәйкес мақалаларды табады және дереккөздерін көрсетіп жауап береді.',
    category: 'search'
  },
  {
    id: 'q4',
    question_ru: 'Как генерировать документы?',
    question_kk: 'Құжаттарды қалай құрастыру керек?',
    answer_ru: 'Перейдите в раздел "Создать документ", выберите тип документа (исковое заявление, претензия или договор), заполните необходимые поля и нажмите "Создать". Вы сможете экспортировать документ в PDF или DOCX.',
    answer_kk: '"Құжат құрастыру" бөліміне өтіңіз, құжат түрін таңдаңыз (сот ісі, наразылық немесе келісім), қажетті өрістерді толтырыңыз және "Құрастыру" түймесін басыңыз. Құжатты PDF немесе DOCX форматында экспорттай аласыз.',
    category: 'documents'
  },
  {
    id: 'q5',
    question_ru: 'Какие стили документов доступны?',
    question_kk: 'Қандай құжат стильдері қол жетімді?',
    answer_ru: 'Доступны 4 стиля: формальный (официальный тон), нейтральный (сбалансированный), агрессивный (жесткий подход) и защитный (защита прав).',
    answer_kk: '4 стиль қол жетімді: ресми (ресми тон), бейтарап (теңдестірілген), агрессивті (қатты тәсіл) және қорғау (құқықтарды қорғау).',
    category: 'documents'
  },
  {
    id: 'q6',
    question_ru: 'Как войти в систему?',
    question_kk: 'Жүйеге қалай кіру керек?',
    answer_ru: 'Используйте встроенные учетные данные: Логин: admin или lawyer, Пароль: Asdf!234. Или используйте волшебную ссылку (email magic link) для входа.',
    answer_kk: 'Орнатылған учет деректерін пайдаланыңыз: Логин: admin немесе lawyer, Пароль: Asdf!234. Немесе кіру үшін сиқырлы сілтемені (email magic link) пайдаланыңыз.',
    category: 'account'
  },
  {
    id: 'q7',
    question_ru: 'Как исключаются галлюцинации?',
    question_kk: 'Галлюцинациялар қалай болып тасталады?',
    answer_ru: 'JuristAI использует RAG (Retrieval-Augmented Generation) с жёсткой привязкой к официальному законодательству РК. Все ответы основаны только на проверенных источниках, и система указывает точные ссылки на статьи.',
    answer_kk: 'JuristAI РК ресми заңнамасына қатты байланысы бар RAG (Retrieval-Augmented Generation) қолданады. Барлық жауаптар тек тексерілген дереккөздерге негізделеді және жүйе мақалалардың нақты сілтемелерін көрсетеді.',
    category: 'technical'
  },
  {
    id: 'q8',
    question_ru: 'Какие AI модели используются?',
    question_kk: 'Қандай AI модельдері қолданылады?',
    answer_ru: 'Мы используем бесплатные модели: Mistral 7B (основная), Llama 2 7B (резервная) и all-MiniLM-L6-v2 для embeddings. Все модели работают без платежей.',
    answer_kk: 'Біз ақысыз модельдерді қолданамыз: Mistral 7B (негізгі), Llama 2 7B (резервтік) және all-MiniLM-L6-v2 embeddings үшін. Барлық модельдер төлемсіз жұмыс істейді.',
    category: 'technical'
  },
  {
    id: 'q9',
    question_ru: 'Как часто обновляется законодательство?',
    question_kk: 'Заңнама қаншалықты жиынтықта жаңартылады?',
    answer_ru: 'Мониторинг законодательства работает ежедневно. Система проверяет adilet.zan.kz и отслеживает все новые поправки и изменения.',
    answer_kk: 'Заңнама мониторингі күнделік жұмыс істейді. Жүйе adilet.zan.kz тексеріп барлық жаңа өзгерістер мен өндіктерді бақылайды.',
    category: 'general'
  },
  {
    id: 'q10',
    question_ru: 'Как смена языка?',
    question_kk: 'Тілді қалай ауыстыру керек?',
    answer_ru: 'Используйте кнопки РУ и КК в верхнем правом углу интерфейса для переключения между русским и казахским языками.',
    answer_kk: 'Интерфейстің жоғарғы оң бұрышындағы РУ және КК түймелерін пайдаланып орыс және қазақ тіліндегі аралық ауысыңыз.',
    category: 'general'
  },
  {
    id: 'q11',
    question_ru: 'Можно ли экспортировать документы?',
    question_kk: 'Құжаттарды экспорттау мүмкін бе?',
    answer_ru: 'Да! Все документы можно экспортировать в PDF или DOCX формате. Просто нажмите кнопку "Экспорт" после создания документа.',
    answer_kk: 'Иә! Барлық құжаттарды PDF немесе DOCX форматында экспорттау мүмкін. Құжат құрастырғаннан кейін "Экспорт" түймесін басыңыз.',
    category: 'documents'
  },
  {
    id: 'q12',
    question_ru: 'Поддерживается ли мобильная версия?',
    question_kk: 'Мобильді нұсқа қолдау көрсетіледі ме?',
    answer_ru: 'Да! JuristAI полностью адаптирован для мобильных устройств. Вы можете использовать все функции на смартфоне или планшете.',
    answer_kk: 'Иә! JuristAI мобильді құрылғылар үшін толығымен бейімделген. Барлық функцияларды смартфон немесе планшетте пайдалана аласыз.',
    category: 'general'
  }
]

export default function FAQ() {
  const { language } = useLanguage()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<FAQItem['category'] | 'all'>('all')

  const categories = [
    { id: 'all', label_ru: 'Все вопросы', label_kk: 'Барлық сұрақтар' },
    { id: 'general', label_ru: 'Общие', label_kk: 'Жалпы' },
    { id: 'search', label_ru: 'Поиск', label_kk: 'Іздеу' },
    { id: 'documents', label_ru: 'Документы', label_kk: 'Құжаттар' },
    { id: 'account', label_ru: 'Аккаунт', label_kk: 'Аккаунт' },
    { id: 'technical', label_ru: 'Техническое', label_kk: 'Техникалық' }
  ]

  const filteredItems = selectedCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory)

  const getText = (ru: string, kk: string) => language === 'kk' ? kk : ru

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 py-8">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{getText('Часто задаваемые вопросы', 'Жиі қойылатын сұрақтар')}</h1>
          </div>
          <p className="text-muted-foreground">
            {getText(
              'Найдите ответы на вопросы о JuristAI',
              'JuristAI туралы сұрақтарға жауап табыңыз'
            )}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id as any)}
                className="text-sm"
              >
                {getText(cat.label_ru, cat.label_kk)}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border border-border hover:border-primary/50 transition-colors"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full p-6 text-left hover:bg-secondary/30 transition-colors flex items-center justify-between"
              >
                <h3 className="font-semibold text-foreground pr-4">
                  {getText(item.question_ru, item.question_kk)}
                </h3>
                {expandedId === item.id ? (
                  <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {expandedId === item.id && (
                <div className="px-6 pb-6 pt-0 border-t border-border bg-secondary/10">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {getText(item.answer_ru, item.answer_kk)}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2 text-foreground">
            {getText('Не нашли ответ?', 'Жауап таба алмадыңыз ба?')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {getText(
              'Свяжитесь с нами по email для получения помощи',
              'Көмек алу үшін бізге электрондық пошта арқылы хабарласыңыз'
            )}
          </p>
          <a
            href="mailto:support@juristai.site"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition"
          >
            support@juristai.site
          </a>
        </Card>
      </div>
    </div>
  )
}
