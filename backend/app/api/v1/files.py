import os
import uuid
import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse

from app.config import settings
from app.core.deps import get_current_active_user
from app.models import User

router = APIRouter()


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename"""
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return ''


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    ext = get_file_extension(filename)
    return ext in settings.ALLOWED_EXTENSIONS


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename using UUID"""
    ext = get_file_extension(original_filename)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}.{ext}" if ext else unique_id


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a file to the server.
    Returns the URL to access the uploaded file.
    """
    # Validate file extension
    if not is_allowed_file(file.filename or ''):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Read file content
    content = await file.read()

    # Validate file size
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Generate unique filename and save
    unique_filename = generate_unique_filename(file.filename or 'file.png')
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Write file
    with open(file_path, 'wb') as f:
        f.write(content)

    # Return the URL to access the file
    file_url = f"{settings.API_V1_STR}/files/{unique_filename}"

    return {
        "filename": unique_filename,
        "url": file_url,
        "size": len(content)
    }


@router.post("/upload-base64")
async def upload_base64(
    data: dict,
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a base64 encoded image to the server.
    Expects: { "base64": "data:image/png;base64,..." or just base64 string, "filename": "optional.png" }
    Returns the URL to access the uploaded file.
    """
    base64_data = data.get("base64", "")
    original_filename = data.get("filename", "image.png")

    if not base64_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No base64 data provided"
        )

    # Handle data URL format
    if base64_data.startswith('data:'):
        # Extract mime type and base64 content
        try:
            header, base64_content = base64_data.split(',', 1)
            # Extract extension from mime type (e.g., data:image/png;base64)
            mime_type = header.split(':')[1].split(';')[0]
            ext = mime_type.split('/')[1]
            if ext == 'jpeg':
                ext = 'jpg'
            original_filename = f"image.{ext}"
        except (IndexError, ValueError):
            base64_content = base64_data
    else:
        base64_content = base64_data

    # Validate extension
    ext = get_file_extension(original_filename)
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Decode base64
    try:
        content = base64.b64decode(base64_content)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid base64 data"
        )

    # Validate file size
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Generate unique filename and save
    unique_filename = generate_unique_filename(original_filename)
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Write file
    with open(file_path, 'wb') as f:
        f.write(content)

    # Return the URL to access the file
    file_url = f"{settings.API_V1_STR}/files/{unique_filename}"

    return {
        "filename": unique_filename,
        "url": file_url,
        "size": len(content)
    }


@router.get("/{filename}")
async def get_file(filename: str):
    """
    Get a file by filename.
    """
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    return FileResponse(file_path)


@router.delete("/{filename}")
async def delete_file(
    filename: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a file by filename.
    """
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    os.remove(file_path)

    return {"message": "File deleted successfully"}
