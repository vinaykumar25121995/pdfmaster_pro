import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_logo_image(size=512):
    # Create RGBA image
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Deep Red Brushed / Radial Background Squircle
    radius = int(size * 0.20)
    margin = int(size * 0.02)
    x0, y0 = margin, margin
    x1, y1 = size - margin, size - margin

    # Draw radial gradient background inside rounded rectangle
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    bg_draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=(160, 10, 30, 255))
    
    # Subtle inner glow / gradient highlight
    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(highlight)
    h_draw.ellipse([size*0.1, size*0.05, size*0.9, size*0.75], fill=(220, 35, 55, 90))
    bg = Image.alpha_composite(bg, highlight)
    img = Image.alpha_composite(img, bg)
    draw = ImageDraw.Draw(img)

    # 2. 3D Metallic Silver Swooping Acrobat Ribbon Loop Emblem
    # Centered in top 55% of icon
    w = size
    lw = max(3, int(w * 0.055))
    
    # Draw dark drop shadow for ribbon
    shadow_offset = max(2, int(size * 0.008))
    s_color = (40, 0, 10, 160)
    
    # Shadow paths
    draw.arc([w*0.42+shadow_offset, w*0.10+shadow_offset, w*0.56+shadow_offset, w*0.38+shadow_offset], 180, 360, fill=s_color, width=lw)
    draw.line([w*0.42+shadow_offset, w*0.22+shadow_offset, w*0.34+shadow_offset, w*0.50+shadow_offset], fill=s_color, width=lw)
    draw.line([w*0.56+shadow_offset, w*0.22+shadow_offset, w*0.64+shadow_offset, w*0.42+shadow_offset], fill=s_color, width=lw)
    draw.line([w*0.34+shadow_offset, w*0.50+shadow_offset, w*0.22+shadow_offset, w*0.60+shadow_offset], fill=s_color, width=lw)
    draw.arc([w*0.18+shadow_offset, w*0.48+shadow_offset, w*0.32+shadow_offset, w*0.64+shadow_offset], 45, 240, fill=s_color, width=lw)
    draw.line([w*0.26+shadow_offset, w*0.56+shadow_offset, w*0.78+shadow_offset, w*0.45+shadow_offset], fill=s_color, width=lw)
    draw.arc([w*0.68+shadow_offset, w*0.38+shadow_offset, w*0.84+shadow_offset, w*0.54+shadow_offset], 270, 140, fill=s_color, width=int(lw*0.75))

    # Silver metallic paths (white/silver gradient effect using bright stroke)
    silver_color = (240, 243, 246, 255)
    draw.arc([w*0.42, w*0.10, w*0.56, w*0.38], 180, 360, fill=silver_color, width=lw)
    draw.line([w*0.42, w*0.22, w*0.34, w*0.50], fill=silver_color, width=lw)
    draw.line([w*0.56, w*0.22, w*0.64, w*0.42], fill=silver_color, width=lw)
    draw.line([w*0.34, w*0.50, w*0.22, w*0.60], fill=silver_color, width=lw)
    draw.arc([w*0.18, w*0.48, w*0.32, w*0.64], 45, 240, fill=silver_color, width=lw)
    draw.line([w*0.26, w*0.56, w*0.78, w*0.45], fill=silver_color, width=lw)
    draw.arc([w*0.68, w*0.38, w*0.84, w*0.54], 270, 140, fill=silver_color, width=int(lw*0.75))

    # 3. "I [Ruby Heart] PDFMaster" text area below icon
    # Try loading a clean truetype font or fallback
    try:
        font_large = ImageFont.truetype("arialbd.ttf", int(size * 0.105))
        font_med = ImageFont.truetype("arialbd.ttf", int(size * 0.055))
        font_badge = ImageFont.truetype("arialbd.ttf", int(size * 0.052))
    except Exception:
        font_large = ImageFont.load_default()
        font_med = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Draw "I [Ruby Heart]" at y ~ 0.53
    # Draw ruby heart at center (0.5, 0.55)
    hx, hy = w * 0.50, w * 0.54
    hr = w * 0.045
    # Draw diamond/heart polygon
    heart_pts = [
        (hx, hy + hr),
        (hx - hr*1.1, hy - hr*0.2),
        (hx - hr*0.6, hy - hr*0.9),
        (hx, hy - hr*0.4),
        (hx + hr*0.6, hy - hr*0.9),
        (hx + hr*1.1, hy - hr*0.2),
    ]
    draw.polygon(heart_pts, fill=(195, 15, 45, 255), outline=(235, 210, 220, 255))

    # "I" to the left of heart
    draw.text((w * 0.40, w * 0.54), "I", fill=(240, 243, 246, 255), font=font_med, anchor="mm")

    # 4. "PDFMaster" in 3D metallic silver lettering below heart (y ~ 0.67)
    # Shadow first
    draw.text((w * 0.50 + shadow_offset, w * 0.67 + shadow_offset), "PDFMaster", fill=(30, 0, 5, 200), font=font_large, anchor="mm")
    draw.text((w * 0.50, w * 0.67), "PDFMaster", fill=(245, 247, 250, 255), font=font_large, anchor="mm")

    # 5. Metallic Silver Pill Badge "VIEW & EDIT" at bottom (y ~ 0.86)
    bw, bh = w * 0.68, w * 0.115
    bx0, by0 = (w - bw) / 2, w * 0.80
    bx1, by1 = bx0 + bw, by0 + bh
    
    # Shadow for pill badge
    draw.rounded_rectangle([bx0+shadow_offset, by0+shadow_offset, bx1+shadow_offset, by1+shadow_offset], radius=int(bh*0.45), fill=(25, 0, 5, 180))
    # Silver metallic pill fill
    draw.rounded_rectangle([bx0, by0, bx1, by1], radius=int(bh*0.45), fill=(235, 238, 242, 255), outline=(180, 185, 195, 255), width=max(1, int(size*0.005)))
    
    # Text inside badge "VIEW & EDIT"
    draw.text((w * 0.50, by0 + bh * 0.50), "VIEW & EDIT", fill=(70, 10, 15, 255), font=font_badge, anchor="mm")

    return img

def main():
    desktop_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.abspath(os.path.join(desktop_dir, "..", "frontend", "public"))

    img_512 = create_logo_image(512)
    png_path = os.path.join(desktop_dir, "icon.png")
    img_512.save(png_path, "PNG")
    print(f"Saved complete artwork PNG: {png_path}")

    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    ico_images = [img_512.resize(s, Image.Resampling.LANCZOS) for s in sizes]

    ico_path = os.path.join(desktop_dir, "icon.ico")
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=sizes,
        append_images=ico_images[1:]
    )
    print(f"Saved complete artwork Desktop ICO: {ico_path}")

    if os.path.exists(public_dir):
        fav_path = os.path.join(public_dir, "favicon.ico")
        ico_images[0].save(
            fav_path,
            format="ICO",
            sizes=sizes,
            append_images=ico_images[1:]
        )
        print(f"Saved Favicon ICO: {fav_path}")

if __name__ == "__main__":
    main()
