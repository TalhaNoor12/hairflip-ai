from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import openai
import base64
import httpx
import json
import time
import asyncio

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Detect whether real Cloudinary credentials are present ────────────
_CLOUDINARY_NAME   = os.getenv("CLOUDINARY_CLOUD_NAME", "")
_CLOUDINARY_KEY    = os.getenv("CLOUDINARY_API_KEY", "")
_CLOUDINARY_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

_CLOUDINARY_READY = all([
    _CLOUDINARY_NAME and _CLOUDINARY_NAME != "your_cloud_name_here",
    _CLOUDINARY_KEY  and _CLOUDINARY_KEY  != "your_api_key_here",
    _CLOUDINARY_SECRET and _CLOUDINARY_SECRET != "your_api_secret_here",
])

if _CLOUDINARY_READY:
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=_CLOUDINARY_NAME,
        api_key=_CLOUDINARY_KEY,
        api_secret=_CLOUDINARY_SECRET,
    )
    print("[HairFlip] Cloudinary is configured — real uploads enabled.")
else:
    print(
        "[HairFlip] WARNING: Cloudinary keys not set. "
        "Running in MOCK mode — /upload will return a placeholder URL."
    )


# ────────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "HairFlip API is running",
        "mode": "real" if _CLOUDINARY_READY else "mock",
    }


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload a photo to Cloudinary.
    When Cloudinary keys are not configured, returns a mock success response
    so the UI flow can be tested end-to-end without crashing.
    """
    # ── MOCK MODE ─────────────────────────────────────────────────────
    if not _CLOUDINARY_READY:
        # Use picsum.photos as a stable placeholder image so the next
        # page has a real image URL to display.
        mock_url = (
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12"
            "?w=600&auto=format"
        )
        return {
            "success": True,
            "imageUrl": mock_url,
            "publicId": "hairflip/mock_upload",
            "mock": True,
        }

    # ── REAL CLOUDINARY UPLOAD ────────────────────────────────────────
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder="hairflip",
            resource_type="image",
        )
        return {
            "success":  True,
            "imageUrl": result["secure_url"],
            "publicId": result["public_id"],
            "mock":     False,
        }
    except Exception as exc:
        return {"success": False, "error": str(exc)}

@app.post("/analyse-face")
async def analyse_face(data: dict):
    image_url = data.get("imageUrl")
    
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    },
                    {
                        "type": "text",
                        "text": """Analyse this face photo carefully.
Identify the face shape from exactly these options only:
OVAL, ROUND, SQUARE, HEART, DIAMOND

Then recommend exactly 4 hairstyle names that suit 
this face shape best from this list:
Buzz Cut, Bob Cut, Curtain Bangs, Taper Fade, 
Box Braids, Pixie Cut, Quiff, Wavy Lob, French Crop, 
Afro, Undercut, Side Part, Shag Cut, Man Bun, 
Pompadour, Cornrows, Textured Crop

Return ONLY this exact JSON and nothing else:
{
  "faceShape": "OVAL",
  "recommendedStyles": ["Style1", "Style2", "Style3", "Style4"],
  "reason": "One short sentence explaining why these suit this face shape"
}"""
                    }
                ]
            }
        ],
        max_tokens=200
    )
    
    result = json.loads(response.choices[0].message.content)
    return result

@app.post("/generate-hairstyle")
async def generate_hairstyle(data: dict):
    image_url = data.get("imageUrl")
    style_prompt = data.get("stylePrompt")
    
    if not image_url or not style_prompt:
        return {"success": False, "error": "Missing imageUrl or stylePrompt"}
    
    lightx_api_key = os.getenv("LIGHTX_API_KEY")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.lightxeditor.com/external/api/v1/hairstyle",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": lightx_api_key
                },
                json={
                    "imageUrl": image_url,
                    "textPrompt": style_prompt
                }
            )
            
            result = response.json()
            print("==== LIGHTX FULL INITIAL RESPONSE ====")
            print(json.dumps(result, indent=2))
            
            if response.status_code == 200:
                output_url = result.get("body", {}).get("imageUrl") or \
                             result.get("imageUrl") or \
                             result.get("output")
                             
                if output_url:
                    return {
                        "success": True,
                        "resultImageUrl": output_url,
                        "stylePrompt": style_prompt
                    }
                    
                # NO URL? Check for orderId/jobId for polling
                order_id = result.get("body", {}).get("orderId") or \
                           result.get("orderId") or \
                           result.get("body", {}).get("jobId") or \
                           result.get("jobId")
                           
                if order_id:
                    print(f"==== LIGHTX POLLING STARTED FOR ORDER: {order_id} ====")
                    for _ in range(15): # Max 30 seconds wait
                        await asyncio.sleep(2)
                        poll_resp = await client.post(
                            "https://api.lightxeditor.com/external/api/v1/order-status",
                            headers={
                                "Content-Type": "application/json",
                                "x-api-key": lightx_api_key
                            },
                            json={"orderId": order_id}
                        )
                        poll_result = poll_resp.json()
                        print("==== LIGHTX POLLING RESPONSE ====")
                        print(json.dumps(poll_result, indent=2))
                        
                        body = poll_result.get("body", {})
                        status = body.get("status") or poll_result.get("status")
                        
                        if status in ["active", "completed", "success"]:
                            out_url = body.get("output") or body.get("imageUrl") or poll_result.get("output") or poll_result.get("imageUrl")
                            if out_url:
                                return {
                                    "success": True,
                                    "resultImageUrl": out_url,
                                    "stylePrompt": style_prompt
                                }
                        elif status in ["failed", "error"]:
                            err_msg = body.get("message") or poll_result.get("message") or "LightX job failed during processing"
                            return {"success": False, "error": f"LightX Error: {err_msg}", "rawResponse": poll_result}
                            
                    return {
                        "success": False,
                        "error": "LightX API timed out after 30 seconds wait. The image may still be processing.",
                        "rawResponse": poll_result
                    }
                else:
                    err_msg = result.get("message") or result.get("body", {}).get("message") or "No output image and no orderId returned."
                    return {
                        "success": False,
                        "error": f"LightX Error: {err_msg}",
                        "rawResponse": result
                    }
            else:
                return {
                    "success": False,
                    "error": f"LightX HTTP {response.status_code}: {result.get('message', 'Unknown Error')}",
                    "rawResponse": result
                }
                
    except httpx.TimeoutException:
        return {"success": False, "error": "Request timed out. Please try again."}
    except Exception as e:
        return {"success": False, "error": str(e)}
