import os

dir_path = r"c:\Users\lenovo\OneDrive\Desktop\T&M online Fashions"
index_path = os.path.join(dir_path, "index.html")
video_shopping_path = os.path.join(dir_path, "video-shopping.html")

with open(index_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()

start_marker = "<!-- SAREE COLLECTION SECTION -->"
end_marker = "<!-- FOOTER -->"

start_idx = idx_content.find(start_marker)
end_idx = idx_content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    sections_html = idx_content[start_idx:end_idx].strip()
    
    with open(video_shopping_path, 'r', encoding='utf-8') as f:
        vs_content = f.read()
        
    vs_footer_marker = "<!-- FOOTER -->"
    parts = vs_content.split(vs_footer_marker)
    
    if len(parts) == 2:
        new_vs = parts[0] + "\n\n    " + sections_html + "\n\n    " + vs_footer_marker + parts[1]
        with open(video_shopping_path, 'w', encoding='utf-8') as f:
            f.write(new_vs)
        print("Successfully copied sections to video-shopping.html")
    else:
        print("Footer marker not found in video-shopping.html")
else:
    print("Start or end marker not found in index.html")
