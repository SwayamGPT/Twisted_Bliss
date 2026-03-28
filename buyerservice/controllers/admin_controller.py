import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from auth_utils import get_current_admin
from database import collections_db, orders_db
from schemas import Collection, OrderCreate, OrderInDB

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/collections", response_model=list[Collection])
async def admin_list_collections(_: dict = Depends(get_current_admin)):
    try:
        result = []
        cursor = collections_db.find({}, {"_id": 0})
        async for document in cursor:
            result.append(Collection(**document))
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load collections: {str(exc)}")


@router.post("/collections", response_model=Collection)
async def admin_create_collection(payload: Collection, _: dict = Depends(get_current_admin)):
    try:
        existing = await collections_db.find_one({"id": payload.id})
        if existing:
            raise HTTPException(status_code=409, detail="Collection id already exists")
        await collections_db.insert_one(payload.model_dump())
        return payload
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {str(exc)}")


@router.put("/collections/{collection_id}", response_model=Collection)
async def admin_update_collection(collection_id: str, payload: Collection, _: dict = Depends(get_current_admin)):
    try:
        if collection_id != payload.id:
            raise HTTPException(status_code=400, detail="Collection id mismatch")
        update_result = await collections_db.update_one(
            {"id": collection_id},
            {"$set": payload.model_dump()},
        )
        if update_result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Collection not found")
        return payload
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update collection: {str(exc)}")


@router.delete("/collections/{collection_id}")
async def admin_delete_collection(collection_id: str, _: dict = Depends(get_current_admin)):
    try:
        delete_result = await collections_db.delete_one({"id": collection_id})
        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Collection not found")
        return {"message": "Collection deleted successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete collection: {str(exc)}")


@router.post("/orders")
async def admin_create_order(payload: OrderCreate, _: dict = Depends(get_current_admin)):
    try:
        if not payload.items:
            raise HTTPException(status_code=400, detail="Order items cannot be empty")
        if payload.totalAmount <= 0:
            raise HTTPException(status_code=400, detail="Total amount must be greater than zero")

        short_order_id = f"TB-{str(uuid.uuid4())[:6].upper()}"
        order_doc = OrderInDB(
            **payload.model_dump(),
            order_id=short_order_id,
            status="admin_created",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        await orders_db.insert_one(order_doc.model_dump())
        return {"message": "Order created successfully", "order_id": short_order_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(exc)}")
