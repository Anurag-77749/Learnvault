import os

# 1. Upgrade PlanScreen.tsx
plan_path = 'frontend/src/components/PlanScreen.tsx'
with open(plan_path, 'r', encoding='utf-8') as f:
    plan = f.read()

plan = plan.replace('card-maroon-gold shadow-md', 'card-maroon shadow-md')
plan = plan.replace('card-maroon-gold flex', 'card-maroon flex')
plan = plan.replace('card-maroon-gold text-center', 'card-maroon text-center')

# Replace Shift action buttons to use panel-inset
plan = plan.replace('bg-black border border-[#D4AF37]/40 text-shiny-gold hover:border-[#D4AF37]', 'panel-inset text-shiny-gold hover:text-white')
plan = plan.replace('bg-black border border-[#D4AF37]/40 text-white hover:text-shiny-gold hover:border-[#D4AF37]', 'panel-inset text-[#C5BEB5] hover:text-white')
plan = plan.replace('bg-[#000000] border border-[#4A101D] text-[#B8B0AA] hover:text-shiny-gold hover:border-[#D4AF37]', 'panel-inset text-[#8E867E] hover:text-white')

with open(plan_path, 'w', encoding='utf-8') as f:
    f.write(plan)
print("PlanScreen updated.")

# 2. Upgrade ProgressScreen.tsx
progress_path = 'frontend/src/components/ProgressScreen.tsx'
with open(progress_path, 'r', encoding='utf-8') as f:
    prog = f.read()

prog = prog.replace('card-maroon-gold', 'card-maroon')
prog = prog.replace('bg-black border border-[#4A101D]', 'panel-inset')
prog = prog.replace('bg-[#000000]', 'panel-inset')

with open(progress_path, 'w', encoding='utf-8') as f:
    f.write(prog)
print("ProgressScreen updated.")

# 3. Upgrade ProjectsScreen.tsx
projects_path = 'frontend/src/components/ProjectsScreen.tsx'
with open(projects_path, 'r', encoding='utf-8') as f:
    proj = f.read()

proj = proj.replace('card-maroon-gold', 'card-maroon')

with open(projects_path, 'w', encoding='utf-8') as f:
    f.write(proj)
print("ProjectsScreen updated.")

# 4. Upgrade LearnScreen.tsx
learn_path = 'frontend/src/components/LearnScreen.tsx'
with open(learn_path, 'r', encoding='utf-8') as f:
    learn = f.read()

learn = learn.replace('card-maroon-gold', 'card-maroon')

with open(learn_path, 'w', encoding='utf-8') as f:
    f.write(learn)
print("LearnScreen updated.")
