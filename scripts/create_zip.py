import os
import zipfile

def create_zip():
    output_filename = "paperpilot-project.zip"
    excluded_dirs = {"node_modules", ".git", "dist", ".aistudio", "uploads"}
    excluded_files = {"paperpilot-project.zip", ".DS_Store"}

    print(f"[PaperPilot] Creating {output_filename}...")
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Filter out excluded directories in-place
            dirs[:] = [d for d in dirs if d not in excluded_dirs and not d.startswith(".git")]
            
            for file in files:
                if file in excluded_files:
                    continue
                file_path = os.path.join(root, file)
                # archive name without leading ./
                arcname = os.path.relpath(file_path, ".")
                zipf.write(file_path, arcname)
                
    size_kb = os.path.getsize(output_filename) / 1024
    print(f"[PaperPilot] Successfully created {output_filename} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    create_zip()
