import logging
import requests
from config.settings import settings

logger = logging.getLogger("notifications")

class NotificationManager:
    """Manages outgoing alerts to Telegram and Discord."""
    
    def __init__(self):
        self.telegram_token = settings.telegram_bot_token
        self.telegram_chat_id = settings.telegram_chat_id
        self.discord_url = settings.discord_webhook_url

    def send_telegram_message(self, text: str):
        """Sends a message via Telegram Bot API."""
        if not self.telegram_token or not self.telegram_chat_id:
            return

        url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
        payload = {
            "chat_id": self.telegram_chat_id,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            logger.info("Telegram message sent successfully")
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")

    def send_discord_alert(self, text: str):
        """Sends an alert via Discord Webhook."""
        if not self.discord_url:
            return

        payload = {"content": text}
        
        try:
            response = requests.post(self.discord_url, json=payload)
            response.raise_for_status()
            logger.info("Discord alert sent successfully")
        except Exception as e:
            logger.error(f"Failed to send Discord alert: {e}")

    def broadcast_signal(self, signal_data: dict):
        """Broadcasts a trading signal to all enabled channels."""
        symbol = signal_data.get('symbol')
        sig_type = signal_data.get('signal_type')
        confidence = signal_data.get('confidence')
        price = signal_data.get('price')
        condition = signal_data.get('condition')

        # ScanTrade formatting
        emoji = "🚀" if sig_type == "BULLISH" else "🔻"
        message = (
            f"**SCANTRADE SIGNAL** {emoji}\n\n"
            f"**{symbol}** • {sig_type}\n"
            f"Price: ${price:,.2f}\n"
            f"Confidence: {confidence}%\n"
            f"Setup: {condition}\n\n"
            f"_ScanTrade Scanner_"
        )
        
        # Simple text for Discord
        discord_text = message.replace("*", "**") 

        self.send_telegram_message(message)
        self.send_discord_alert(discord_text)

# Global instance
notifier = NotificationManager()
