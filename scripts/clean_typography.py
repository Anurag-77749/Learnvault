import glob

files = [
    'frontend/src/components/TimerScreen.tsx',
    'frontend/src/components/PlanScreen.tsx',
    'frontend/src/components/LearnScreen.tsx',
    'frontend/src/components/ProjectsScreen.tsx',
    'frontend/src/components/ProgressScreen.tsx'
]

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Clean typography: replace font-serif with font-sans / clean tracking
        content = content.replace('font-serif ', '')
        content = content.replace('card-maroon-gold', 'card-maroon')
        content = content.replace('btn-shiny-gold', 'btn-gold')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
