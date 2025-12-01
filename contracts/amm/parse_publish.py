import json
import sys

try:
    # Try reading with utf-16 first (PowerShell default)
    try:
        with open('publish_output.json', 'r', encoding='utf-16') as f:
            data = json.load(f)
    except:
        # Fallback to utf-8
        with open('publish_output.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
    package_id = None
    upgrade_cap = None
    
    for change in data['objectChanges']:
        if change['type'] == 'published':
            package_id = change['packageId']
        if change['type'] == 'created' and change['objectType'].endswith('::package::UpgradeCap'):
            upgrade_cap = change['objectId']
            
    print(f"Package ID: {package_id}")
    print(f"Upgrade Cap: {upgrade_cap}")
    
    with open('ids.txt', 'w') as out:
        out.write(f"{package_id}\n")
        out.write(f"{upgrade_cap}\n")

except Exception as e:
    print(f"Error: {e}")
