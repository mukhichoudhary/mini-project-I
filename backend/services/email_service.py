"""
SMTP Email Delivery Service for Bhasa_AI
Handles genuine Gmail SMTP delivery with STARTTLS and strict, honest error handling.
Never reports success if mail delivery fails.
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

class EmailService:
    @staticmethod
    def is_configured() -> bool:
        """Check if genuine Gmail SMTP credentials are configured in the environment."""
        user = (os.getenv("SMTP_USERNAME") or "").strip()
        password = (os.getenv("SMTP_PASSWORD") or "").strip()
        dummy_markers = ["your-gmail@gmail.com", "your-app-password", "example.com", ""]
        return bool(user and password and user not in dummy_markers and password not in dummy_markers)

    @classmethod
    def send_smtp_message(cls, to_email: str, subject: str, plain_body: str, html_body: str) -> dict:
        """
        Dispatches a multipart MIME email through Gmail SMTP with STARTTLS.
        Strictly reports success or failure without concealing errors.
        """
        if not cls.is_configured():
            return {
                "success": False,
                "error": "SMTP credentials are not configured on this server.",
                "code": "smtp_unconfigured"
            }

        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USERNAME", "").strip()
        smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
        from_name = os.getenv("SMTP_FROM_NAME", "Bhasa_AI").strip()
        from_email = os.getenv("SMTP_FROM_EMAIL", "").strip() or smtp_user

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email

        msg.attach(MIMEText(plain_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())

            return {
                "success": True,
                "email": to_email,
                "mode": "smtp"
            }
        except smtplib.SMTPAuthenticationError as e:
            return {
                "success": False,
                "error": f"SMTP Authentication failed. Verify Gmail App Password and username: {e}",
                "code": "smtp_auth_error"
            }
        except smtplib.SMTPException as e:
            return {
                "success": False,
                "error": f"SMTP transport error: {type(e).__name__}: {e}",
                "code": "smtp_transport_error"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Mail dispatch connection error: {type(e).__name__}: {e}",
                "code": "smtp_connection_error"
            }

    @classmethod
    def send_password_reset_email(
        cls,
        to_email: str,
        reset_url: str,
        recipient_name: str = "Scholar",
        expires_minutes: int = 15
    ) -> dict:
        """
        Dispatches a secure, single-use, time-limited password recovery email.
        """
        from_name = os.getenv("SMTP_FROM_NAME", "Bhasa_AI").strip()
        subject = f"Reset Your {from_name} Password"

        plain_body = f"""
{from_name} - Password Reset Request
---------------------------------------
Hello {recipient_name},

We received a request to reset the password for your {from_name} account ({to_email}).

To choose a new password, open the following secure link in your browser:
{reset_url}

Security Notice:
- This link is single-use and will expire in {expires_minutes} minutes.
- If you did not request a password reset, you can safely ignore this email; your account remains secure and your password has not been changed.
- Never forward or share this link with anyone.

Best regards,
{from_name} Academic Team
"""

        html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b0f19;
            color: #e2e8f0;
            margin: 0;
            padding: 30px 15px;
        }}
        .card {{
            max-width: 520px;
            margin: 0 auto;
            background: linear-gradient(145deg, #131b2e 0%, #0d1322 100%);
            border: 1px solid rgba(16, 185, 129, 0.25);
            border-radius: 16px;
            padding: 36px 30px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
        }}
        .logo-header {{
            text-align: center;
            margin-bottom: 24px;
        }}
        .logo-text {{
            font-size: 26px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
        }}
        .logo-text span {{
            color: #10b981;
        }}
        .badge {{
            display: inline-block;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-top: 8px;
        }}
        h1 {{
            font-size: 20px;
            font-weight: 700;
            color: #f8fafc;
            margin: 20px 0 10px 0;
            text-align: center;
        }}
        p {{
            font-size: 14px;
            line-height: 1.6;
            color: #94a3b8;
            margin: 12px 0;
        }}
        .cta-wrap {{
            text-align: center;
            margin: 30px 0;
        }}
        .cta-btn {{
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            padding: 14px 32px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }}
        .fallback-box {{
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            word-break: break-all;
            font-size: 12px;
            color: #64748b;
        }}
        .fallback-box a {{
            color: #34d399;
            text-decoration: underline;
        }}
        .security-footer {{
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="logo-header">
            <div class="logo-text">Bhasa_<span>AI</span></div>
            <div class="badge">Password Recovery</div>
        </div>
        
        <h1>Reset Your Password</h1>
        <p>Hello <strong>{recipient_name}</strong>,</p>
        <p>We received a request to reset your password for your <strong>{from_name}</strong> account. Click the secure button below to choose a new password:</p>
        
        <div class="cta-wrap">
            <a href="{reset_url}" target="_blank" class="cta-btn">Reset My Password &rarr;</a>
        </div>
        
        <p style="font-size: 13px; color: #cbd5e1;"><strong>Security Notice:</strong></p>
        <ul style="font-size: 13px; color: #94a3b8; padding-left: 20px; margin: 0 0 16px 0;">
            <li>This link is <strong>single-use</strong> and expires in <strong>{expires_minutes} minutes</strong>.</li>
            <li>If you did not request a password reset, you can safely ignore this email; your account remains secure and your password is unchanged.</li>
            <li>Never share this link with anyone.</li>
        </ul>
        
        <div class="fallback-box">
            If the button above does not work, copy and paste this URL into your browser:<br>
            <a href="{reset_url}">{reset_url}</a>
        </div>
        
        <div class="security-footer">
            Sent securely by {from_name} Security System &bull; {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}<br>
            &copy; 2026 Bhasa_AI • Natural & Programming Language Proficiency System
        </div>
    </div>
</body>
</html>"""

        return cls.send_smtp_message(
            to_email=to_email,
            subject=subject,
            plain_body=plain_body,
            html_body=html_body
        )

    @classmethod
    def send_otp_email(cls, to_email: str, otp_code: str, recipient_name: str = "Scholar") -> dict:
        """
        Send a secure, branded 6-digit OTP email to the user's Gmail address.
        """
        from_name = os.getenv("SMTP_FROM_NAME", "Bhasa_AI").strip()
        subject = f"{otp_code} is your {from_name} verification code"

        plain_body = f"""
{from_name} Verification Code
---------------------------------
Hello {recipient_name},

Your 6-digit verification code is: {otp_code}

This code expires in 5 minutes.
If you did not request this code, please ignore this email.
"""

        html_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b0f19;
            color: #e2e8f0;
            margin: 0;
            padding: 30px 15px;
        }}
        .card {{
            max-width: 520px;
            margin: 0 auto;
            background: linear-gradient(145deg, #131b2e 0%, #0d1322 100%);
            border: 1px solid rgba(16, 185, 129, 0.25);
            border-radius: 16px;
            padding: 36px 30px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
        }}
        .logo-header {{ text-align: center; margin-bottom: 24px; }}
        .logo-text {{ font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }}
        .logo-text span {{ color: #10b981; }}
        .otp-box {{
            background: rgba(15, 23, 42, 0.8);
            border: 2px dashed #10b981;
            border-radius: 12px;
            padding: 22px;
            text-align: center;
            margin: 26px 0;
        }}
        .otp-code {{
            font-family: 'JetBrains Mono', Courier, monospace;
            font-size: 38px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #34d399;
        }}
    </style>
</head>
<body>
    <div class="card">
        <div class="logo-header">
            <div class="logo-text">Bhasa_<span>AI</span></div>
        </div>
        <p>Hello <strong>{recipient_name}</strong>,</p>
        <p>Enter the following verification code to proceed:</p>
        <div class="otp-box">
            <div class="otp-code">{otp_code}</div>
            <div style="font-size: 12px; color: #f59e0b; margin-top: 8px;">Valid for 5 minutes</div>
        </div>
    </div>
</body>
</html>"""

        res = cls.send_smtp_message(
            to_email=to_email,
            subject=subject,
            plain_body=plain_body,
            html_body=html_body
        )
        if not cls.is_configured():
            res["dev_otp_preview"] = otp_code
        return res
