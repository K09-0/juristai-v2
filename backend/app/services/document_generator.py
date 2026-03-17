"""
Сервис генерации юридических документов
Поддерживает: иски, претензии, договоры
"""

from typing import Dict, Optional
from datetime import datetime
from app.services.llm_service import get_llm_service
import logging

logger = logging.getLogger(__name__)

class DocumentGenerator:
    """Генератор юридических документов"""
    
    DOCUMENT_TYPES = {
        "claim": "Исковое заявление",
        "complaint": "Претензия",
        "contract": "Договор",
        "agreement": "Соглашение",
        "power_of_attorney": "Доверенность",
        "complaint_appeal": "Жалоба на решение"
    }
    
    TONES = {
        "formal": "Формальный, официальный стиль",
        "neutral": "Нейтральный, объективный стиль",
        "aggressive": "Агрессивный, требовательный стиль",
        "protective": "Защитный, осторожный стиль"
    }
    
    def __init__(self):
        self.llm_service = get_llm_service()
    
    async def generate_claim(
        self,
        plaintiff: str,
        defendant: str,
        claim_amount: float,
        claim_description: str,
        tone: str = "formal"
    ) -> Dict:
        """Генерировать исковое заявление"""
        
        prompt = f"""Ты — опытный казахстанский юрист. Создай исковое заявление на основе следующей информации.

ИНФОРМАЦИЯ:
- Истец: {plaintiff}
- Ответчик: {defendant}
- Сумма иска: {claim_amount} тенге
- Описание требований: {claim_description}
- Стиль: {self.TONES.get(tone, "формальный")}

ТРЕБОВАНИЯ:
1. Используй только действующее законодательство РК (ГК РК, ТК РК и т.д.)
2. Укажи конкретные статьи и пункты законов
3. Структура: Вводная часть → Описание фактов → Правовое обоснование → Требования
4. Язык: Русский (казахский перевод опционален)
5. Формат: Официальный юридический документ

ИСКОВОЕ ЗАЯВЛЕНИЕ:"""
        
        try:
            response = await self.llm_service.generate_rag_response(
                query=prompt,
                contexts=[],  # Используем только LLM без RAG контекста
                temperature=0.3,
                max_tokens=2000
            )
            
            document_text = response.get("answer", "")
            
            return {
                "status": "success",
                "document_type": "claim",
                "document_type_name": self.DOCUMENT_TYPES["claim"],
                "content": document_text,
                "metadata": {
                    "plaintiff": plaintiff,
                    "defendant": defendant,
                    "claim_amount": claim_amount,
                    "tone": tone,
                    "generated_at": datetime.now().isoformat(),
                    "model": response.get("model", "unknown")
                }
            }
        except Exception as e:
            logger.error(f"Ошибка при генерации иска: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def generate_complaint(
        self,
        complainant: str,
        respondent: str,
        complaint_subject: str,
        complaint_description: str,
        tone: str = "formal"
    ) -> Dict:
        """Генерировать претензию"""
        
        prompt = f"""Ты — опытный казахстанский юрист. Создай претензию на основе следующей информации.

ИНФОРМАЦИЯ:
- Истец: {complainant}
- Ответчик: {respondent}
- Предмет претензии: {complaint_subject}
- Описание: {complaint_description}
- Стиль: {self.TONES.get(tone, "формальный")}

ТРЕБОВАНИЯ:
1. Используй только действующее законодательство РК
2. Укажи конкретные статьи законов
3. Структура: Вводная часть → Описание нарушения → Требования → Сроки ответа
4. Язык: Русский
5. Формат: Официальная претензия

ПРЕТЕНЗИЯ:"""
        
        try:
            response = await self.llm_service.generate_rag_response(
                query=prompt,
                contexts=[],
                temperature=0.3,
                max_tokens=1500
            )
            
            document_text = response.get("answer", "")
            
            return {
                "status": "success",
                "document_type": "complaint",
                "document_type_name": self.DOCUMENT_TYPES["complaint"],
                "content": document_text,
                "metadata": {
                    "complainant": complainant,
                    "respondent": respondent,
                    "subject": complaint_subject,
                    "tone": tone,
                    "generated_at": datetime.now().isoformat(),
                    "model": response.get("model", "unknown")
                }
            }
        except Exception as e:
            logger.error(f"Ошибка при генерации претензии: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def generate_contract(
        self,
        party_a: str,
        party_b: str,
        contract_subject: str,
        contract_terms: str,
        contract_type: str = "general",
        tone: str = "formal"
    ) -> Dict:
        """Генерировать договор"""
        
        prompt = f"""Ты — опытный казахстанский юрист. Создай договор на основе следующей информации.

ИНФОРМАЦИЯ:
- Сторона А: {party_a}
- Сторона Б: {party_b}
- Предмет договора: {contract_subject}
- Условия: {contract_terms}
- Тип договора: {contract_type}
- Стиль: {self.TONES.get(tone, "формальный")}

ТРЕБОВАНИЯ:
1. Используй только действующее законодательство РК (ГК РК)
2. Укажи конкретные статьи
3. Структура: Преамбула → Предмет → Права и обязанности → Ответственность → Заключительные положения
4. Язык: Русский
5. Формат: Официальный договор

ДОГОВОР:"""
        
        try:
            response = await self.llm_service.generate_rag_response(
                query=prompt,
                contexts=[],
                temperature=0.3,
                max_tokens=2500
            )
            
            document_text = response.get("answer", "")
            
            return {
                "status": "success",
                "document_type": "contract",
                "document_type_name": self.DOCUMENT_TYPES["contract"],
                "content": document_text,
                "metadata": {
                    "party_a": party_a,
                    "party_b": party_b,
                    "subject": contract_subject,
                    "contract_type": contract_type,
                    "tone": tone,
                    "generated_at": datetime.now().isoformat(),
                    "model": response.get("model", "unknown")
                }
            }
        except Exception as e:
            logger.error(f"Ошибка при генерации договора: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def export_to_pdf(self, content: str, filename: str) -> Dict:
        """Экспортировать документ в PDF"""
        try:
            # В реальном приложении использовать reportlab или weasyprint
            logger.info(f"Экспорт в PDF: {filename}")
            
            return {
                "status": "success",
                "format": "pdf",
                "filename": filename,
                "message": "Документ готов к загрузке"
            }
        except Exception as e:
            logger.error(f"Ошибка при экспорте в PDF: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def export_to_docx(self, content: str, filename: str) -> Dict:
        """Экспортировать документ в DOCX"""
        try:
            # В реальном приложении использовать python-docx
            logger.info(f"Экспорт в DOCX: {filename}")
            
            return {
                "status": "success",
                "format": "docx",
                "filename": filename,
                "message": "Документ готов к загрузке"
            }
        except Exception as e:
            logger.error(f"Ошибка при экспорте в DOCX: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }

_generator = None

def get_document_generator() -> DocumentGenerator:
    """Получить генератор документов (singleton)"""
    global _generator
    if _generator is None:
        _generator = DocumentGenerator()
    return _generator
