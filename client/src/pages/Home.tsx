import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocation } from 'wouter'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/_core/hooks/useAuth'
import { 
  Search, 
  FileText, 
  Zap, 
  Shield, 
  Moon, 
  Sun,
  Globe,
  ArrowRight,
  CheckCircle2,
  Users,
  BarChart3,
  Lock,
  HelpCircle
} from 'lucide-react'
import { useState } from 'react'

/**
 * Главная страница JuristAI v2
 * Минималистичный дизайн с поддержкой тёмной/светлой темы и казахского языка
 */

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container max-w-6xl flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              J
            </div>
            <span className="font-bold text-lg">JuristAI</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => navigate('/search')} className="hover:text-primary transition">
              {t('header.features')}
            </button>
            <button onClick={() => navigate('/documents')} className="hover:text-primary transition">
              {t('header.pricing')}
            </button>
            <button onClick={() => navigate('/storage')} className="hover:text-primary transition">
              Storage
            </button>
            <button onClick={() => navigate('/faq')} className="hover:text-primary transition flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
            <a href="#about" className="hover:text-primary transition">
              {t('header.about')}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setLanguage('ru')}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  language === 'ru' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-background'
                }`}
              >
                РУ
              </button>
              <button
                onClick={() => setLanguage('kk')}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  language === 'kk' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-background'
                }`}
              >
                КК
              </button>
            </div>

            {/* Theme Switcher */}
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

            {/* Login Button */}
            <Button onClick={() => navigate('/auth')} size="sm">
              {t('auth.login')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">
                {t('hero.badge')}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t('hero.title')}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate('/search')}>
                  {t('hero.ask_button')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/documents')}>
                  {t('hero.create_button')}
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-24 h-24 mx-auto text-primary/30 mb-4" />
                <p className="text-muted-foreground">Законодательство РК 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <p className="text-sm text-muted-foreground">{t('stats.lawyers')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <p className="text-sm text-muted-foreground">{t('stats.documents')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99.8%</div>
              <p className="text-sm text-muted-foreground">{t('stats.accuracy')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">{t('stats.availability')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: t('features.rag_search'), desc: t('features.rag_desc') },
              { icon: FileText, title: t('features.doc_generation'), desc: t('features.doc_desc') },
              { icon: Zap, title: t('features.contract_analysis'), desc: t('features.contract_desc') },
              { icon: Globe, title: t('features.audio_to_law'), desc: t('features.audio_desc') },
              { icon: BarChart3, title: t('features.unlimited'), desc: t('features.unlimited_desc') },
              { icon: Lock, title: t('features.security'), desc: t('features.security_desc') },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">{t('search.title')}</h2>
            <p className="text-muted-foreground">{t('hero.subtitle')}</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t('hero.search_placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" size="lg" className="px-8">
              {t('hero.ask_button')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>{t('hero.popular')} Статья 395 ГК РК, Исковая давность, Трудовой договор</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('pricing.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-2">{t('pricing.start')}</h3>
              <p className="text-3xl font-bold text-primary mb-6">
                {language === 'ru' ? 'Бесплатно' : 'Тегін'}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.free_queries')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.basic_generation')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.email_support')}</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/auth')} className="w-full">
                {t('pricing.start_free')}
              </Button>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 border-primary/50 bg-primary/5">
              <Badge className="mb-4">{t('pricing.popular')}</Badge>
              <h3 className="text-2xl font-bold mb-2">{t('pricing.premium')}</h3>
              <p className="text-3xl font-bold text-primary mb-6">
                {language === 'ru' ? '$9.99/мес' : '$9.99/ай'}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.unlimited_queries')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.advanced_generation')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.contract_analysis')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.audio_transcription')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{t('pricing.priority_support')}</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/auth')} className="w-full">
                {t('pricing.choose_premium')}
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-b border-border bg-primary/5">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t('cta.subtitle')}</p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            {t('auth.login')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary/30">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/search')} className="hover:text-primary transition">{t('header.features')}</button></li>
                <li><button onClick={() => navigate('/documents')} className="hover:text-primary transition">{t('header.pricing')}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-primary transition">{t('header.about')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#privacy" className="hover:text-primary transition">{language === 'ru' ? 'Конфиденциальность' : 'Құпиялылық'}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@juristai.site" className="hover:text-primary transition">support@juristai.site</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
