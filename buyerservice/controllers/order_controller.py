import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException

from database import orders_db
from schemas import OrderCreate, OrderInDB

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("")
async def create_order(order: OrderCreate):
    try:
        if not order.items:
            raise HTTPException(status_code=400, detail="Cart cannot be empty")

        short_order_id = f"TB-{str(uuid.uuid4())[:6].upper()}"
        order_doc = OrderInDB(
            **order.model_dump(),
            order_id=short_order_id,
            status="created",
            updated_at=datetime.utcnow(),
        )
        await orders_db.insert_one(order_doc.model_dump())
        return {"message": "Order saved successfully", "order_id": short_order_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(exc)}")
