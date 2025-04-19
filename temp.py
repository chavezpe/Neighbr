import os


def print_directory_tree(start_path):
	exclude_dirs = {'node_modules', '.expo', '__pycache__'}
	
	for root, dirs, files in os.walk(start_path):
		# Calculate indentation level
		level = root.replace(start_path, '').count(os.sep)
		indent_str = '    ' * level
		folder_name = os.path.basename(root) or start_path
		print(f"{indent_str}📁 {folder_name}")
		
		# Filter out excluded directories in-place
		dirs[:] = [d for d in dirs if d not in exclude_dirs]
		
		sub_indent = '    ' * (level + 1)
		for f in files:
			print(f"{sub_indent}📄 {f}")


print_directory_tree(start_path = 'frontend')
