from fastapi import APIRouter, HTTPException

from database import collections_db
from schemas import Collection

router = APIRouter(tags=["catalog"])


@router.get("/api/collections", response_model=list[Collection])
async def get_collections():
    try:
        result = []
        cursor = collections_db.find({}, {"_id": 0})
        async for document in cursor:
            result.append(Collection(**document))
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch collections: {str(exc)}")
