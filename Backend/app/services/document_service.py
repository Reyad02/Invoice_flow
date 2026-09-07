import base64 
from dataclasses import dataclass 
from typing import Literal 
import fitz 
from app.core.config import settings 

@dataclass 
class ProcessedDocument: 
    document_type: Literal[ "text", "images" ] 
    text: str | None = None 
    images: list[str] | None = None 
    
def extract_text_from_pdf( file_path: str ) -> str: 
    document = fitz.open( file_path ) 
    pages_text = [] 
    
    try: 
        for page in document: 
            page_text = page.get_text( "text" ) 
            if page_text: 
                pages_text.append( page_text ) 
    
    finally: 
        document.close() 
    
    return "\n\n".join( pages_text ).strip() 

def has_useful_text( text: str ) -> bool: 
    cleaned_text = " ".join( text.split() ) 
    return ( len(cleaned_text) >= settings.MIN_EXTRACTED_TEXT_CHARS ) 

def pdf_to_base64_images( file_path: str ) -> list[str]: 
    document = fitz.open( file_path ) 
    images = [] 
    
    try: 
        for page in document: 
            matrix = fitz.Matrix( 2, 2 ) 
            pixmap = page.get_pixmap( matrix=matrix, alpha=False ) 
            image_bytes = pixmap.tobytes( "png" ) 
            encoded_image = ( base64.b64encode( image_bytes ) .decode("utf-8") ) 
            images.append( encoded_image ) 
            
    finally: 
        document.close() 
        
    return images 
    
def image_file_to_base64( file_path: str ) -> str: 
    with open( file_path, "rb" ) as file: 
        encoded_image = base64.b64encode(file.read()).decode("utf-8")
        return encoded_image 
    
def process_pdf( file_path: str ) -> ProcessedDocument: 
    
    # Extracting text 
    extracted_text = extract_text_from_pdf(file_path)
    
    # If useful text exists 
    if has_useful_text( extracted_text ): 
        return ProcessedDocument( document_type="text", text=extracted_text, images=None ) 
 
    # Convert all pages to images 
    page_images = pdf_to_base64_images(file_path) 
    return ProcessedDocument( document_type="images", text=None, images=page_images )

def get_image_mime_type( filename: str ) -> str: 
    filename = filename.lower() 
    if filename.endswith(".png"): 
        return "image/png" 
    
    if ( filename.endswith(".jpg") or filename.endswith(".jpeg") ): 
        return "image/jpeg" 
    
    raise ValueError( "Unsupported image format" )