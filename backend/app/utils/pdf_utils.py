import re
from typing import Dict, List

import fitz  # PyMuPDF


class PDFProcessor:
	
	"""
	
	Class to extract text from PDFs and split it into chunks with metadata.
	
	"""
	
	def __init__(self, max_chunk_length: int = 1000):
		
		"""
		
		Initialize the PDFProcessor with a maximum chunk length.
		
		:param max_chunk_length: Maximum length of each text chunk. Default is 1000 characters.
		:type max_chunk_length: int
		
		"""
		
		self.max_chunk_length = max_chunk_length
	
	
	def extract_and_chunk(self, file_stream) -> List[Dict]:
	
		"""
	
		Extracts text from each page of the PDF and splits into chunks with page metadata.
		
		:param file_stream: File-like object representing the PDF.
		:type file_stream: io.BytesIO or similar
		
		:return: List of dicts, each with 'chunk', 'page_number', etc.
		:rtype: List[Dict]
		
		"""
		
		# Initialize an empty list to store the results
		results = []
		
		# Open the PDF file using PyMuPDF
		with fitz.open(stream = file_stream, filetype = "pdf") as doc:
			
			# Iterate through each page in the PDF
			for page_number, page in enumerate(doc, start = 1):
				
				# Extract and normalize text
				text = page.get_text()
				
				text = re.sub(r"\s+", " ", text).strip()
				
				text = re.sub(r"[^\x00-\x7F]+", "", text)
				
				# Chunk the page text
				page_chunks = self.chunk_text(text)
				
				# Iterate through each chunk and append metadata
				for chunk_index, chunk in enumerate(page_chunks):
					
					results.append(
							{
								"chunk": chunk,
								"page_number": page_number,
								"chunk_index": chunk_index
								}
							)
		
		# Return the list of chunks with metadata
		return results
	
	
	def chunk_text(self, text: str) -> List[str]:
		
		"""
		
		Split the text into chunks based on the maximum chunk length.
		
		:param text: Text to be chunked.
		:type text: str
		
		:return: List of text chunks.
		:rtype: List[str]
		"""
		
		# Split the text into sentences using regex
		sentences = re.split(r'(?<=[.!?]) +', text)
		
		# Initialize an empty list to store the chunks and a variable for the current chunk
		chunks, current_chunk = [], ""
		
		# Iterate through each sentence and add it to the current chunk if it fits
		for sentence in sentences:
			
			# Check if adding the sentence exceeds the max chunk length
			if len(current_chunk) + len(sentence) <= self.max_chunk_length:
				
				current_chunk += sentence + " "
			
			else:
			
				chunks.append(current_chunk.strip())
			
				current_chunk = sentence + " "
		
		# Append the last chunk if it exists
		if current_chunk:

			chunks.append(current_chunk.strip())
		
		return chunks
