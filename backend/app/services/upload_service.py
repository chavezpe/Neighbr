import os
import boto3
from fastapi import UploadFile
from botocore.exceptions import NoCredentialsError, ClientError
from dotenv import load_dotenv


load_dotenv()


class UploadService:
    
    """
    
    Service for handling file uploads. (S3 or local)
    
    """
    
    def __init__(self, use_s3: bool = False):
        
        """
        
        Initialize the UploadService.

        :param use_s3: Boolean flag to indicate if S3 should be used for file uploads.
        :type use_s3: bool
        
        """
        
        self.use_s3 = use_s3
        
        self.upload_dir = os.getenv("S3_BUCKET_NAME")
        
        # Create the upload directory if it doesn't exist
        os.makedirs(self.upload_dir, exist_ok = True)
        
        # Check if S3 is enabled
        if self.use_s3:
            
            self.bucket_name = os.getenv("S3_BUCKET_NAME")
            
            self.s3_client = boto3.client("s3")
    
    
    async def save_file(self, file: UploadFile, hoa_code: str, document_type: str) -> str:
        """
        Save the uploaded file to the specified location (local or S3), namespaced by HOA code.

        :param file: The file to be uploaded.
        :type file: UploadFile
        :param hoa_code: The 9-digit alphanumeric HOA code to organize files by community.
        :type hoa_code: str
        :param document_type: A descriptive name for the type of document being uploaded
        (e.g., 'Bylaws', 'Meeting Minutes').
        :type document_type: str

        :return: The path or URL where the file is saved.
        :rtype: str
        """
        
        # Sanitize and format the document_type to be file-safe
        safe_name = document_type.strip().replace(" ", "_").lower() + ".pdf"
        
        folder_path = f"{hoa_code}/docs/"
        
        file_path = folder_path + safe_name
        
        if self.use_s3:
            
            return await self._upload_to_s3(file, file_path)
        
        else:
            
            return await self._save_to_local(file, file_path)
    
    
    async def _save_to_local(self, file: UploadFile, file_path: str) -> str:
        
        """
        
        Save file locally with HOA-specific folder structure.

        :param file: The file to be saved.
        :type file: UploadFile
        :param file_path: The local path including folder and filename.
        :type file_path: str

        :return: Path to the saved local file.
        :rtype: str
        
        """
        
        full_path = os.path.join(self.upload_dir, file_path)
        
        os.makedirs(os.path.dirname(full_path), exist_ok = True)
        
        with open(full_path, "wb") as f:
        
            content = await file.read()
        
            f.write(content)
        
        return full_path
    
    async def _upload_to_s3(self, file: UploadFile, file_path: str) -> str:
        
        """
        
        Upload the file to an S3 bucket under the HOA-specific folder.

        :param file: The file to upload.
        :type file: UploadFile
        :param file_path: The S3 key (path) for the file.
        :type file_path: str

        :return: Public URL to access the uploaded file.
        :rtype: str
        """
        
        try:
        
            file_content = await file.read()
        
            self.s3_client.put_object(
                    Bucket = self.bucket_name,
                    Key = file_path,
                    Body = file_content,
                    ContentType = file.content_type,
                    )
        
            return f"https://{self.bucket_name}.s3.amazonaws.com/{file_path}"
        
        except (NoCredentialsError, ClientError) as e:
        
            raise RuntimeError(f"S3 upload failed: {e}")
