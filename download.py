import urllib.request
import json
import ssl
import os

os.makedirs('public/images/courses', exist_ok=True)

ssl._create_default_https_context = ssl._create_unverified_context
headers = {'User-Agent': 'Mozilla/5.0'}

files = {
    'army.svg': 'File:Indian_Army_Insignia.svg',
    'police.svg': 'File:Maharashtra_Police_Insignia_India.svg',
    'srpf.svg': 'File:Maharashtra_Police_Insignia_India.svg',
    'written.svg': 'File:Nuvola_apps_bookcase.svg'
}

for name, filename in files.items():
    api_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={filename}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(api_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            pages = data['query']['pages']
            page = list(pages.values())[0]
            img_url = page['imageinfo'][0]['url']
            
            img_req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(img_req) as img_res, open(f'public/images/courses/{name}', 'wb') as f:
                f.write(img_res.read())
            print(f"Downloaded {name} from {img_url}")
    except Exception as e:
        print(f"Failed {name}: {e}")
