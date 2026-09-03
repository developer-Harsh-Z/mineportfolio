import os
import google.generativeai as genai

api_key = "AIzaSyD-6rMVexRpbEuOwJE9_Lw52MR30_987uM"
if not api_key:
    raise ValueError("Set GEMINI_API_KEY in your environment")

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Reply with exactly: API_OK")
    print("CALL_STATUS: SUCCESS")
    print("MODEL_TEXT:", response.text)
except Exception as e:
    print("CALL_STATUS: FAILED")
    print("ERROR:", type(e).__name__, str(e))

# import os
# import google.generativeai as genai
# from datetime import datetime

# api_key = "AIzaSyD-6rMVexRpbEuOwJE9_Lw52MR30_987uM"
# if not api_key:
#     raise ValueError("Set VITE_GEMINI_API_KEY in your environment")

# genai.configure(api_key=api_key)

# # List of available models to check
# models_to_check = [
#     "gemini-2.0-flash",
#     "gemini-2.0-flash-lite",
#     "gemini-1.5-flash",
#     "gemini-1.5-pro",
#     "gemini-pro",
# ]

# print("=" * 80)
# print("GEMINI API QUOTA CHECK")
# print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
# print("=" * 80)
# print()

# # Try to get model information
# try:
#     print("Available Models and their Information:")
#     print("-" * 80)
    
#     for model_name in models_to_check:
#         try:
#             # Try to get model info
#             model = genai.GenerativeModel(model_name)
#             print(f"✓ Model: {model_name}")
#             print(f"  Status: Available")
            
#         except Exception as e:
#             error_msg = str(e)
            
#             if "429" in error_msg or "quota" in error_msg.lower():
#                 print(f"✗ Model: {model_name}")
#                 print(f"  Status: QUOTA EXCEEDED")
#                 if "Please retry in" in error_msg:
#                     retry_time = error_msg.split("Please retry in")[1].split("s")[0].strip()
#                     print(f"  Retry After: {retry_time} seconds")
                    
#             elif "404" in error_msg or "not found" in error_msg.lower():
#                 print(f"? Model: {model_name}")
#                 print(f"  Status: Not Found / Not Available")
                
#             else:
#                 print(f"⚠ Model: {model_name}")
#                 print(f"  Error: {error_msg[:100]}")
        
#         print()

# except Exception as e:
#     print(f"ERROR: Failed to retrieve model information")
#     print(f"Details: {str(e)}")

# print("=" * 80)
# print("\nNOTE: The free tier has very limited quotas:")
# print("  - Requests: ~100 per day")
# print("  - Input tokens: Limited")
# print("  - Output tokens: Limited")
# print("\nFor more usage, upgrade to a paid plan:")
# print("  → https://ai.google.dev/pricing")
# print("=" * 80)