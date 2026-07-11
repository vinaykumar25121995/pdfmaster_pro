import os
from PIL import Image, ImageDraw, ImageFont

def draw_icon(size):
    # Create RGBA image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw Red Squircle (Rounded Rectangle)
    radius = int(size * 0.22)
    margin = int(size * 0.04)
    x0, y0 = margin, margin
    x1, y1 = size - margin, size - margin

    # Draw rounded rectangle with rich red color
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=(200, 16, 46, 255))

    # Draw crisp white stylized swooping ribbon loop (Acrobat-style treble clef / loop)
    # Scale coordinates based on size
    # We draw smooth thick lines forming the loop
    w = size
    lw = max(2, int(w * 0.065))
    lw_inner = max(2, int(w * 0.045))

    # Top loop
    draw.arc([w*0.42, w*0.16, w*0.56, w*0.44], 180, 360, fill=(255, 255, 255, 255), width=lw)
    draw.line([w*0.42, w*0.28, w*0.35, w*0.58], fill=(255, 255, 255, 255), width=lw)
    draw.line([w*0.56, w*0.28, w*0.62, w*0.48], fill=(255, 255, 255, 255), width=lw)

    # Bottom left swoop
    draw.line([w*0.35, w*0.58, w*0.24, w*0.72], fill=(255, 255, 255, 255), width=lw)
    draw.arc([w*0.20, w*0.60, w*0.34, w*0.76], 45, 240, fill=(255, 255, 255, 255), width=lw)

    # Bottom cross stroke
    draw.line([w*0.28, w*0.68, w*0.76, w*0.55], fill=(255, 255, 255, 255), width=lw)

    # Right loop
    draw.arc([w*0.66, w*0.48, w*0.82, w*0.64], 270, 140, fill=(255, 255, 255, 255), width=lw_inner)

    # Draw bottom text "I <3 PDFMaster" on larger sizes
    if size >= 64:
        # Simple crisp bar representation or text if possible
        try:
            draw.text((w*0.5, w*0.82), "I <3 PDFMaster", fill=(255, 255, 255, 255), anchor="mm")
        except Exception:
            pass

    return img

def main():
    desktop_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.abspath(os.path.join(desktop_dir, "..", "frontend", "public"))

    # Generate 512x512 master image
    img_512 = draw_icon(512)
    png_path = os.path.join(desktop_dir, "icon.png")
    img_512.save(png_path, "PNG")
    print(f"Saved PNG: {png_path}")

    # Generate multi-size ICO for Windows
    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    ico_images = [img_512.resize(s, Image.Resampling.LANCZOS) for s in sizes]

    ico_path = os.path.join(desktop_dir, "icon.ico")
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=sizes,
        append_images=ico_images[1:]
    )
    print(f"Saved Desktop ICO: {ico_path}")

    # Also save to frontend/public/favicon.ico
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
