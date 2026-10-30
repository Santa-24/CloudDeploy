import zipfile
import re

doc_path = r'C:/Users/santa/.gemini/antigravity/brain/4c4aa63f-7446-4c1c-be7b-91a46f45cc30/.user_uploaded/media_1793293080086_7523e202.docx'
with zipfile.ZipFile(doc_path, 'r') as z:
    for name in ['word/fontTable.xml', 'word/theme/theme1.xml']:
        if name in z.namelist():
            txt = z.read(name).decode('utf-8', errors='ignore')
            print(f'=== {name} ===')
            f1 = re.findall(r'typeface="([^"]+)"', txt)
            f2 = re.findall(r'w:name="([^"]+)"', txt)
            print('Typefaces:', set(f1))
            print('W:Names:', set(f2))

