import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def send_otp_email(to_email: str, otp: str) -> None:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM", smtp_user or "no-reply@civicbenefit.ai")

    # For local/demo development, printing the OTP is useful if SMTP isn't configured.
    if not smtp_user or not smtp_password:
        print(f"\n[CivicBenefit AI DEMO OTP] {to_email} -> {otp}\n")
        return

    msg = EmailMessage()
    msg["Subject"] = "Your CivicBenefit AI verification code"
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(
        f"Your CivicBenefit AI verification code is {otp}.\n\n"
        "This code expires in 5 minutes. If you did not request it, you can ignore this email."
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
