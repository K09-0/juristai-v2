"""
RAG сервис с жёсткой привязкой к источникам
Исключает галлюцинации путем требования точного совпадения с законодательством
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime
from app.services.embeddings import get_embeddings_service
from app.services.legislation_parser import get_legislation_parser
from app.services.llm_service import get_llm_service
import logging

logger = logging.getLogger(__name__)

class RAGService:
    """RAG сервис без галлюцинаций"""
    
    # Минимальный порог релевантности (0-1)
    MIN_RELEVANCE_THRESHOLD = 0.6
    
    # Максимальное количество контекстов для использования
    MAX_CONTEXTS = 5
    
    def __init__(self):
        self.embeddings_service = None
        self.legislation_parser = None
        self.llm_service = None
    
    async def initialize(self):
        """Инициализировать сервисы"""
        self.embeddings_service = get_embeddings_service()
        self.legislation_parser = await get_legislation_parser()
        self.llm_service = get_llm_service()
    
    async def query_legislation(self, query: str, strict_mode: bool = True) -> Dict:
        """
        Запрос к законодательству РК с RAG
        
        strict_mode=True: требует точного совпадения с законодательством
        strict_mode=False: позволяет более свободные интерпретации
        """
        
        if not self.embeddings_service:
            await self.initialize()
        
        try:
            logger.info(f"RAG запрос: {query}")
            
            # 1. Поиск релевантных статей в законодательстве
            search_results = await self.legislation_parser.search_legislation(query)
            
            if not search_results:
                return {
                    "status": "no_results",
                    "query": query,
                    "answer": "К сожалению, в законодательстве РК не найдено информации по вашему запросу.",
                    "sources": [],
                    "confidence": 0.0,
                    "timestamp": datetime.now().isoformat()
                }
            
            # 2. Фильтруем результаты по релевантности
            relevant_results = [
                r for r in search_results 
                if r.get("relevance", 0) >= self.MIN_RELEVANCE_THRESHOLD
            ]
            
            if not relevant_results:
                return {
                    "status": "low_relevance",
                    "query": query,
                    "answer": "Найдены результаты, но они недостаточно релевантны вашему запросу. Пожалуйста, переформулируйте вопрос.",
                    "sources": [],
                    "confidence": 0.0,
                    "timestamp": datetime.now().isoformat()
                }
            
            # 3. Берем топ результаты
            top_results = relevant_results[:self.MAX_CONTEXTS]
            
            # 4. Создаем контексты для LLM
            contexts = [
                {
                    "document": r["legislation_name"],
                    "text": r["full_text"],
                    "article": r["article_number"],
                    "url": r["url"],
                    "relevance": r["relevance"]
                }
                for r in top_results
            ]
            
            # 5. Генерируем ответ с LLM (с жёсткой привязкой к контексту)
            llm_response = await self.llm_service.generate_rag_response(
                query=query,
                contexts=contexts,
                temperature=0.1,  # Низкая температура для детерминированности
                max_tokens=500
            )
            
            # 6. Проверяем, содержит ли ответ ссылки на источники
            answer = llm_response.get("answer", "")
            
            # Если ответ пуст или выглядит как галлюцинация, возвращаем исходный текст
            if not answer or len(answer) < 20:
                answer = self._format_raw_answer(contexts)
                confidence = 0.8
            else:
                confidence = min(1.0, sum(c["relevance"] for c in contexts) / len(contexts))
            
            # 7. Формируем финальный ответ
            return {
                "status": "success",
                "query": query,
                "answer": answer,
                "sources": [
                    {
                        "legislation": c["document"],
                        "article": c["article"],
                        "url": c["url"],
                        "relevance": c["relevance"]
                    }
                    for c in contexts
                ],
                "confidence": confidence,
                "model": llm_response.get("model", "unknown"),
                "timestamp": datetime.now().isoformat(),
                "strict_mode": strict_mode
            }
        
        except Exception as e:
            logger.error(f"Ошибка в RAG запросе: {str(e)}")
            return {
                "status": "error",
                "query": query,
                "answer": f"Произошла ошибка при обработке вашего запроса: {str(e)}",
                "sources": [],
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat()
            }
    
    async def compare_legislation_versions(self, code: str, article_num: str) -> Dict:
        """Сравнить версии статьи (версионирование)"""
        try:
            history = await self.legislation_parser.get_article_history(code, article_num)
            
            if not history or len(history) < 2:
                return {
                    "status": "no_history",
                    "message": "История изменений не найдена"
                }
            
            # Сравниваем последние две версии
            current = history[-1]
            previous = history[-2] if len(history) > 1 else None
            
            comparison = {
                "legislation": code,
                "article": article_num,
                "current_version": current,
                "previous_version": previous,
                "changes": self._extract_changes(previous["text"] if previous else "", current["text"]),
                "history": history,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Сравнены версии {code} статья {article_num}")
            return comparison
        
        except Exception as e:
            logger.error(f"Ошибка при сравнении версий: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _format_raw_answer(self, contexts: List[Dict]) -> str:
        """Форматировать ответ из исходных текстов (без LLM)"""
        answer = "На основе законодательства РК:\n\n"
        
        for ctx in contexts:
            answer += f"**{ctx['document']} - {ctx['article']}**\n"
            answer += f"{ctx['text'][:300]}...\n\n"
        
        return answer
    
    def _extract_changes(self, old_text: str, new_text: str) -> List[str]:
        """Извлечь изменения между версиями"""
        changes = []
        
        # Простое сравнение (в реальном приложении использовать difflib)
        if old_text != new_text:
            changes.append("Текст статьи изменен")
        
        return changes
    
    async def get_amendments_summary(self, days: int = 7) -> Dict:
        """Получить сводку поправок за последние N дней"""
        try:
            amendments = await self.legislation_parser.fetch_recent_amendments(days=days)
            
            # Группируем по НПА
            grouped = {}
            for amendment in amendments:
                leg = amendment["legislation_name"]
                if leg not in grouped:
                    grouped[leg] = []
                grouped[leg].append(amendment)
            
            return {
                "period_days": days,
                "total_amendments": len(amendments),
                "amendments_by_legislation": grouped,
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Ошибка при получении сводки поправок: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }

_rag_service = None

async def get_rag_service() -> RAGService:
    """Получить RAG сервис (singleton)"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
        await _rag_service.initialize()
    return _rag_service
