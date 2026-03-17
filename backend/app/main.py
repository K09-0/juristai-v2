from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
from datetime import datetime
import logging

from app.config import get_settings
from app.services.auth_service import get_auth_service
from app.services.rag_service import get_rag_service
from app.services.document_generator import get_document_generator
from app.services.legislation_parser import get_legislation_parser

# Логирование
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic модели
class LoginRequest(BaseModel):
    username: str
    password: str

class MagicLinkRequest(BaseModel):
    email: str

class RAGQueryRequest(BaseModel):
    query: str
    strict_mode: bool = True

class GenerateClaimRequest(BaseModel):
    plaintiff: str
    defendant: str
    claim_amount: float
    claim_description: str
    tone: str = "formal"

class GenerateComplaintRequest(BaseModel):
    complainant: str
    respondent: str
    complaint_subject: str
    complaint_description: str
    tone: str = "formal"

class GenerateContractRequest(BaseModel):
    party_a: str
    party_b: str
    contract_subject: str
    contract_terms: str
    contract_type: str = "general"
    tone: str = "formal"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения."""
    logger.info("JuristAI v2 API starting...")
    yield
    logger.info("JuristAI v2 API shutting down...")

# Создание приложения
app = FastAPI(
    title="JuristAI v2 API",
    description="Юридический AI-ассистент для Казахстана (бесплатные модели)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# HEALTH & INFO
# ============================================================================

@app.get("/")
async def root():
    """Корневой endpoint."""
    return {
        "name": "JuristAI v2 API",
        "version": "2.0.0",
        "status": "operational",
        "description": "Юридический AI-ассистент для Казахстана",
        "endpoints": {
            "health": "/health",
            "info": "/info",
            "auth": "/api/auth",
            "rag": "/api/rag",
            "documents": "/api/documents",
            "legislation": "/api/legislation"
        }
    }

@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса."""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/info")
async def app_info():
    """Информация о конфигурации приложения."""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "llm_config": {
            "use_ollama": settings.use_ollama,
            "ollama_model": settings.ollama_model if settings.use_ollama else None,
            "hf_model": settings.hf_model if settings.hf_api_token else None,
            "together_model": settings.together_model if settings.together_api_key else None
        },
        "embeddings_model": settings.embeddings_model
    }

# ============================================================================
# AUTHENTICATION
# ============================================================================

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Вход с логином и паролем"""
    auth_service = get_auth_service()
    success, result = auth_service.login_with_credentials(request.username, request.password)
    
    if not success:
        raise HTTPException(status_code=401, detail="Неверные учетные данные")
    
    return result

@app.post("/api/auth/magic-link")
async def create_magic_link(request: MagicLinkRequest):
    """Создать волшебную ссылку для входа"""
    auth_service = get_auth_service()
    token = auth_service.create_magic_link(request.email)
    
    logger.info(f"Волшебная ссылка создана для {request.email}")
    
    return {
        "status": "success",
        "message": f"Ссылка отправлена на {request.email}",
        "token": token
    }

@app.post("/api/auth/verify-magic-link/{token}")
async def verify_magic_link(token: str):
    """Проверить волшебную ссылку"""
    auth_service = get_auth_service()
    success, result = auth_service.verify_magic_link(token)
    
    if not success:
        raise HTTPException(status_code=401, detail="Неверная или истекшая ссылка")
    
    return result

@app.post("/api/auth/oauth/{provider}")
async def oauth_callback(provider: str, request: Request):
    """OAuth callback (Google/Apple)"""
    auth_service = get_auth_service()
    
    try:
        body = await request.json()
        oauth_token = body.get("token")
    except:
        oauth_token = None
    
    if not oauth_token:
        raise HTTPException(status_code=400, detail="OAuth токен не предоставлен")
    
    success, result = auth_service.verify_oauth_token(provider, oauth_token)
    
    if not success:
        raise HTTPException(status_code=401, detail="Ошибка OAuth")
    
    return result

# ============================================================================
# RAG SEARCH
# ============================================================================

@app.post("/api/rag/query")
async def rag_query(request: RAGQueryRequest):
    """Запрос к законодательству РК с RAG"""
    rag_service = await get_rag_service()
    
    result = await rag_service.query_legislation(
        query=request.query,
        strict_mode=request.strict_mode
    )
    
    return result

@app.get("/api/rag/amendments")
async def get_amendments(days: int = 7):
    """Получить поправки за последние N дней"""
    rag_service = await get_rag_service()
    
    result = await rag_service.get_amendments_summary(days=days)
    
    return result

@app.get("/api/rag/compare/{code}/{article}")
async def compare_versions(code: str, article: str):
    """Сравнить версии статьи"""
    rag_service = await get_rag_service()
    
    result = await rag_service.compare_legislation_versions(code, article)
    
    return result

# ============================================================================
# DOCUMENT GENERATION
# ============================================================================

@app.post("/api/documents/generate-claim")
async def generate_claim(request: GenerateClaimRequest):
    """Генерировать исковое заявление"""
    generator = get_document_generator()
    
    result = await generator.generate_claim(
        plaintiff=request.plaintiff,
        defendant=request.defendant,
        claim_amount=request.claim_amount,
        claim_description=request.claim_description,
        tone=request.tone
    )
    
    return result

@app.post("/api/documents/generate-complaint")
async def generate_complaint(request: GenerateComplaintRequest):
    """Генерировать претензию"""
    generator = get_document_generator()
    
    result = await generator.generate_complaint(
        complainant=request.complainant,
        respondent=request.respondent,
        complaint_subject=request.complaint_subject,
        complaint_description=request.complaint_description,
        tone=request.tone
    )
    
    return result

@app.post("/api/documents/generate-contract")
async def generate_contract(request: GenerateContractRequest):
    """Генерировать договор"""
    generator = get_document_generator()
    
    result = await generator.generate_contract(
        party_a=request.party_a,
        party_b=request.party_b,
        contract_subject=request.contract_subject,
        contract_terms=request.contract_terms,
        contract_type=request.contract_type,
        tone=request.tone
    )
    
    return result

@app.post("/api/documents/export-pdf")
async def export_pdf(request: dict):
    """Экспортировать документ в PDF"""
    generator = get_document_generator()
    
    result = await generator.export_to_pdf(
        content=request.get("content", ""),
        filename=request.get("filename", "document.pdf")
    )
    
    return result

@app.post("/api/documents/export-docx")
async def export_docx(request: dict):
    """Экспортировать документ в DOCX"""
    generator = get_document_generator()
    
    result = await generator.export_to_docx(
        content=request.get("content", ""),
        filename=request.get("filename", "document.docx")
    )
    
    return result

# ============================================================================
# LEGISLATION PARSER
# ============================================================================

@app.get("/api/legislation/list")
async def get_legislation_list():
    """Получить список всех НПА РК"""
    parser = await get_legislation_parser()
    
    legislation_list = await parser.fetch_legislation_list()
    
    return {
        "status": "success",
        "count": len(legislation_list),
        "legislation": legislation_list
    }

@app.get("/api/legislation/{code}")
async def get_legislation_content(code: str):
    """Получить содержимое конкретного НПА"""
    parser = await get_legislation_parser()
    
    content = await parser.fetch_legislation_content(code)
    
    if not content:
        raise HTTPException(status_code=404, detail="НПА не найдена")
    
    return content

@app.get("/api/legislation/search")
async def search_legislation(q: str):
    """Поиск в законодательстве"""
    parser = await get_legislation_parser()
    
    results = await parser.search_legislation(q)
    
    return {
        "status": "success",
        "query": q,
        "count": len(results),
        "results": results
    }

@app.get("/api/legislation/monitor")
async def monitor_legislation():
    """Ежедневный мониторинг законодательства"""
    parser = await get_legislation_parser()
    
    result = await parser.monitor_daily()
    
    return result

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Необработанное исключение: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Внутренняя ошибка сервера",
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
