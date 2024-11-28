import psycopg2
import smtplib
from email.mime.text import MIMEText
from django.conf import settings
from django.db import transaction
from background_task import background

# Define the background task
@background(schedule=60)  # You can set the schedule to your requirement
def send_emails_from_queue():
    try:
        # Database configuration
        db_config = settings.DATABASES['default']
        conn = psycopg2.connect(
            dbname=db_config['NAME'],
            user=db_config['USER'],
            password=db_config['PASSWORD'],
            host=db_config['HOST'],
            port=db_config['PORT']
        )
        cursor = conn.cursor()

        with transaction.atomic():
            cursor.execute("""
                SELECT id, creator_email, receivers_emails, subject, body
                FROM email_queue
                WHERE processed = FALSE
            """)
            emails = cursor.fetchall()

            for email in emails:
                email_id, creator_email, receivers, subject, body = email
                if isinstance(receivers, str):
                    receivers = receivers.strip('[]').replace('"', '').split(',')

                try:
                    # Create email message
                    msg = MIMEText(body)
                    msg['Subject'] = subject
                    msg['From'] = creator_email
                    msg['To'] = ", ".join(receivers)

                    # Sending email
                    with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
                        if settings.EMAIL_USE_TLS:
                            server.starttls()
                        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                        server.sendmail(creator_email, receivers, msg.as_string())

                    # Update email_queue status to processed
                    cursor.execute("""
                        UPDATE email_queue
                        SET processed = TRUE
                        WHERE id = %s
                    """, (email_id,))

                except Exception as email_error:
                    print(f"Failed to send email ID {email_id}: {email_error}")

        conn.commit()

    except Exception as db_error:
        print(f"Database error: {db_error}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
