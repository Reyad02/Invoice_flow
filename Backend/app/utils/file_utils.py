import os 
import uuid 

ALLOWED_EXTENSIONS = { ".pdf", ".png", ".jpg", ".jpeg" } 
ALLOWED_IMAGE_EXTENSIONS = { ".png", ".jpg", ".jpeg" } 

def get_file_extension( filename: str ) -> str: 
    return os.path.splitext( filename )[1].lower() 

def is_allowed_file( filename: str ) -> bool: 
    extension = get_file_extension( filename ) 
    return extension in ALLOWED_EXTENSIONS 

def is_pdf( filename: str ) -> bool: 
    return get_file_extension( filename ) == ".pdf" 

def is_image( filename: str ) -> bool: 
    return get_file_extension( filename ) in ALLOWED_IMAGE_EXTENSIONS 

def generate_filename( original_filename: str ) -> str: 
    extension = get_file_extension( original_filename ) 
    return f"{uuid.uuid4()}{extension}"