import requests, base64, logging
from datetime import datetime
from django.conf import settings

logger = logging.getLogger('apps.payments')


def get_mpesa_token():
    url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials' if settings.MPESA_ENVIRONMENT == 'sandbox' else 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    r = requests.get(url, auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET), timeout=30)
    r.raise_for_status()
    return r.json().get('access_token')


def normalize_phone(phone):
    p = str(phone).strip().replace(' ', '').replace('-', '').lstrip('+')
    if p.startswith('0') and len(p) == 10:
        p = '254' + p[1:]
    elif p.startswith('7') and len(p) == 9:
        p = '254' + p
    return p


def initiate_stk_push(phone: str, amount: float, reference: str, description: str):
    url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest' if settings.MPESA_ENVIRONMENT == 'sandbox' else 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    token = get_mpesa_token()
    ts = datetime.now().strftime('%Y%m%d%H%M%S')
    pwd = base64.b64encode(f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{ts}".encode()).decode()
    phone = normalize_phone(phone)
    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE, 'Password': pwd, 'Timestamp': ts,
        'TransactionType': 'CustomerPayBillOnline', 'Amount': int(amount),
        'PartyA': phone, 'PartyB': settings.MPESA_SHORTCODE, 'PhoneNumber': phone,
        'CallBackURL': settings.MPESA_CALLBACK_URL,
        'AccountReference': reference[:12], 'TransactionDesc': description[:13],
    }
    r = requests.post(url, json=payload, headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}, timeout=30)
    r.raise_for_status()
    logger.info(f'STK Push for {reference}: {r.json()}')
    return r.json()
