import fitz  # PyMuPDF
import re
from typing import List


class PDFProcessor:
    
    """
    
    Class to handle PDF text extraction and chunking.
    
    """
    
    def __init__(self, max_chunk_length: int = 1000):
        """
        PDFProcessor to handle text extraction and chunking from PDF files.

        :param max_chunk_length: Maximum length of each text chunk.
        :type max_chunk_length: int
        
        """
        
        self.max_chunk_length = max_chunk_length

    
    @staticmethod
    def extract_text(file_stream) -> str:
        
        """
        
        Extract and normalize text from a PDF file stream.
        
        :param file_stream: File stream of the PDF document.
        :type file_stream: file-like object
        
        :return: Cleaned and unified text from the PDF.
        :rtype: str
        
        """
        
        text = ""
        
        # Open the PDF file using PyMuPDF
        with fitz.open(stream=file_stream, filetype="pdf") as doc:
            
            # Iterate through each page in the PDF
            for page in doc:
                
                # Extract text from the page
                page_text = page.get_text()
                
                # Normalize text: remove extra spaces, newlines, and tabs
                page_text = re.sub(r"\s+", " ", page_text)
                
                # Remove blank lines
                text += page_text.strip() + " "

        # Remove non-ASCII characters
        text = re.sub(r"[^\x00-\x7F]+", "", text)
        
        return text.strip()


    def chunk_text(self, text: str) -> List[str]:
        
        """
        
        Split text into chunks of approximately max_chunk_length, preferably on sentence boundaries.

        :param text: The unified text to be chunked.
        :type text: str
        
        :return: List of text chunks.
        :rtype: List[str]
        """
        
        # Split text into sentences using regex
        sentences = re.split(r'(?<=[.!?]) +', text)
        
        # Initialize a list to hold chunks
        chunks = []
        
        # Initialize current chunk
        current_chunk = ""
        
        # Iterate through sentences and build chunks
        for sentence in sentences:
            
            # Add sentence to the current chunk if it fits
            if len(current_chunk) + len(sentence) <= self.max_chunk_length:
                
                current_chunk += sentence + " "
            
            # If adding the sentence exceeds the max length, save the current chunk and start a new one
            else:
                
                chunks.append(current_chunk.strip())
                
                current_chunk = sentence + " "
        
        # Add any remaining text as the last chunk
        if current_chunk:
            
            chunks.append(current_chunk.strip())
        
        # Return the list of chunks
        return chunks
