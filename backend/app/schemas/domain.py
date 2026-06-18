from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

# ─────────────────────────────────────────────
# Token Schemas
# ─────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# ─────────────────────────────────────────────
# User Schemas
# ─────────────────────────────────────────────
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "business"

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    is_verified: bool

    model_config = {"from_attributes": True}

# ─────────────────────────────────────────────
# Business Profile Schemas
# ─────────────────────────────────────────────
class BusinessProfileCreate(BaseModel):
    company_name: str
    industry: str
    sub_industry: Optional[str] = None
    business_type: str = "Manufacturer"
    country: str
    state: str = ""
    city: str = ""
    areas_served: List[str] = []
    revenue_band: str = ""
    team_size: str = ""
    years_in_business: int = 0
    registration_number: Optional[str] = None
    business_intent: List[str] = []
    products_services: List[str] = []
    moq: Optional[str] = None
    export_ready: bool = False

class BusinessProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    business_type: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    areas_served: Optional[List[str]] = None
    revenue_band: Optional[str] = None
    team_size: Optional[str] = None
    years_in_business: Optional[int] = None
    registration_number: Optional[str] = None
    business_intent: Optional[List[str]] = None
    products_services: Optional[List[str]] = None
    moq: Optional[str] = None
    export_ready: Optional[bool] = None

class BusinessProfileOut(BaseModel):
    id: int
    user_id: int
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    business_type: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    areas_served: Optional[List[Any]] = []
    revenue_band: Optional[str] = None
    team_size: Optional[str] = None
    years_in_business: Optional[int] = None
    registration_number: Optional[str] = None
    business_intent: Optional[List[Any]] = []
    products_services: Optional[List[Any]] = []
    moq: Optional[str] = None
    export_ready: bool = False
    profile_completeness: int = 0

    model_config = {"from_attributes": True}

# ─────────────────────────────────────────────
# Interaction Schemas
# ─────────────────────────────────────────────
class InteractionCreate(BaseModel):
    target_user_id: int
    action: str  # LIKE | PASS | SUPERLIKE

class InteractionOut(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    action: str
    matched: bool = False
    match_id: Optional[int] = None

    model_config = {"from_attributes": True}

# ─────────────────────────────────────────────
# Match Schemas
# ─────────────────────────────────────────────
class MatchPartnerOut(BaseModel):
    user_id: int
    company_name: Optional[str] = None
    industry: Optional[str] = None
    business_type: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    revenue_band: Optional[str] = None
    profile_completeness: int = 0
    logo_url: Optional[str] = None

    model_config = {"from_attributes": True}

class MatchOut(BaseModel):
    id: int
    match_score: Optional[float] = None
    created_at: Optional[Any] = None
    partner_profile: Optional[MatchPartnerOut] = None
    deal_room_id: Optional[int] = None

    model_config = {"from_attributes": True}

# ─────────────────────────────────────────────
# Recommendation Schemas
# ─────────────────────────────────────────────
class RecommendationItem(BaseModel):
    profile: BusinessProfileOut
    match_score: float
    match_reasons: List[str]
