import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Lock, Chrome, Apple } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

/**
 * Страница аутентификации
 * Поддерживает:
 * - Вход с логином/паролем (Admin/Lawyer)
 * - Волшебные ссылки (email magic link)
 * - OAuth Google/Apple
 */

export default function Auth() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    try {
      // API запрос к бэкенду
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/dashboard'
      } else {
        setMessage('Неверные учетные данные')
      }
    } catch (error) {
      setMessage('Ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        setMessage('Ссылка отправлена на ваш email')
      } else {
        setMessage('Ошибка при отправке ссылки')
      }
    } catch (error) {
      setMessage('Ошибка при отправке')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Перенаправить на Google OAuth
    window.location.href = '/api/auth/google'
  }

  const handleAppleLogin = () => {
    // Перенаправить на Apple OAuth
    window.location.href = '/api/auth/apple'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">JuristAI</h1>
          <p className="text-muted-foreground">{t('auth.login')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="credentials">{t('auth.username')}</TabsTrigger>
            <TabsTrigger value="magic">{t('auth.magic_link')}</TabsTrigger>
          </TabsList>

          {/* Вход с логином/паролем */}
          <TabsContent value="credentials" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('auth.username')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="admin или lawyer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Демо: admin / lawyer
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Asdf!234"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Пароль: Asdf!234
              </p>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className="w-full"
            >
              {loading ? 'Загрузка...' : t('auth.login')}
            </Button>
          </TabsContent>

          {/* Волшебная ссылка */}
          <TabsContent value="magic" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Мы отправим вам ссылку для входа
              </p>
            </div>

            <Button
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? 'Отправка...' : t('auth.send_link')}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Сообщение */}
        {message && (
          <div className="mt-4 p-3 rounded-lg bg-blue-100 text-blue-700 text-sm">
            {message}
          </div>
        )}

        {/* OAuth */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">или</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
          >
            <Chrome className="w-4 h-4 mr-2" />
            {t('auth.google')}
          </Button>

          <Button
            onClick={handleAppleLogin}
            variant="outline"
            className="w-full"
          >
            <Apple className="w-4 h-4 mr-2" />
            {t('auth.apple')}
          </Button>
        </div>

        {/* Информация */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Тестовые учетные данные:</p>
          <ul className="space-y-1">
            <li>👤 Admin: <code className="bg-background px-2 py-1 rounded">admin / Asdf!234</code></li>
            <li>⚖️ Lawyer: <code className="bg-background px-2 py-1 rounded">lawyer / Asdf!234</code></li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
