import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

def generate_frames():
    os.makedirs('public/frames', exist_ok=True)
    src_path = r'C:\Users\polak\.gemini\antigravity\brain\6cb0479a-41e2-469f-835c-222358a006cb\.user_uploaded\media_1794000205955_12328d2e.jpg'
    
    # 1024x576 is optimal 16:9 widescreen: pristine sharpness & fast browser loading
    W, H = 1024, 576
    base = Image.open(src_path).convert('RGBA').resize((W, H), Image.Resampling.LANCZOS)
    
    # Separate layers:
    # 1. Clean obsidian background with deep burgundy/amber ambient falloff
    bg_base = Image.new('RGBA', (W, H), (8, 3, 4, 255))
    bg_draw = ImageDraw.Draw(bg_base)
    # Warm volumetric burgundy glow behind core
    for r in range(350, 0, -15):
        alpha = int(45 * (1 - (r / 350) ** 1.5))
        bg_draw.ellipse([W//2 - r*1.3, H//2 - r*0.7, W//2 + r*1.3, H//2 + r*0.7], fill=(55, 12, 18, alpha))
        if r < 180:
            c_alpha = int(30 * (1 - r / 180))
            bg_draw.ellipse([W//2 - r*0.8, H//2 - r*0.5, W//2 + r*0.8, H//2 + r*0.5], fill=(120, 60, 15, c_alpha))
            
    # Left matte black glass panel + golden circuits (x: 50 to 310)
    left_mask = Image.new('L', (W, H), 0)
    l_draw = ImageDraw.Draw(left_mask)
    l_draw.rectangle([0, 0, 270, H], fill=255)
    for i in range(50):
        alpha = int(255 * (1 - i / 50))
        l_draw.line([(270 + i, 0), (270 + i, H)], fill=alpha)
        
    # Right glass panel + chronometer lenses (x: 750 to 1024)
    right_mask = Image.new('L', (W, H), 0)
    r_draw = ImageDraw.Draw(right_mask)
    r_draw.rectangle([770, 0, W, H], fill=255)
    for i in range(50):
        alpha = int(255 * (1 - i / 50))
        r_draw.line([(770 - i, 0), (770 - i, H)], fill=alpha)
        
    # Center cube housing + golden gears + glowing amber core
    center_mask = Image.new('L', (W, H), 255)
    c_arr = np.array(center_mask)
    l_arr = np.array(left_mask)
    r_arr = np.array(right_mask)
    c_arr = np.clip(c_arr.astype(int) - (l_arr.astype(int)) - (r_arr.astype(int)), 0, 255).astype(np.uint8)
    center_mask = Image.fromarray(c_arr).filter(ImageFilter.GaussianBlur(8))
    
    left_img = Image.new('RGBA', (W, H), (0,0,0,0))
    left_img.paste(base, (0,0), left_mask)
    
    right_img = Image.new('RGBA', (W, H), (0,0,0,0))
    right_img.paste(base, (0,0), right_mask)
    
    center_img = Image.new('RGBA', (W, H), (0,0,0,0))
    center_img.paste(base, (0,0), center_mask)
    
    # Pre-calculate 40 golden bokeh ember particles
    np.random.seed(42)
    num_particles = 45
    px = np.random.uniform(50, W - 50, num_particles)
    py = np.random.uniform(50, H - 50, num_particles)
    pr = np.random.uniform(1.5, 4.5, num_particles)
    pspeed_y = np.random.uniform(0.3, 1.2, num_particles)
    pspeed_x = np.random.uniform(-0.4, 0.4, num_particles)
    palpha = np.random.uniform(60, 180, num_particles)
    
    # 240 frames
    total_frames = 240
    print(f"Generating {total_frames} frames into public/frames/...")
    
    for f in range(1, total_frames + 1):
        # Progress t: 0.0 to 1.0
        # Frame 1-35: Assembled state with micro-float and breathing amber glow
        # Frame 36-180: Disassembly explosion sequence with Apple smooth curve
        # Frame 181-240: Suspended exploded state with locked camera & floating embers
        if f <= 35:
            raw_t = 0.0
        elif f >= 185:
            raw_t = 1.0
        else:
            raw_t = (f - 35) / (185 - 35)
            
        # Apple smooth quintic ease-in-out
        t = raw_t * raw_t * raw_t * (raw_t * (raw_t * 6 - 15) + 10)
        
        # Docking offsets:
        # At t=0 (assembled): left panel moved +180px rightward; right panel moved -180px leftward
        # At t=1 (exploded): left panel at 0, right panel at 0
        left_dx = int((1.0 - t) * 180)
        right_dx = int(-(1.0 - t) * 180)
        
        # Micro camera zoom (0.97 to 1.01)
        camera_scale = 0.97 + 0.04 * t
        
        # Subtly float the cube vertically (Apple organic levitation)
        levitate_y = int(math.sin(f * 0.04) * 4)
        
        # Composite frame
        frame = bg_base.copy()
        f_draw = ImageDraw.Draw(frame)
        
        # Render animated golden bokeh ember particles
        for i in range(num_particles):
            cur_y = (py[i] - f * pspeed_y[i]) % H
            cur_x = (px[i] + math.sin(f * 0.02 + i) * 15) % W
            rad = pr[i] * (1.0 + 0.2 * math.sin(f * 0.05 + i))
            cur_alpha = int(palpha[i] * (0.7 + 0.3 * math.sin(f * 0.03 + i)))
            f_draw.ellipse(
                [cur_x - rad, cur_y - rad, cur_x + rad, cur_y + rad],
                fill=(229, 184, 75, cur_alpha)
            )
            # Halo around larger particles
            if rad > 3.0:
                f_draw.ellipse(
                    [cur_x - rad*2, cur_y - rad*2, cur_x + rad*2, cur_y + rad*2],
                    fill=(249, 217, 118, cur_alpha // 3)
                )
                
        # Draw center cube housing
        frame.paste(center_img, (0, levitate_y), center_mask)
        
        # Core amber energy pulse (intensifies as panels slide open)
        core_intensity = 0.4 + 0.6 * t + 0.15 * math.sin(f * 0.1)
        core_r = int(50 + 35 * t)
        core_alpha = int(min(255, 90 * core_intensity))
        f_draw.ellipse(
            [W//2 - core_r - 20, H//2 - core_r + levitate_y, W//2 + core_r - 20, H//2 + core_r + levitate_y],
            fill=(245, 166, 35, core_alpha)
        )
        
        # Draw left and right panels with mechanical docking displacement
        frame.paste(left_img, (left_dx, levitate_y), left_mask)
        frame.paste(right_img, (right_dx, levitate_y), right_mask)
        
        # Apply subtle camera zoom if scale != 1.0
        if abs(camera_scale - 1.0) > 0.005:
            scaled_w = int(W * camera_scale)
            scaled_h = int(H * camera_scale)
            zoomed = frame.resize((scaled_w, scaled_h), Image.Resampling.BILINEAR)
            crop_x = (scaled_w - W) // 2
            crop_y = (scaled_h - H) // 2
            frame = zoomed.crop((crop_x, crop_y, crop_x + W, crop_y + H))
            
        # Convert to RGB and save frame
        rgb_frame = frame.convert('RGB')
        frame_filename = f"public/frames/frame_{f:03d}.jpg"
        rgb_frame.save(frame_filename, "JPEG", quality=82, optimize=True)
        
        if f % 40 == 0 or f == total_frames:
            print(f"Generated frame {f:03d}/{total_frames} (progress: {t:.2f})")
            
    print("All 240 frames successfully generated in public/frames/!")

if __name__ == '__main__':
    generate_frames()
