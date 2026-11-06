import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

def draw_gear(draw, cx, cy, radius, num_teeth, tooth_height, inner_radius, angle_rad, 
              gold_color=(229, 184, 75, 255), shade_color=(140, 95, 25, 255)):
    # Draw gear teeth with precision cogs
    points = []
    total_steps = num_teeth * 4
    for i in range(total_steps):
        theta = angle_rad + (i / total_steps) * 2 * math.pi
        step_in_tooth = i % 4
        if step_in_tooth == 0 or step_in_tooth == 1:
            r = radius + tooth_height
        else:
            r = radius
        x = cx + r * math.cos(theta)
        y = cy + r * math.sin(theta)
        points.append((x, y))
    
    if len(points) >= 3:
        draw.polygon(points, fill=gold_color, outline=shade_color)
    
    # Outer ring bevel
    draw.ellipse([cx - radius + 3, cy - radius + 3, cx + radius - 3, cy + radius - 3], 
                 fill=gold_color, outline=shade_color)
    
    # Gear cutouts (spokes)
    num_spokes = 5
    for s in range(num_spokes):
        spoke_angle = angle_rad + (s / num_spokes) * 2 * math.pi
        sx = cx + (radius * 0.55) * math.cos(spoke_angle)
        sy = cy + (radius * 0.55) * math.sin(spoke_angle)
        sr = radius * 0.22
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(16, 4, 7, 240))
        
    # Center brass bushing & pivot
    draw.ellipse([cx - inner_radius, cy - inner_radius, cx + inner_radius, cy + inner_radius], 
                 fill=(249, 217, 118, 255), outline=(100, 70, 20, 255))
    draw.ellipse([cx - inner_radius*0.4, cy - inner_radius*0.4, cx + inner_radius*0.4, cy + inner_radius*0.4], 
                 fill=(12, 3, 5, 255))

def generate_frames():
    os.makedirs('public/frames', exist_ok=True)
    W, H = 1024, 576

    # Load high-resolution isolated 3D chronometer cube
    cube_src = Image.open('public/isolated_cube.png').convert('RGBA')
    cube_w, cube_h = cube_src.size # ~310x310

    # Scale cube up to hero presentation size (~420x420)
    target_cube_size = 400
    cube_scaled = cube_src.resize((target_cube_size, target_cube_size), Image.Resampling.LANCZOS)
    CW, CH = cube_scaled.size

    # Isolate components:
    # 1. Left matte obsidian panel (x: 0 to CW*0.46)
    left_panel_crop = cube_scaled.crop((0, 0, int(CW * 0.48), CH))
    
    # 2. Right chronometer glass & clock face (x: CW*0.44 to CW)
    right_face_crop = cube_scaled.crop((int(CW * 0.44), 0, CW, CH))

    # Pre-generate 45 golden bokeh ember particles
    np.random.seed(42)
    num_particles = 45
    px = np.random.uniform(40, W - 40, num_particles)
    py = np.random.uniform(40, H - 40, num_particles)
    pr = np.random.uniform(1.8, 5.0, num_particles)
    pspeed_y = np.random.uniform(0.4, 1.4, num_particles)
    palpha = np.random.uniform(70, 200, num_particles)

    total_frames = 240
    print(f"Generating {total_frames} 3D Chronometer Disassembly frames into public/frames/...")

    for f in range(1, total_frames + 1):
        # Progress t: 0.0 (assembled) -> 1.0 (fully exploded internal tech showcase)
        if f <= 35:
            raw_t = 0.0
        elif f >= 185:
            raw_t = 1.0
        else:
            raw_t = (f - 35) / (185 - 35)

        # Apple smooth quintic ease-in-out
        t = raw_t * raw_t * raw_t * (raw_t * (raw_t * 6 - 15) + 10)

        # 1. Clean Obsidian Void Background
        frame = Image.new('RGBA', (W, H), (8, 3, 4, 255))
        f_draw = ImageDraw.Draw(frame)

        # Cinematic volumetric burgundy and amber studio light
        center_x = W // 2
        center_y = H // 2 + int(math.sin(f * 0.04) * 5) # Organic floating levitation

        for r in range(450, 0, -18):
            alpha = int(45 * (1 - (r / 450) ** 1.4))
            f_draw.ellipse([center_x - r*1.3, center_y - r*0.7, center_x + r*1.3, center_y + r*0.7], 
                           fill=(55, 12, 18, alpha))
            if r < 200:
                core_glow = int((30 + 50 * t) * (1 - r / 200))
                f_draw.ellipse([center_x - r*0.9, center_y - r*0.6, center_x + r*0.9, center_y + r*0.6], 
                               fill=(140, 70, 15, core_glow))

        # 2. Render Animated Floating Golden Bokeh Particles (Behind Cube)
        for i in range(num_particles):
            cur_y = (py[i] - f * pspeed_y[i]) % H
            cur_x = (px[i] + math.sin(f * 0.02 + i) * 18) % W
            rad = pr[i] * (1.0 + 0.25 * math.sin(f * 0.05 + i))
            cur_alpha = int(palpha[i] * (0.65 + 0.35 * math.sin(f * 0.03 + i)))
            f_draw.ellipse([cur_x - rad, cur_y - rad, cur_x + rad, cur_y + rad], 
                           fill=(229, 184, 75, cur_alpha))
            if rad > 3.2:
                f_draw.ellipse([cur_x - rad*2.2, cur_y - rad*2.2, cur_x + rad*2.2, cur_y + rad*2.2], 
                               fill=(249, 217, 118, cur_alpha // 3))

        # 3. INTERNAL TECH MECHANISM (Rendered inside the expanding chamber)
        if t > 0.02:
            # Internal gear layer
            gear_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            g_draw = ImageDraw.Draw(gear_layer)
            
            gear_rot = f * 0.06
            gear_alpha = int(min(255, 255 * (t / 0.3)))

            # Gear 1: Main Drive Gear (Left-Center)
            draw_gear(g_draw, center_x - 70, center_y - 20, 
                      radius=int(60 + 10 * t), num_teeth=20, tooth_height=12, inner_radius=16, 
                      angle_rad=gear_rot,
                      gold_color=(229, 184, 75, gear_alpha),
                      shade_color=(120, 80, 20, gear_alpha))

            # Gear 2: Meshing Chronometer Gear (Right-Center)
            draw_gear(g_draw, center_x + 55, center_y + 35, 
                      radius=int(48 + 8 * t), num_teeth=16, tooth_height=10, inner_radius=14, 
                      angle_rad=-gear_rot * 1.25 + 0.4,
                      gold_color=(249, 217, 118, gear_alpha),
                      shade_color=(130, 85, 20, gear_alpha))

            # Gear 3: Escapement Balance Wheel (Top-Right)
            draw_gear(g_draw, center_x + 30, center_y - 65, 
                      radius=int(36 + 6 * t), num_teeth=12, tooth_height=8, inner_radius=10, 
                      angle_rad=gear_rot * 2.1,
                      gold_color=(212, 175, 55, gear_alpha),
                      shade_color=(110, 75, 15, gear_alpha))

            # Central Amber Quantum Micro-Core
            core_r = int(28 + 24 * t + 4 * math.sin(f * 0.12))
            for cr in range(core_r, 0, -4):
                c_alpha = int(min(255, (160 + 95 * t) * (1 - (cr / core_r)**1.2)))
                g_draw.ellipse([center_x - cr, center_y - cr, center_x + cr, center_y + cr], 
                               fill=(245, 166, 35, c_alpha))
            
            # Glowing microchip core nucleus
            nuc_r = int(12 + 6 * t)
            g_draw.rectangle([center_x - nuc_r, center_y - nuc_r, center_x + nuc_r, center_y + nuc_r], 
                             fill=(255, 235, 180, gear_alpha), outline=(229, 184, 75, gear_alpha))

            # Connecting golden circuitry traces
            g_draw.line([(center_x - 140, center_y), (center_x + 140, center_y)], fill=(229, 184, 75, int(gear_alpha * 0.5)), width=2)
            g_draw.line([(center_x, center_y - 90), (center_x, center_y + 90)], fill=(229, 184, 75, int(gear_alpha * 0.5)), width=2)

            # Paste internal gears onto frame
            frame.alpha_composite(gear_layer)

        # 4. DISASSEMBLY DISPLACEMENT
        # As t goes from 0 -> 1:
        # Left obsidian panel slides leftwards: offset 0 -> -250px
        # Right chronometer clock face slides rightwards: offset 0 -> +250px
        disassembly_offset = int(t * 260)
        
        # When t is low (< 0.25), draw the unified assembled cube seamlessly
        if t < 0.05:
            # Fully assembled cube centered in viewport
            cube_x = center_x - CW // 2
            cube_y = center_y - CH // 2
            frame.paste(cube_scaled, (cube_x, cube_y), cube_scaled)
        else:
            # Disassembled Components sliding laterally
            # Left panel
            left_x = (center_x - CW // 2) - disassembly_offset
            left_y = center_y - CH // 2
            frame.paste(left_panel_crop, (left_x, left_y), left_panel_crop)

            # Right chronometer face & glass lenses
            right_x = (center_x - CW // 2 + int(CW * 0.44)) + disassembly_offset
            right_y = center_y - CH // 2
            frame.paste(right_face_crop, (right_x, right_y), right_face_crop)

            # Suspended Optical Glass Lens Disc (Apple exploded optical array)
            if t > 0.3:
                lens_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
                l_draw = ImageDraw.Draw(lens_layer)
                lens_x = right_x + int(CW * 0.35)
                lens_y = right_y + CH // 2
                lens_r = int(80 + 20 * t)
                lens_alpha = int(min(120, 120 * (t - 0.3) / 0.7))
                
                # Concentric crystal glass rim
                l_draw.ellipse([lens_x - lens_r, lens_y - lens_r, lens_x + lens_r, lens_y + lens_r], 
                               fill=(60, 20, 28, int(lens_alpha * 0.3)), 
                               outline=(249, 217, 118, lens_alpha), width=2)
                l_draw.ellipse([lens_x - lens_r*0.7, lens_y - lens_r*0.7, lens_x + lens_r*0.7, lens_y + lens_r*0.7], 
                               outline=(229, 184, 75, int(lens_alpha * 0.6)), width=1)
                frame.alpha_composite(lens_layer)

        # 5. Apple High-Craft Subtle Camera Push (Scale 0.96 to 1.02)
        camera_scale = 0.96 + 0.06 * t
        if abs(camera_scale - 1.0) > 0.005:
            scaled_w = int(W * camera_scale)
            scaled_h = int(H * camera_scale)
            zoomed = frame.resize((scaled_w, scaled_h), Image.Resampling.BILINEAR)
            crop_x = (scaled_w - W) // 2
            crop_y = (scaled_h - H) // 2
            frame = zoomed.crop((crop_x, crop_y, crop_x + W, crop_y + H))

        # Save crisp JPEG frame (Zero text, pure 3D hardware render)
        rgb_frame = frame.convert('RGB')
        frame_filename = f"public/frames/frame_{f:03d}.jpg"
        rgb_frame.save(frame_filename, "JPEG", quality=86, optimize=True)

        if f % 40 == 0 or f == total_frames:
            print(f"Rendered frame {f:03d}/{total_frames} (progress: {t:.2f})")

    print("All 240 Chronometer 3D Disassembly frames successfully generated!")

if __name__ == '__main__':
    generate_frames()
