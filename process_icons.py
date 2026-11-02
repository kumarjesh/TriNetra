import os
from PIL import Image

src_path = r"C:\Users\satis\.gemini\antigravity\brain\3773c05b-fd1b-43ae-8410-2cea15e04f2d\.user_uploaded\media_1793638696163_d9505275.png"
public_dir = r"c:\Users\satis\OneDrive\Desktop\7th Sense\public"

img = Image.open(src_path).convert("RGBA")
print(f"Source image opened: {img.size}")

# Save master logo.png
img.save(os.path.join(public_dir, "logo.png"), "PNG")

# Generate 512x512
img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save(os.path.join(public_dir, "pwa-512x512.png"), "PNG")

# Generate 192x192
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save(os.path.join(public_dir, "pwa-192x192.png"), "PNG")

# Generate apple-touch-icon 180x180
img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
img_180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

# Generate favicon.png 64x64
img_64 = img.resize((64, 64), Image.Resampling.LANCZOS)
img_64.save(os.path.join(public_dir, "favicon.png"), "PNG")

print("All icons successfully generated in public/ directory.")
