"""
Payment API — Khalti / eSewa verification endpoints

To activate:
1. pip install httpx (already installed)
2. Set KHALTI_SECRET_KEY in backend/.env
3. Sign up at https://khalti.com/join/merchant/
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["Payments"])

KHALTI_SECRET_KEY = os.getenv("KHALTI_SECRET_KEY", "")
KHALTI_VERIFY_URL = "https://khalti.com/api/v2/payment/verify/"


class PaymentVerifyRequest(BaseModel):
    token: str
    amount: int  # in paisa
    provider: str = "khalti"


class PaymentVerifyResponse(BaseModel):
    success: bool
    subscription_id: str | None = None
    error: str | None = None


@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(req: PaymentVerifyRequest):
    """
    Verify a Khalti payment token and create subscription.

    Flow:
    1. Receive token from frontend (after Khalti widget success)
    2. Verify token with Khalti's server API
    3. Create subscription record in database
    4. Return success
    """

    if not KHALTI_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Payment processing not yet configured. Contact support."
        )

    if req.provider == "khalti":
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    KHALTI_VERIFY_URL,
                    json={"token": req.token, "amount": req.amount},
                    headers={"Authorization": f"Key {KHALTI_SECRET_KEY}"},
                    timeout=15,
                )

            if response.status_code == 200:
                data = response.json()
                logger.info(f"Khalti payment verified: {data}")

                # TODO: Create subscription record in InsForge DB
                # subscription_id = await create_subscription(user_id, tier, amount)

                return PaymentVerifyResponse(
                    success=True,
                    subscription_id=None,  # Replace with real ID
                )
            else:
                logger.error(f"Khalti verification failed: {response.text}")
                return PaymentVerifyResponse(
                    success=False,
                    error="Payment verification failed"
                )

        except httpx.TimeoutException:
            return PaymentVerifyResponse(
                success=False,
                error="Payment gateway timeout"
            )
        except Exception as e:
            logger.error(f"Payment verification error: {e}")
            return PaymentVerifyResponse(
                success=False,
                error="Payment processing error"
            )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {req.provider}")
