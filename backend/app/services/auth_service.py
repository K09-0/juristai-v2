"""
Сервис аутентификации с поддержкой:
- Встроенных аккаунтов (Admin/Lawyer)
- Magic links (email)
- OAuth Google/Apple
"""

import jwt
import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

class AuthService:
    """Сервис аутентификации"""
    
    # Встроенные аккаунты (Admin/Lawyer)
    BUILT_IN_USERS = {
        "admin": {
            "username": "admin",
            "password_hash": "Asdf!234",  # В продакшене использовать bcrypt
            "email": "admin@juristai.site",
            "role": "admin",
            "permissions": ["read", "write", "delete", "manage_users"]
        },
        "lawyer": {
            "username": "lawyer",
            "password_hash": "Asdf!234",
            "email": "lawyer@juristai.site",
            "role": "user",
            "permissions": ["read", "write"]
        }
    }
    
    def __init__(self):
        self.settings = get_settings()
        self.magic_links = {}  # {token: {email, expires_at}}
        self.sessions = {}  # {token: {user_id, expires_at}}
    
    def login_with_credentials(self, username: str, password: str) -> Tuple[bool, Optional[Dict]]:
        """Вход с логином и паролем"""
        user = self.BUILT_IN_USERS.get(username)
        
        if not user:
            logger.warning(f"Попытка входа с несуществующим пользователем: {username}")
            return False, None
        
        # В продакшене использовать bcrypt.verify()
        if user["password_hash"] != password:
            logger.warning(f"Неверный пароль для пользователя: {username}")
            return False, None
        
        # Создаем JWT токен
        token = self._create_jwt_token(user)
        
        logger.info(f"Пользователь {username} успешно вошел")
        
        return True, {
            "token": token,
            "user": {
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "permissions": user["permissions"]
            }
        }
    
    def create_magic_link(self, email: str) -> str:
        """Создать волшебную ссылку для входа"""
        token = secrets.token_urlsafe(32)
        
        self.magic_links[token] = {
            "email": email,
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat(),
            "used": False
        }
        
        logger.info(f"Создана волшебная ссылка для {email}")
        
        # В реальном приложении отправить email с ссылкой
        # await send_magic_link_email(email, token)
        
        return token
    
    def verify_magic_link(self, token: str) -> Tuple[bool, Optional[Dict]]:
        """Проверить волшебную ссылку"""
        link_data = self.magic_links.get(token)
        
        if not link_data:
            logger.warning(f"Попытка использования несуществующей волшебной ссылки")
            return False, None
        
        # Проверяем срок действия
        expires_at = datetime.fromisoformat(link_data["expires_at"])
        if datetime.now() > expires_at:
            logger.warning(f"Волшебная ссылка истекла для {link_data['email']}")
            return False, None
        
        # Проверяем, не использована ли уже
        if link_data["used"]:
            logger.warning(f"Волшебная ссылка уже использована для {link_data['email']}")
            return False, None
        
        # Отмечаем как использованную
        link_data["used"] = True
        
        # Создаем или получаем пользователя
        email = link_data["email"]
        user = self._get_or_create_user(email)
        
        # Создаем JWT токен
        token = self._create_jwt_token(user)
        
        logger.info(f"Пользователь {email} вошел через волшебную ссылку")
        
        return True, {
            "token": token,
            "user": user
        }
    
    def verify_oauth_token(self, provider: str, oauth_token: str) -> Tuple[bool, Optional[Dict]]:
        """Проверить OAuth токен (Google/Apple)"""
        try:
            # В реальном приложении проверить токен у провайдера
            # Здесь упрощенная версия
            
            if provider == "google":
                user_info = self._verify_google_token(oauth_token)
            elif provider == "apple":
                user_info = self._verify_apple_token(oauth_token)
            else:
                return False, None
            
            if not user_info:
                return False, None
            
            # Создаем или получаем пользователя
            user = self._get_or_create_user(user_info["email"], user_info)
            
            # Создаем JWT токен
            token = self._create_jwt_token(user)
            
            logger.info(f"Пользователь {user_info['email']} вошел через {provider}")
            
            return True, {
                "token": token,
                "user": user
            }
        except Exception as e:
            logger.error(f"Ошибка при проверке OAuth токена: {str(e)}")
            return False, None
    
    def verify_jwt_token(self, token: str) -> Tuple[bool, Optional[Dict]]:
        """Проверить JWT токен"""
        try:
            payload = jwt.decode(
                token,
                self.settings.secret_key,
                algorithms=[self.settings.algorithm]
            )
            
            # Проверяем срок действия
            if datetime.fromisoformat(payload["exp"]) < datetime.now():
                logger.warning("JWT токен истек")
                return False, None
            
            return True, payload
        except jwt.InvalidTokenError as e:
            logger.warning(f"Неверный JWT токен: {str(e)}")
            return False, None
    
    def _create_jwt_token(self, user: Dict) -> str:
        """Создать JWT токен"""
        payload = {
            "user_id": user["username"],
            "email": user["email"],
            "role": user["role"],
            "permissions": user["permissions"],
            "iat": datetime.now().isoformat(),
            "exp": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        token = jwt.encode(
            payload,
            self.settings.secret_key,
            algorithm=self.settings.algorithm
        )
        
        return token
    
    def _get_or_create_user(self, email: str, oauth_info: Optional[Dict] = None) -> Dict:
        """Получить или создать пользователя"""
        # Проверяем встроенные пользователи
        for user in self.BUILT_IN_USERS.values():
            if user["email"] == email:
                return user
        
        # Создаем нового пользователя из OAuth
        if oauth_info:
            return {
                "username": oauth_info.get("email", "").split("@")[0],
                "email": email,
                "role": "user",
                "permissions": ["read", "write"],
                "oauth_provider": oauth_info.get("provider"),
                "created_at": datetime.now().isoformat()
            }
        
        # Создаем пользователя для magic link
        return {
            "username": email.split("@")[0],
            "email": email,
            "role": "user",
            "permissions": ["read", "write"],
            "created_at": datetime.now().isoformat()
        }
    
    def _verify_google_token(self, token: str) -> Optional[Dict]:
        """Проверить Google OAuth токен"""
        # В реальном приложении использовать google-auth библиотеку
        # from google.auth.transport import requests
        # from google.oauth2 import id_token
        
        # Упрощенная версия для демонстрации
        try:
            # Здесь должна быть реальная проверка токена у Google
            logger.info("Google OAuth токен проверен (упрощенная версия)")
            return {
                "email": "user@gmail.com",
                "name": "Google User",
                "provider": "google"
            }
        except Exception as e:
            logger.error(f"Ошибка при проверке Google токена: {str(e)}")
            return None
    
    def _verify_apple_token(self, token: str) -> Optional[Dict]:
        """Проверить Apple OAuth токен"""
        # В реальном приложении использовать apple-auth библиотеку
        
        try:
            logger.info("Apple OAuth токен проверен (упрощенная версия)")
            return {
                "email": "user@icloud.com",
                "name": "Apple User",
                "provider": "apple"
            }
        except Exception as e:
            logger.error(f"Ошибка при проверке Apple токена: {str(e)}")
            return None

_auth_service = None

def get_auth_service() -> AuthService:
    """Получить сервис аутентификации (singleton)"""
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
