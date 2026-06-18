from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="business") # business, startup, investor, admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False)

class BusinessProfile(Base):
    __tablename__ = "business_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String, index=True)
    logo_url = Column(String, nullable=True)
    industry = Column(String, index=True)
    sub_industry = Column(String)
    business_type = Column(String) # Manufacturer, Supplier, etc.
    
    # Location
    country = Column(String)
    state = Column(String)
    city = Column(String)
    areas_served = Column(JSON) # List of areas
    
    # Details
    revenue_band = Column(String)
    team_size = Column(String)
    years_in_business = Column(Integer)
    registration_number = Column(String)
    
    # Intent and Products
    business_intent = Column(JSON) # List of intents: Seeking Distributors, etc.
    products_services = Column(JSON) # List of categories/products
    moq = Column(String, nullable=True)
    export_ready = Column(Boolean, default=False)

    profile_completeness = Column(Integer, default=0) # percentage
    
    
    user = relationship("User", back_populates="business_profile")

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"))
    to_user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # 'LIKE', 'PASS', 'SUPERLIKE'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    match_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    deal_room = relationship("DealRoom", back_populates="match", uselist=False)

class DealRoom(Base):
    __tablename__ = "deal_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    status = Column(String, default="Initial Discussion") # Initial Discussion, Proposal Shared, Negotiation, Closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    match = relationship("Match", back_populates="deal_room")
