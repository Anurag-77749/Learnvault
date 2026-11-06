import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

def draw_gear(draw, cx, cy, radius, num_teeth, tooth_height, inner_radius, angle_rad, gold_color=(229, 184, 75, 255), shade_color=(150, 105, 30, 255)):
    # Draw gear teeth
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
    
    # Gear body ring
    draw.ellipse([cx - radius + 2, cy - radius + 2, cx + radius - 2, cy + radius - 2], fill=gold_color, outline=shade_color)
    # Gear cutouts (spokes)
    num_spokes = 4
    for s in range(num_spokes):
        spoke_angle = angle_rad + (s / num_spokes) * 2 * math.pi
        sx = cx + (radius * 0.55) * math.cos(spoke_angle)
        sy = cy + (radius * 0.55) * math.sin(spoke_angle)
        sr = radius * 0.22
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=(18, 5, 8, 240))
        
    # Center hub
    draw.ellipse([cx - inner_radius, cy - inner_radius, cx + inner_radius, cy + inner_radius], fill=(249, 217, 118, 255), outline=(90, 60, 15, 255))
    draw.ellipse([cx - inner_radius*0.4, cy - inner_radius*0.4, cx + inner_radius*0.4, cy + inner_radius*0.4], fill=(12, 3, 5, 255))

test_img = Image.new('RGBA', (500, 500), (8, 3, 4, 255))
d = ImageDraw.Draw(test_img)
draw_gear(d, 250, 250, 90, 16, 15, 22, 0.4)
test_img.save('public/test_gear.png')
print('Gear rendered successfully')
