import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'ru' | 'kk'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Переводы
const translations: Record<Language, Record<string, string>> = {
  ru: {
    // Header
    'header.features': 'Возможности',
    'header.pricing': 'Тарифы',
    'header.about': 'О проекте',
    
    // Hero
    'hero.badge': 'Работает с законодательством РК 2026',
    'hero.title': 'Юридический AI нового поколения',
    'hero.subtitle': 'Мгновенные ответы из ГК, ТК, КоАП РК. Генерация документов. Анализ договоров с AI-разметкой рисков.',
    'hero.search_placeholder': 'Какие сроки исковой давности по договору подряда?',
    'hero.ask_button': 'Спросить',
    'hero.doc_placeholder': 'Опишите ситуацию для генерации документа...',
    'hero.create_button': 'Создать',
    'hero.audio_button': 'Загрузить',
    'hero.popular': 'Популярное:',
    
    // Stats
    'stats.lawyers': 'Юристов',
    'stats.documents': 'Документов',
    'stats.accuracy': 'Точность',
    'stats.availability': 'Доступность',
    
    // Features
    'features.title': 'Возможности',
    'features.subtitle': 'Всё необходимое для юридической работы в одном сервисе',
    'features.rag_search': 'RAG-поиск',
    'features.rag_desc': 'Нейросеть ищет ответы в 50+ НПА РК',
    'features.doc_generation': 'Генерация документов',
    'features.doc_desc': 'Иски, претензии, договоры в 4 тонах',
    'features.contract_analysis': 'Анализ договоров',
    'features.contract_desc': 'AI находит риски и предлагает правки',
    'features.audio_to_law': 'Audio-to-Law',
    'features.audio_desc': 'Транскрибация судебных заседаний',
    'features.unlimited': 'Безлимит Premium',
    'features.unlimited_desc': 'Неограниченные запросы 24/7',
    'features.security': 'Безопасность',
    'features.security_desc': 'Шифрование данных и локальное хранение',
    'features.free': 'Бесплатно',
    'features.premium': 'Premium',
    
    // Pricing
    'pricing.title': 'Тарифы',
    'pricing.subtitle': 'Начните бесплатно, обновитесь когда понадобится больше',
    'pricing.start': 'Старт',
    'pricing.premium': 'Premium',
    'pricing.popular': 'POPULAR',
    'pricing.start_free': 'Начать бесплатно',
    'pricing.choose_premium': 'Выбрать Premium',
    'pricing.free_queries': '10 запросов/день в законы',
    'pricing.basic_generation': 'Базовая генерация документов',
    'pricing.email_support': 'Email-поддержка',
    'pricing.unlimited_queries': 'Безлимит запросов в законы',
    'pricing.advanced_generation': 'Расширенная генерация документов',
    'pricing.contract_analysis': 'Анализ договоров с AI-разметкой',
    'pricing.audio_transcription': 'Audio-to-Law транскрибация',
    'pricing.priority_support': 'Приоритетная поддержка',
    
    // CTA
    'cta.title': 'Готовы начать?',
    'cta.subtitle': 'Присоединяйтесь к тысячам юристов, которые уже используют JuristAI для ускорения своей работы.',
    
    // Footer
    'footer.product': 'Продукт',
    'footer.company': 'Компания',
    'footer.legal': 'Правовое',
    'footer.copyright': '© 2024 JuristAI. Все права защищены.',
    
    // Auth
    'auth.login': 'Вход',
    'auth.register': 'Регистрация',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.username': 'Логин',
    'auth.magic_link': 'Волшебная ссылка',
    'auth.send_link': 'Отправить ссылку',
    'auth.google': 'Вход через Google',
    'auth.apple': 'Вход через Apple',
    'auth.logout': 'Выход',
    
    // Search
    'search.title': 'Поиск по законодательству',
    'search.placeholder': 'Введите вопрос или номер статьи...',
    'search.search': 'Искать',
    'search.no_results': 'Результаты не найдены',
    
    // Documents
    'documents.title': 'Генерация документов',
    'documents.claim': 'Исковое заявление',
    'documents.complaint': 'Претензия',
    'documents.contract': 'Договор',
    'documents.generate': 'Создать документ',
    'documents.export_pdf': 'Скачать PDF',
    'documents.export_docx': 'Скачать DOCX',
  },
  kk: {
    // Header
    'header.features': 'Мүмкіндіктер',
    'header.pricing': 'Бағалар',
    'header.about': 'Жобасы туралы',
    
    // Hero
    'hero.badge': 'ҚР заңнамасы 2026 жылмен жұмыс істейді',
    'hero.title': 'Жаңа ұрпақтың құқықтық AI',
    'hero.subtitle': 'ҚР ҚК, ТК, ХҚЗК-дан лездік жауап. Құжат ұрпақтау. Рисктердің AI белгісі бар келісімдерді талдау.',
    'hero.search_placeholder': 'Ішеним мерзімінің сроктары қандай?',
    'hero.ask_button': 'Сұрау',
    'hero.doc_placeholder': 'Құжат ұрпақтау үшін жағдайды сипаттаңыз...',
    'hero.create_button': 'Құру',
    'hero.audio_button': 'Жүктеу',
    'hero.popular': 'Танымал:',
    
    // Stats
    'stats.lawyers': 'Адвокаттар',
    'stats.documents': 'Құжаттар',
    'stats.accuracy': 'Дәлдік',
    'stats.availability': 'Қол жетімділік',
    
    // Features
    'features.title': 'Мүмкіндіктер',
    'features.subtitle': 'Құқықтық жұмысқа қажетті барлығы бір сервистің ішінде',
    'features.rag_search': 'RAG-іздеу',
    'features.rag_desc': 'Нейрон желісі 50+ НПА ҚР-де жауап іздейді',
    'features.doc_generation': 'Құжат ұрпақтау',
    'features.doc_desc': 'Істер, талаптар, келісімдер 4 тондағы',
    'features.contract_analysis': 'Келісімдерді талдау',
    'features.contract_desc': 'AI рисктерді табады және түзетулерді ұсынады',
    'features.audio_to_law': 'Audio-to-Law',
    'features.audio_desc': 'Сот отырыстарының транскрипциясы',
    'features.unlimited': 'Шексіз Premium',
    'features.unlimited_desc': '24/7 шектеусіз сұрау',
    'features.security': 'Қауіпсіздік',
    'features.security_desc': 'Деректерді шифрлеу және жергілік сақтау',
    'features.free': 'Тегін',
    'features.premium': 'Premium',
    
    // Pricing
    'pricing.title': 'Бағалар',
    'pricing.subtitle': 'Тегін бастаңыз, қажет болғанда жаңартыңыз',
    'pricing.start': 'Бастау',
    'pricing.premium': 'Premium',
    'pricing.popular': 'ТАНЫМАЛ',
    'pricing.start_free': 'Тегін бастау',
    'pricing.choose_premium': 'Premium таңдау',
    'pricing.free_queries': 'Күніне 10 сұрау',
    'pricing.basic_generation': 'Негіздік құжат ұрпақтау',
    'pricing.email_support': 'Email қолдау',
    'pricing.unlimited_queries': 'Шектеусіз сұрау',
    'pricing.advanced_generation': 'Кеңейтілген құжат ұрпақтау',
    'pricing.contract_analysis': 'AI белгісі бар келісімдерді талдау',
    'pricing.audio_transcription': 'Audio-to-Law транскрипциясы',
    'pricing.priority_support': 'Басым қолдау',
    
    // CTA
    'cta.title': 'Бастауға дайын сыз ба?',
    'cta.subtitle': 'JuristAI-ды өз жұмысын жеделдету үшін пайдаланатын мың адвокатқа қосылыңыз.',
    
    // Footer
    'footer.product': 'Өнім',
    'footer.company': 'Компания',
    'footer.legal': 'Құқықтық',
    'footer.copyright': '© 2024 JuristAI. Барлық құқықтар сақталған.',
    
    // Auth
    'auth.login': 'Кіру',
    'auth.register': 'Тіркелу',
    'auth.email': 'Email',
    'auth.password': 'Құпия сөз',
    'auth.username': 'Пайдаланушы аты',
    'auth.magic_link': 'Сиқырлы сілтеме',
    'auth.send_link': 'Сілтемені жіберу',
    'auth.google': 'Google арқылы кіру',
    'auth.apple': 'Apple арқылы кіру',
    'auth.logout': 'Шығу',
    
    // Search
    'search.title': 'Заңнамадан іздеу',
    'search.placeholder': 'Сұрау немесе мақала нөмірін енгізіңіз...',
    'search.search': 'Іздеу',
    'search.no_results': 'Нәтижелер табылмады',
    
    // Documents
    'documents.title': 'Құжат ұрпақтау',
    'documents.claim': 'Істік өтініш',
    'documents.complaint': 'Талап',
    'documents.contract': 'Келісім',
    'documents.generate': 'Құжат құру',
    'documents.export_pdf': 'PDF жүктеу',
    'documents.export_docx': 'DOCX жүктеу',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru')
  
  useEffect(() => {
    // Загружаем язык из localStorage
    const saved = localStorage.getItem('language') as Language | null
    if (saved && (saved === 'ru' || saved === 'kk')) {
      setLanguage(saved)
    }
  }, [])
  
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }
  
  const t = (key: string): string => {
    return translations[language][key] || key
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
