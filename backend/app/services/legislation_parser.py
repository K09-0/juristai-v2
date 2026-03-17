"""
Парсер законодательства РК с сайта adilet.zan.kz
Мониторит все поправки и изменения ежедневно
"""

import httpx
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)

class LegislationParser:
    """Парсер законодательства РК"""
    
    BASE_URL = "https://adilet.zan.kz"
    
    # Основные НПА РК
    LEGISLATION_CODES = {
        "gk": "Гражданский кодекс РК",
        "tk": "Трудовой кодекс РК",
        "uk": "Уголовный кодекс РК",
        "koap": "Кодекс об административных правонарушениях РК",
        "zpp": "Закон о защите прав потребителей",
        "zsu": "Закон о страховании",
        "zk": "Закон о кредитовании",
        "zn": "Закон о налогах",
        "zb": "Закон о банках",
    }
    
    def __init__(self):
        self.settings = get_settings()
        self.client = httpx.AsyncClient(timeout=30.0)
        self.legislation_cache = {}
        self.last_update = None
    
    async def fetch_legislation_list(self) -> List[Dict]:
        """Получить список всех НПА РК"""
        try:
            # Парсим главную страницу adilet.zan.kz
            response = await self.client.get(f"{self.BASE_URL}/kz/")
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            legislation_list = []
            
            # Поиск основных кодексов и законов
            for code, name in self.LEGISLATION_CODES.items():
                legislation_list.append({
                    "code": code,
                    "name": name,
                    "url": f"{self.BASE_URL}/kz/documents/{code}",
                    "last_checked": datetime.now().isoformat()
                })
            
            logger.info(f"Найдено {len(legislation_list)} основных НПА РК")
            return legislation_list
        except Exception as e:
            logger.error(f"Ошибка при получении списка НПА: {str(e)}")
            return []
    
    async def fetch_legislation_content(self, code: str) -> Dict:
        """Получить содержимое конкретного НПА"""
        try:
            url = f"{self.BASE_URL}/kz/documents/{code}"
            response = await self.client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Парсим структуру документа
            content = {
                "code": code,
                "name": self.LEGISLATION_CODES.get(code, code),
                "url": url,
                "articles": [],
                "last_updated": datetime.now().isoformat(),
                "version": "2026"  # Текущая версия
            }
            
            # Парсим статьи
            articles = soup.find_all('div', class_='article')
            for article in articles:
                article_num = article.find('span', class_='article-num')
                article_text = article.find('div', class_='article-text')
                
                if article_num and article_text:
                    content["articles"].append({
                        "number": article_num.text.strip(),
                        "text": article_text.text.strip(),
                        "date_updated": datetime.now().isoformat()
                    })
            
            logger.info(f"Получено {len(content['articles'])} статей из {code}")
            return content
        except Exception as e:
            logger.error(f"Ошибка при получении содержимого {code}: {str(e)}")
            return {}
    
    async def fetch_recent_amendments(self, days: int = 7) -> List[Dict]:
        """Получить недавние поправки (за последние N дней)"""
        try:
            amendments = []
            
            # Поиск поправок в каждом НПА
            for code in self.LEGISLATION_CODES.keys():
                try:
                    url = f"{self.BASE_URL}/kz/documents/{code}/amendments"
                    response = await self.client.get(url)
                    
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')
                        
                        # Парсим список поправок
                        amendment_items = soup.find_all('div', class_='amendment-item')
                        for item in amendment_items:
                            date_elem = item.find('span', class_='date')
                            text_elem = item.find('div', class_='text')
                            
                            if date_elem and text_elem:
                                try:
                                    amendment_date = datetime.fromisoformat(date_elem.text.strip())
                                    
                                    # Проверяем, не старше ли N дней
                                    if (datetime.now() - amendment_date).days <= days:
                                        amendments.append({
                                            "legislation": code,
                                            "legislation_name": self.LEGISLATION_CODES[code],
                                            "date": amendment_date.isoformat(),
                                            "text": text_elem.text.strip(),
                                            "type": "amendment",
                                            "status": "active"
                                        })
                                except ValueError:
                                    pass
                except Exception as e:
                    logger.warning(f"Ошибка при получении поправок для {code}: {str(e)}")
            
            logger.info(f"Найдено {len(amendments)} поправок за последние {days} дней")
            return amendments
        except Exception as e:
            logger.error(f"Ошибка при получении поправок: {str(e)}")
            return []
    
    async def search_legislation(self, query: str) -> List[Dict]:
        """Поиск в законодательстве РК"""
        try:
            results = []
            
            # Поиск по всем НПА
            for code in self.LEGISLATION_CODES.keys():
                content = await self.fetch_legislation_content(code)
                
                if content and "articles" in content:
                    for article in content["articles"]:
                        # Поиск по номеру статьи или тексту
                        if (query.lower() in article["number"].lower() or 
                            query.lower() in article["text"].lower()):
                            results.append({
                                "legislation": code,
                                "legislation_name": content["name"],
                                "article_number": article["number"],
                                "article_text": article["text"][:500],  # Первые 500 символов
                                "full_text": article["text"],
                                "url": f"{self.BASE_URL}/kz/documents/{code}#{article['number']}",
                                "relevance": self._calculate_relevance(query, article["text"])
                            })
            
            # Сортируем по релевантности
            results.sort(key=lambda x: x["relevance"], reverse=True)
            
            logger.info(f"Найдено {len(results)} результатов для '{query}'")
            return results[:20]  # Возвращаем топ 20
        except Exception as e:
            logger.error(f"Ошибка при поиске: {str(e)}")
            return []
    
    def _calculate_relevance(self, query: str, text: str) -> float:
        """Вычислить релевантность результата"""
        query_lower = query.lower()
        text_lower = text.lower()
        
        # Точное совпадение
        if query_lower in text_lower:
            return 1.0
        
        # Частичное совпадение
        matches = sum(1 for word in query_lower.split() if word in text_lower)
        return matches / len(query_lower.split()) if query_lower.split() else 0
    
    async def get_article_history(self, code: str, article_num: str) -> List[Dict]:
        """Получить историю изменений статьи"""
        try:
            history = []
            
            # Парсим историю изменений
            url = f"{self.BASE_URL}/kz/documents/{code}/history/{article_num}"
            response = await self.client.get(url)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Парсим версии
                versions = soup.find_all('div', class_='version')
                for version in versions:
                    date_elem = version.find('span', class_='date')
                    text_elem = version.find('div', class_='text')
                    
                    if date_elem and text_elem:
                        history.append({
                            "date": date_elem.text.strip(),
                            "text": text_elem.text.strip(),
                            "version": len(history) + 1
                        })
            
            return history
        except Exception as e:
            logger.error(f"Ошибка при получении истории статьи: {str(e)}")
            return []
    
    async def monitor_daily(self) -> Dict:
        """Ежедневный мониторинг поправок"""
        try:
            logger.info("Начало ежедневного мониторинга законодательства РК")
            
            amendments = await self.fetch_recent_amendments(days=1)
            
            result = {
                "timestamp": datetime.now().isoformat(),
                "amendments_found": len(amendments),
                "amendments": amendments,
                "status": "success"
            }
            
            self.last_update = datetime.now()
            
            if amendments:
                logger.info(f"Найдено {len(amendments)} новых поправок")
            else:
                logger.info("Новых поправок не найдено")
            
            return result
        except Exception as e:
            logger.error(f"Ошибка при мониторинге: {str(e)}")
            return {
                "timestamp": datetime.now().isoformat(),
                "amendments_found": 0,
                "amendments": [],
                "status": "error",
                "error": str(e)
            }
    
    async def close(self):
        """Закрыть HTTP клиент"""
        await self.client.aclose()

_parser = None

async def get_legislation_parser() -> LegislationParser:
    """Получить парсер (singleton)"""
    global _parser
    if _parser is None:
        _parser = LegislationParser()
    return _parser
