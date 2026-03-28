from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional


class ProductItem(BaseModel):
    name: str
    singlePrice: int
    bouquetPrice: int
    note: Optional[str] = None


class Collection(BaseModel):
    id: str
    title: str
    description: str
    image: str
    items: List[ProductItem]


class CartItem(BaseModel):
    id: str
    name: str
    singlePrice: int
    bouquetPrice: int
    quantity: int
    collectionTitle: str


class OrderCreate(BaseModel):
    items: List[CartItem]
    totalAmount: int
    customerEmail: Optional[str] = None


class OrderInDB(OrderCreate):
    order_id: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str = "created"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    email: str


class RazorpayOrderRequest(BaseModel):
    items: List[CartItem]
    totalAmount: int
    customerEmail: Optional[str] = None


class RazorpayOrderResponse(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_key_id: str
    amount: int
    currency: str = "INR"


class RazorpayVerifyRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
