import hmac
import hashlib
import os
import uuid
from datetime import datetime

import razorpay
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException

from database import orders_db
from schemas import OrderInDB, RazorpayOrderRequest, RazorpayOrderResponse, RazorpayVerifyRequest

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

router = APIRouter(prefix="/api/payments", tags=["payments"])


def get_razorpay_client():
    try:
        if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
            raise HTTPException(status_code=500, detail="Razorpay keys are not configured")
        return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Razorpay client: {str(exc)}")


@router.post("/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(payload: RazorpayOrderRequest):
    try:
        if not payload.items:
            raise HTTPException(status_code=400, detail="Cart cannot be empty")
        if payload.totalAmount <= 0:
            raise HTTPException(status_code=400, detail="Total amount must be greater than zero")

        client = get_razorpay_client()
        short_order_id = f"TB-{str(uuid.uuid4())[:6].upper()}"

        razorpay_order = client.order.create(
            {
                "amount": payload.totalAmount * 100,
                "currency": "INR",
                "receipt": short_order_id,
                "payment_capture": 1,
            }
        )

        order_doc = OrderInDB(
            order_id=short_order_id,
            items=payload.items,
            totalAmount=payload.totalAmount,
            customerEmail=payload.customerEmail,
            razorpay_order_id=razorpay_order["id"],
            status="payment_pending",
        )
        await orders_db.insert_one(order_doc.model_dump())

        return RazorpayOrderResponse(
            order_id=short_order_id,
            razorpay_order_id=razorpay_order["id"],
            razorpay_key_id=RAZORPAY_KEY_ID,
            amount=payload.totalAmount * 100,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(exc)}")


@router.post("/verify")
async def verify_razorpay_payment(payload: RazorpayVerifyRequest):
    try:
        body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode("utf-8")
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode("utf-8"),
            body,
            hashlib.sha256,
        ).hexdigest()

        if generated_signature != payload.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")

        update_result = await orders_db.update_one(
            {"order_id": payload.order_id},
            {
                "$set": {
                    "razorpay_payment_id": payload.razorpay_payment_id,
                    "status": "paid",
                    "updated_at": datetime.utcnow(),
                }
            },
        )
        if update_result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")

        return {"message": "Payment verified successfully", "order_id": payload.order_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(exc)}")
