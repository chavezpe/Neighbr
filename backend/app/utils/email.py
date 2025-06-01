import os
from typing import Optional
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> None:
    """
    Send an email using SMTP.
    """
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = os.getenv("SMTP_FROM_EMAIL")
    msg['To'] = to_email

    # Add plain text version
    if text_content:
        msg.attach(MIMEText(text_content, 'plain'))

    # Add HTML version
    msg.attach(MIMEText(html_content, 'html'))

    # Send email
    await aiosmtplib.send(
        msg,
        hostname=os.getenv("SMTP_HOST"),
        port=int(os.getenv("SMTP_PORT", "587")),
        username=os.getenv("SMTP_USERNAME"),
        password=os.getenv("SMTP_PASSWORD"),
        use_tls=True
    )


async def send_reset_password_email(email: str, token: str) -> None:
    """
    Send password reset email.
    """
    reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password?token={token}"
    
    html_content = f"""
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <p><a href="{reset_url}">Reset Password</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't request this, please ignore this email.</p>
    """
    
    text_content = f"""
    Reset Your Password
    
    Click the link below to reset your password:
    {reset_url}
    
    This link will expire in 24 hours.
    
    If you didn't request this, please ignore this email.
    """
    
    await send_email(
        to_email=email,
        subject="Reset Your Password",
        html_content=html_content,
        text_content=text_content
    )