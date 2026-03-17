import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, FileText, Mic, Scale, Shield, Zap, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * JuristAI v2 - Главная страница
 * Минималистичный дизайн с поддержкой тёмной/светлой темы
 * 
 * Дизайн-философия:
 * - Максимальная ясность и функциональность
 * - Иерархия через пространство и размер
 * - Контрастная типография (Geist Sans + Inter)
 * - Профессиональный синий акцент (#0066cc светлая, #3b82f6 тёмная)
 */

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('search')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">JuristAI</h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Возможности
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Тарифы
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition">
              О проекте
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container flex flex-col gap-4 py-4">
              <a href="#features" className="text-sm hover:text-primary transition">
                Возможности
              </a>
              <a href="#pricing" className="text-sm hover:text-primary transition">
                Тарифы
              </a>
              <a href="#about" className="text-sm hover:text-primary transition">
                О проекте
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663390821430/2S92VdbmpMwAvrwhPVSdfR/hero-legal-abstract-NuZYS3p2TdeioCUQUXUcKa.webp"
            alt="Legal abstract background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/60 dark:bg-background/75" />
        </div>

        <div className="container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">Работает с законодательством РК 2024</span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6">
              Юридический AI
              <br />
              <span className="text-primary">нового поколения</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Мгновенные ответы из ГК, ТК, КоАП РК. Генерация документов. Анализ договоров с AI-разметкой рисков.
            </p>

            {/* Search Tabs */}
            <div className="max-w-2xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="search" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Поиск</span>
                  </TabsTrigger>
                  <TabsTrigger value="doc" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Документ</span>
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span className="hidden sm:inline">Аудио</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Какие сроки исковой давности по договору подряда?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="px-6">
                      <Search className="w-4 h-4 mr-2" />
                      Спросить
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="doc" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Опишите ситуацию для генерации документа..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="px-6">
                      <FileText className="w-4 h-4 mr-2" />
                      Создать
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="audio/*"
                      className="flex-1"
                    />
                    <Button className="px-6">
                      <Mic className="w-4 h-4 mr-2" />
                      Загрузить
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Popular Tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <span className="text-sm text-muted-foreground">Популярное:</span>
                {['Неустойка по 395 ГК', 'Увольнение по ТК', 'Регистрация ТОО'].map((tag) => (
                  <button
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-secondary hover:bg-secondary/80 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Юристов' },
              { value: '50K+', label: 'Документов' },
              { value: '99%', label: 'Точность' },
              { value: '24/7', label: 'Доступность' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2>Возможности</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Всё необходимое для юридической работы в одном сервисе
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: 'RAG-поиск',
                desc: 'Нейросеть ищет ответы в 50+ НПА РК',
                free: true,
              },
              {
                icon: FileText,
                title: 'Генерация документов',
                desc: 'Иски, претензии, договоры в 4 тонах',
                free: true,
              },
              {
                icon: Shield,
                title: 'Анализ договоров',
                desc: 'AI находит риски и предлагает правки',
                premium: true,
              },
              {
                icon: Mic,
                title: 'Audio-to-Law',
                desc: 'Транскрибация судебных заседаний',
                premium: true,
              },
              {
                icon: Zap,
                title: 'Безлимит Premium',
                desc: 'Неограниченные запросы 24/7',
                premium: true,
              },
              {
                icon: Shield,
                title: 'Безопасность',
                desc: 'Шифрование данных и локальное хранение',
                free: true,
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.desc}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      feature.free
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {feature.free ? 'Бесплатно' : 'Premium'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-secondary/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2>Тарифы</h2>
            <p className="text-muted-foreground mt-4">
              Начните бесплатно, обновитесь когда понадобится больше
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-4">Старт</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">0</span>
                <span className="text-muted-foreground ml-2">₸/мес</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '10 запросов/день в законы',
                  'Базовая генерация документов',
                  'Email-поддержка',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">
                Начать бесплатно
              </Button>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 border-primary bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Premium</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                  POPULAR
                </span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">5 000</span>
                <span className="text-muted-foreground ml-2">₸/мес</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Безлимит запросов в законы',
                  'Расширенная генерация документов',
                  'Анализ договоров с AI-разметкой',
                  'Audio-to-Law транскрибация',
                  'Приоритетная поддержка',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Выбрать Premium</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container text-center">
          <h2>Готовы начать?</h2>
          <p className="text-muted-foreground mt-4 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам юристов, которые уже используют JuristAI для ускорения своей работы.
          </p>
          <Button size="lg" className="px-8">
            Начать бесплатно
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">JuristAI</h4>
              <p className="text-sm text-muted-foreground">
                Юридический AI-ассистент для Казахстана
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Возможности</a></li>
                <li><a href="#" className="hover:text-foreground transition">Тарифы</a></li>
                <li><a href="#" className="hover:text-foreground transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">О нас</a></li>
                <li><a href="#" className="hover:text-foreground transition">Блог</a></li>
                <li><a href="#" className="hover:text-foreground transition">Контакты</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Правовое</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Политика</a></li>
                <li><a href="#" className="hover:text-foreground transition">Условия</a></li>
                <li><a href="#" className="hover:text-foreground transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 JuristAI. Все права защищены.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition">Twitter</a>
              <a href="#" className="hover:text-foreground transition">LinkedIn</a>
              <a href="#" className="hover:text-foreground transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
