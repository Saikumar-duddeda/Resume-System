from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from PyPDF2 import PdfReader
from docx import Document
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from openai import AsyncOpenAI
import io
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class PersonalInfo(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""

class ExperienceItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # work, internship, hackathon
    title: str
    organization: str
    description: str
    skills: List[str] = []
    start_date: str
    end_date: str
    verified: bool = False
    location: str = ""
    achievements: List[str] = []

class InternshipItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    description: str
    skills: List[str] = []
    start_date: str
    end_date: str
    location: str = ""
    certificate_url: str = ""

class HackathonItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    organizer: str
    project_title: str
    description: str
    achievement: str = ""  # Winner, Runner-up, Participant
    technologies: List[str] = []
    date: str
    project_link: str = ""

class EventItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    organization: str
    description: str
    date: str
    role: str = ""  # Organizer, Participant, Speaker, etc.

class EducationItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    degree: str
    institution: str
    field: str
    start_date: str
    end_date: str
    gpa: str = ""

class ProjectItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    technologies: List[str] = []
    link: str = ""

class SkillItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    proficiency: int = 3
    verified: bool = False

class ResumeData(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    experiences: List[ExperienceItem] = []
    internships: List[InternshipItem] = []
    hackathons: List[HackathonItem] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    skills: List[SkillItem] = []
    events: List[EventItem] = []

class Resume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    template: str = "modern"
    data: ResumeData = Field(default_factory=ResumeData)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ResumeCreate(BaseModel):
    title: str
    template: str = "modern"

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template: Optional[str] = None
    data: Optional[ResumeData] = None

class AIRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None

class ScoreResponse(BaseModel):
    score: int
    breakdown: Dict[str, int]
    suggestions: List[str]

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def call_llm(prompt: str, system_message: str = "You are a helpful assistant.") -> str:
    if not openai_client:
        raise HTTPException(status_code=503, detail="AI service not configured. Please add OPENAI_API_KEY to use AI features.")
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"LLM error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI service error")

# Auth Endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token({"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user_doc = await db.users.find_one({"email": user_data.email})
    if not user_doc or not verify_password(user_data.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    if isinstance(user_doc.get("created_at"), str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    user = User(**user_doc)
    access_token = create_access_token({"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Resume Endpoints
@api_router.post("/resumes", response_model=Resume)
async def create_resume(resume_data: ResumeCreate, current_user: User = Depends(get_current_user)):
    resume = Resume(
        user_id=current_user.id,
        title=resume_data.title,
        template=resume_data.template
    )
    resume_dict = resume.model_dump()
    resume_dict["created_at"] = resume_dict["created_at"].isoformat()
    resume_dict["updated_at"] = resume_dict["updated_at"].isoformat()
    
    await db.resumes.insert_one(resume_dict)
    return resume

@api_router.get("/resumes", response_model=List[Resume])
async def get_resumes(current_user: User = Depends(get_current_user)):
    resumes = await db.resumes.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for resume in resumes:
        if isinstance(resume.get("created_at"), str):
            resume["created_at"] = datetime.fromisoformat(resume["created_at"])
        if isinstance(resume.get("updated_at"), str):
            resume["updated_at"] = datetime.fromisoformat(resume["updated_at"])
    return resumes

@api_router.get("/resumes/{resume_id}", response_model=Resume)
async def get_resume(resume_id: str, current_user: User = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user.id}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if isinstance(resume.get("created_at"), str):
        resume["created_at"] = datetime.fromisoformat(resume["created_at"])
    if isinstance(resume.get("updated_at"), str):
        resume["updated_at"] = datetime.fromisoformat(resume["updated_at"])
    return Resume(**resume)

@api_router.put("/resumes/{resume_id}", response_model=Resume)
async def update_resume(resume_id: str, resume_update: ResumeUpdate, current_user: User = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user.id})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    update_dict = resume_update.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.resumes.update_one({"id": resume_id}, {"$set": update_dict})
    
    updated_resume = await db.resumes.find_one({"id": resume_id}, {"_id": 0})
    if isinstance(updated_resume.get("created_at"), str):
        updated_resume["created_at"] = datetime.fromisoformat(updated_resume["created_at"])
    if isinstance(updated_resume.get("updated_at"), str):
        updated_resume["updated_at"] = datetime.fromisoformat(updated_resume["updated_at"])
    return Resume(**updated_resume)

@api_router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, current_user: User = Depends(get_current_user)):
    result = await db.resumes.delete_one({"id": resume_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"message": "Resume deleted successfully"}

# AI Endpoints
@api_router.post("/ai/generate-summary")
async def generate_summary(request: AIRequest, current_user: User = Depends(get_current_user)):
    context = request.context or {}
    experiences = context.get("experiences", [])
    internships = context.get("internships", [])
    hackathons = context.get("hackathons", [])
    skills = context.get("skills", [])
    
    exp_text = "\n".join([f"- {exp.get('title', '')} at {exp.get('organization', '')}: {exp.get('description', '')}" for exp in experiences])
    intern_text = "\n".join([f"- {intern.get('title', '')} at {intern.get('company', '')}: {intern.get('description', '')}" for intern in internships])
    hackathon_text = "\n".join([f"- {hack.get('name', '')}: {hack.get('project_title', '')} - {hack.get('achievement', '')}" for hack in hackathons])
    skills_text = ", ".join([skill.get("name", "") for skill in skills])
    
    prompt = f"""Generate a professional resume summary (2-3 sentences) for someone with the following:

Work Experiences:
{exp_text if exp_text else 'None'}

Internships:
{intern_text if intern_text else 'None'}

Hackathons:
{hackathon_text if hackathon_text else 'None'}

Skills: {skills_text}

Write a compelling summary that highlights key strengths and career focus. Keep it concise and impactful."""
    
    try:
        summary = await call_llm(prompt, "You are a professional resume writer.")
        return {"summary": summary}
    except HTTPException as e:
        # If AI not available, return a helpful template
        if e.status_code == 503:
            return {
                "summary": f"Motivated professional with experience in {skills_text[:50]}... Proven track record in {'internships and ' if internships else ''}{'hackathons and ' if hackathons else ''}project development.",
                "note": "AI summary generation requires OpenAI API key. This is a template - please customize it."
            }
        raise

@api_router.post("/ai/optimize-content")
async def optimize_content(request: AIRequest, current_user: User = Depends(get_current_user)):
    prompt = f"""Optimize the following resume content for ATS (Applicant Tracking System) and make it more impactful:

{request.prompt}

Provide an improved version with strong action verbs, quantifiable achievements, and relevant keywords."""
    
    try:
        optimized = await call_llm(prompt, "You are a professional resume optimization expert.")
        return {"optimized": optimized}
    except HTTPException as e:
        if e.status_code == 503:
            return {
                "optimized": request.prompt,
                "note": "AI optimization requires OpenAI API key. Consider adding action verbs and quantifiable achievements."
            }
        raise

@api_router.post("/ai/calculate-score", response_model=ScoreResponse)
async def calculate_score(request: AIRequest, current_user: User = Depends(get_current_user)):
    resume_data = request.context or {}
    
    personal_info = resume_data.get("personal_info", {})
    summary = resume_data.get("summary", "")
    experiences = resume_data.get("experiences", [])
    internships = resume_data.get("internships", [])
    hackathons = resume_data.get("hackathons", [])
    education = resume_data.get("education", [])
    projects = resume_data.get("projects", [])
    skills = resume_data.get("skills", [])
    events = resume_data.get("events", [])
    
    scores = {
        "personal_info": 0,
        "summary": 0,
        "experience": 0,
        "education": 0,
        "skills": 0,
        "achievements": 0
    }
    suggestions = []
    
    if personal_info.get("full_name") and personal_info.get("email") and personal_info.get("phone"):
        scores["personal_info"] = 15
    else:
        suggestions.append("Complete your contact information")
    
    if summary and len(summary) > 50:
        scores["summary"] = 15
    else:
        suggestions.append("Add a professional summary (2-3 sentences)")
    
    total_work_exp = len(experiences) + len(internships)
    if total_work_exp >= 2:
        scores["experience"] = 25
    elif total_work_exp == 1:
        scores["experience"] = 15
        suggestions.append("Add more work experiences or internships")
    else:
        suggestions.append("Add work experiences or internships")
    
    if education:
        scores["education"] = 15
    else:
        suggestions.append("Add your education background")
    
    if skills and len(skills) >= 5:
        scores["skills"] = 15
    elif skills:
        scores["skills"] = 10
        suggestions.append("Add more skills (aim for 5+)")
    else:
        suggestions.append("Add your technical and professional skills")
    
    achievement_count = len(hackathons) + len(projects) + len(events)
    if achievement_count >= 3:
        scores["achievements"] = 15
    elif achievement_count >= 1:
        scores["achievements"] = 10
        suggestions.append("Add more projects, hackathons, or events")
    else:
        suggestions.append("Add projects, hackathons, or relevant events")
    
    total_score = sum(scores.values())
    
    if total_score < 60:
        suggestions.insert(0, "Your resume needs more content to stand out")
    elif total_score < 80:
        suggestions.insert(0, "Good progress! Add more details to reach excellence")
    else:
        suggestions.insert(0, "Great resume! Consider fine-tuning descriptions")
    
    return ScoreResponse(
        score=total_score,
        breakdown=scores,
        suggestions=suggestions
    )

# PDF Generation
def generate_pdf(resume: Resume) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a365d'),
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2c5282'),
        spaceAfter=6,
        spaceBefore=12,
        borderColor=colors.HexColor('#2c5282'),
        borderWidth=0,
        borderPadding=0,
    )
    
    personal = resume.data.personal_info
    if personal.full_name:
        story.append(Paragraph(personal.full_name, title_style))
        contact_info = []
        if personal.email:
            contact_info.append(personal.email)
        if personal.phone:
            contact_info.append(personal.phone)
        if personal.location:
            contact_info.append(personal.location)
        if contact_info:
            story.append(Paragraph(" | ".join(contact_info), styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
    
    if resume.data.summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
        story.append(Paragraph(resume.data.summary, styles['Normal']))
        story.append(Spacer(1, 0.15*inch))
    
    if resume.data.experiences:
        story.append(Paragraph("EXPERIENCE", heading_style))
        for exp in resume.data.experiences:
            exp_title = f"<b>{exp.title}</b> - {exp.organization}"
            story.append(Paragraph(exp_title, styles['Normal']))
            story.append(Paragraph(f"<i>{exp.start_date} - {exp.end_date}</i>", styles['Normal']))
            if exp.location:
                story.append(Paragraph(f"Location: {exp.location}", styles['Normal']))
            story.append(Paragraph(exp.description, styles['Normal']))
            if exp.skills:
                story.append(Paragraph(f"Skills: {', '.join(exp.skills)}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
    
    if resume.data.internships:
        story.append(Paragraph("INTERNSHIPS", heading_style))
        for intern in resume.data.internships:
            intern_title = f"<b>{intern.title}</b> - {intern.company}"
            story.append(Paragraph(intern_title, styles['Normal']))
            story.append(Paragraph(f"<i>{intern.start_date} - {intern.end_date}</i>", styles['Normal']))
            if intern.location:
                story.append(Paragraph(f"Location: {intern.location}", styles['Normal']))
            story.append(Paragraph(intern.description, styles['Normal']))
            if intern.skills:
                story.append(Paragraph(f"Skills: {', '.join(intern.skills)}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
    
    if resume.data.hackathons:
        story.append(Paragraph("HACKATHONS", heading_style))
        for hack in resume.data.hackathons:
            hack_title = f"<b>{hack.name}</b> - {hack.organizer}"
            story.append(Paragraph(hack_title, styles['Normal']))
            story.append(Paragraph(f"<i>{hack.date}</i>", styles['Normal']))
            story.append(Paragraph(f"Project: {hack.project_title}", styles['Normal']))
            if hack.achievement:
                story.append(Paragraph(f"Achievement: {hack.achievement}", styles['Normal']))
            story.append(Paragraph(hack.description, styles['Normal']))
            if hack.technologies:
                story.append(Paragraph(f"Technologies: {', '.join(hack.technologies)}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
    
    if resume.data.education:
        story.append(Paragraph("EDUCATION", heading_style))
        for edu in resume.data.education:
            edu_title = f"<b>{edu.degree}</b> - {edu.field}"
            story.append(Paragraph(edu_title, styles['Normal']))
            story.append(Paragraph(f"{edu.institution} | {edu.start_date} - {edu.end_date}", styles['Normal']))
            if edu.gpa:
                story.append(Paragraph(f"GPA: {edu.gpa}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
    
    if resume.data.projects:
        story.append(Paragraph("PROJECTS", heading_style))
        for proj in resume.data.projects:
            story.append(Paragraph(f"<b>{proj.title}</b>", styles['Normal']))
            story.append(Paragraph(proj.description, styles['Normal']))
            if proj.technologies:
                story.append(Paragraph(f"Technologies: {', '.join(proj.technologies)}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
    
    if resume.data.events:
        story.append(Paragraph("EVENTS & ACTIVITIES", heading_style))
        for event in resume.data.events:
            event_title = f"<b>{event.title}</b> - {event.organization}"
            story.append(Paragraph(event_title, styles['Normal']))
            story.append(Paragraph(f"<i>{event.date}</i>", styles['Normal']))
            if event.role:
                story.append(Paragraph(f"Role: {event.role}", styles['Normal']))
            story.append(Paragraph(event.description, styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
    
    if resume.data.skills:
        story.append(Paragraph("SKILLS", heading_style))
        skills_text = ", ".join([skill.name for skill in resume.data.skills])
        story.append(Paragraph(skills_text, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

@api_router.get("/resumes/{resume_id}/download")
async def download_resume(resume_id: str, current_user: User = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": current_user.id}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if isinstance(resume.get("created_at"), str):
        resume["created_at"] = datetime.fromisoformat(resume["created_at"])
    if isinstance(resume.get("updated_at"), str):
        resume["updated_at"] = datetime.fromisoformat(resume["updated_at"])
    
    resume_obj = Resume(**resume)
    pdf_bytes = generate_pdf(resume_obj)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={resume_obj.title.replace(' ', '_')}.pdf"}
    )

@api_router.get("/")
async def root():
    return {"message": "Smart Resume Builder API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()