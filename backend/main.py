from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from datetime import datetime
from io import BytesIO
import fitz
import os
import traceback
import json

from dotenv import load_dotenv
from supabase import create_client
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, func
from sqlalchemy.orm import declarative_base, sessionmaker

from llama_index.core.schema import Document
from llama_index.core import VectorStoreIndex
from llama_index.llms.together import TogetherLLM
from llama_index.embeddings.together import TogetherEmbedding

# -----------------  Auth & Env Setup -----------------

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")
# Load JSON string from env
firebase_json = os.getenv("FIREBASE_CREDENTIALS")

# Convert to dict and fix PEM key formatting
firebase_dict = json.loads(firebase_json)
firebase_dict["private_key"] = firebase_dict["private_key"].replace("\\n", "\n")

# Now load credentials
cred = credentials.Certificate(firebase_dict)
firebase_admin.initialize_app(cred)

async def verify_firebase_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
    try:
        token = auth_header.split(" ")[1]
        return firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

# -----------------  Database Setup -----------------

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Upload(Base):
    __tablename__ = "uploads"
    id = Column(Integer, primary_key=True)
    filename = Column(String)
    user_email = Column(String)
    upload_time = Column(DateTime, default=datetime.utcnow)

class Question(Base):
    __tablename__ = "qna_history"
    id = Column(Integer, primary_key=True)
    user_email = Column(String)
    filename = Column(String)
    question = Column(Text)
    answer = Column(Text)
    asked_at = Column(DateTime, default=func.now())

Base.metadata.create_all(bind=engine)

# -----------------  Supabase Setup -----------------

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "pdfs")  
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# -----------------  LLM Config -----------------

TOGETHER_MODEL_ID = "mistralai/Mixtral-8x7B-Instruct-v0.1"

def get_llm_components():
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TOGETHER_API_KEY not set.")
    llm = TogetherLLM(api_key=api_key, model=TOGETHER_MODEL_ID)
    embed_model = TogetherEmbedding(api_key=api_key, model_name="togethercomputer/m2-bert-80M-32k-retrieval")
    return llm, embed_model

# -----------------  FastAPI Setup -----------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "🚀 DocuQuery backend running."}

# -----------------  Upload Route -----------------

@app.post("/upload")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    user = await verify_firebase_token(request)
    email = user["email"]

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    filename = file.filename
    pdf_path = f"{email}/{filename}"
    text_path = f"{email}/{filename}.txt"

    try:
        # Upload PDF
        supabase.storage.from_(SUPABASE_BUCKET).upload(path=pdf_path, file=content)

        # Extract text
        with fitz.open(stream=content, filetype="pdf") as doc:
            extracted_text = "".join([page.get_text() for page in doc])

        # Upload extracted text
        supabase.storage.from_(SUPABASE_BUCKET).upload(path=text_path, file=extracted_text.encode())

        # DB Entry
        db = SessionLocal()
        db.add(Upload(filename=filename, user_email=email))
        db.commit()
        db.close()

        return {"filename": filename, "message": "✅ Uploaded successfully."}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# -----------------  Ask Route -----------------

@app.post("/ask")
async def ask_question(request: Request, filename: str = Form(...), question: str = Form(...)):
    user = await verify_firebase_token(request)
    email = user["email"]
    text_path = f"{email}/{filename}.txt"

    try:
        res = supabase.storage.from_(SUPABASE_BUCKET).download(text_path)
        if not res:
            raise HTTPException(status_code=404, detail="Text file not found in Supabase.")

        content = res.decode("utf-8")
        document = Document(text=content)

        llm, embed_model = get_llm_components()
        index = VectorStoreIndex.from_documents([document], llm=llm, embed_model=embed_model)
        response = index.as_query_engine(llm=llm).query(question)

        # Save QnA
        db = SessionLocal()
        db.add(Question(user_email=email, filename=filename, question=question, answer=str(response)))
        db.commit()
        db.close()

        return {"filename": filename, "question": question, "answer": str(response)}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ask failed: {str(e)}")

# -----------------  My Files -----------------

@app.get("/my-files")
async def get_my_files(request: Request):
    user = await verify_firebase_token(request)
    email = user["email"]

    db = SessionLocal()
    uploads = db.query(Upload).filter(Upload.user_email == email).all()
    db.close()

    return [{"filename": f.filename, "uploaded": f.upload_time.isoformat()} for f in uploads]

# -----------------  QnA History -----------------

@app.get("/qna-history")
async def get_qna_history(request: Request, filename: str):
    user = await verify_firebase_token(request)
    email = user["email"]

    db = SessionLocal()
    try:
        records = db.query(Question).filter(
            Question.user_email == email,
            Question.filename == filename
        ).order_by(Question.asked_at.desc()).all()

        return [{
            "question": r.question,
            "answer": r.answer,
            "asked_at": r.asked_at.isoformat()
        } for r in records]

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Q&A history fetch failed.")
    finally:
        db.close()

