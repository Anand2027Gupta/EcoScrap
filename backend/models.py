from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class LotCreate(BaseModel):
    material_category: str = Field(..., min_length=1)
    material_subcategory: Optional[str] = None
    weight_kg: float = Field(..., gt=0)
    location: str = Field(..., min_length=1)
    image_id: Optional[str] = None
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = Field(default=None, ge=0, le=100)


class RecyclerMatchRequest(BaseModel):
    material_category: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    weight_kg: float = Field(..., gt=0)


class HandoverCreate(BaseModel):
    lot_id: str = Field(..., min_length=1)
    recycler_id: str = Field(..., min_length=1)
    recycler_name: Optional[str] = None
    material_category: Optional[str] = None
    weight_kg: Optional[float] = Field(default=None, gt=0)
    location: Optional[str] = None
    estimated_value: Optional[float] = Field(default=None, ge=0)


class HandoverStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)
    payment_status: Optional[str] = None


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Literal["collector", "recycler"]
    recycler_id: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class PriceEstimateRequest(BaseModel):
    material_category: str = Field(..., min_length=1)
    subcategory: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    weight: float = Field(..., gt=0)