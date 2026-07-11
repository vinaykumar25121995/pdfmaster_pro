import os
from PIL import Image, ImageDraw

def make_squircle_mask(size, radius_ratio=0.22):
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    radius = int(size * radius_ratio)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    return mask

def main():
    src_path = r"C:\Users\HP\.gemini\antigravity\brain\498ab252-93e5-4cdd-90a3-15358564fb6d\media__1783763538711.jpg"
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        return

    desktop_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.abspath(os.path.join(desktop_dir, "..", "frontend", "public"))

    img = Image.open(src_path).convert("RGBA")
    w, h = img.size
    size = min(w, h)
    img = img.resize((size, size), Image.Resampling.LANCZOS)

    # Apply squircle rounded corners mask for clean Windows 11 & web icon appearance
    mask = make_squircle_mask(size, 0.22)
    img.putalpha(mask)

    # Save master PNGs
    png_path = os.path.join(desktop_dir, "icon.png")
    img.save(png_path, "PNG")
    print(f"Saved exact user logo PNG: {png_path}")

    logo_path = os.path.join(public_dir, "logo.png")
    img.save(logo_path, "PNG")
    print(f"Saved public logo PNG: {logo_path}")

    # Generate multi-size ICO for Windows
    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    ico_images = [img.resize(s, Image.Resampling.LANCZOS) for s in sizes]

    ico_path = os.path.join(desktop_dir, "icon.ico")
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=sizes,
        append_images=ico_images[1:]
    )
    print(f"Saved exact user logo Desktop ICO: {ico_path}")

    fav_path = os.path.join(public_dir, "favicon.ico")
    ico_images[0].save(
        fav_path,
        format="ICO",
        sizes=sizes,
        append_images=ico_images[1:]
    )
    print(f"Saved exact user logo Favicon ICO: {fav_path}")

if __name__ == "__main__":
    main()
