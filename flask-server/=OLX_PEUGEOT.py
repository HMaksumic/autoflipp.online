import requests
import re
import json
import TAX_RETURN
import os

#fetching data directly from file
def fetch_finn_data():
    json_file_path = 'data/PEUGEOT_SEARCH.json'
    try:
        with open(json_file_path, 'r') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print("Error: The JSON file was not found.")
        return []
    except json.JSONDecodeError:
        print("Error decoding JSON from the file.")
        return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

#fetching from olx (several pages of JSON)
def fetch_olx_data(max_pages=38):
    olx_url = 'https://olx.ba/api/search'
    params = {
            'attr': '3228323031302d393939393939293a372844697a656c29',
            'attr_encoded': '1',
            'category_id': '18',
            'brand': '65',
            'models': '0',
            'brands': '65',
            'page': 1,
            'per_page': 175
        }

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://olx.ba/'
    }
    
    olx_data = []
    
    while params['page'] <= max_pages:
        try:
            response = requests.get(olx_url, params=params,headers=headers)
            response.raise_for_status()
            data = response.json()
            
            #car entries are under data in the olx api
            page_data = data.get('data', [])
            olx_data.extend(page_data)
            params['page'] += 1
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from OLX API: {e}")
            break
        except ValueError as e:
            print(f"Error parsing JSON from OLX API: {e}")
            break
    
    return olx_data

models = {
    "108 Active", "108 Allure", "108 GT Line",
    "208 Active", "208 Allure", "208 GT", "208 GT Line", "208 e-208",
    "2008 Active", "2008 Allure", "2008 GT", "2008 GT Line", "2008 e-2008",
    "308 Active", "308 Allure", "308 GT", "308 GT Line", "308 GTi",
    "3008 Active", "3008 Allure", "3008 GT", "3008 GT Line", "3008 Hybrid4",
    "508 Active", "508 Allure", "508 GT", "508 GT Line", "508 PSE", 
    "5008 Active", "5008 Allure", "5008 GT", "5008 GT Line", 
    "108 Access", "108 Style", 
    "208 Access", "208 Tech Edition", "208 Style", 
    "2008 Access", "2008 Tech Edition", "2008 Style", 
    "308 Access", "308 Tech Edition", "308 Style", 
    "3008 Access", "3008 Tech Edition", "3008 Style", 
    "508 Access", "508 Tech Edition", "508 Style", 
    "5008 Access", "5008 Tech Edition", "5008 Style", 
    "iOn",
    "Traveller Standard", "Traveller Long", "Traveller Compact", 
    "Partner Active", "Partner Allure", "Partner Tepee", 
    "Rifter Active", "Rifter Allure", "Rifter GT Line", 
    "Expert Standard", "Expert Long", "Expert Compact", 
    "Boxer Standard", "Boxer Long", "Boxer Compact", 
    "205 GTi", "205 XS", 
    "206 GTi", "206 CC", "206 SW", 
    "306 GTi", "306 S16", "306 Cabriolet", 
    "406 Coupe", "406 Break", 
    "607 Executive", "607 SV", 
    "405 Mi16", "405 Break", 
    "605 SV", "605 SRi", 
    "106 Rallye", "106 XS", 
    "307 SW", "307 CC", 
    "407 Coupe", "407 SW", 
    "504 Coupe", "504 Convertible", 
    "505 GTi", "505 Break", 
    "309 GTi", "309 XS", 
    "104 ZS", "104 SL", 
    "204 Break", "204 Coupe", 
    "304 Break", "304 S", 
    "404 Coupe", "404 Cabriolet"
}
def normalize_name(name):
    name = re.sub(r'(?i)\b(4matic|masse|utstyr|eu|ny|kontroll|service|oljeskift|cdi|tdi|dci|mpi|gdi|tdci|tfsi|tsi|td|cd|thp|blueefficiency|novi|model|triptonic|stanje|top|gtd|god|2008|2009|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|quattro|facelift|mercedes|benz|motion|tek|uvezana|uvoz|limited|edition|luxury|premium|base|sport|advanced|line|drive|paket|paket|edition|automatic|manual|diesel|sedan|hatchback|coupe|convertible|wagon|suv|compact|electric|hybrid|awd|fwd|rwd|l|xl|xxl|plus|pro|classic|comfort|executive|elegance|exclusive|design|performance|dynamic|style|active|emotion|innovation|limited|classic|supreme|highline|comfortline|trendline|elite|cosmo|prestige|cross|drive|line|connect|base|executive|essential|value|p|performance|track|trail|sportback|touring|all4|countryman|clubman|john|cooper|works|crosstrek|outback|forester|brz|wrx|sti|limited|touring|premium|black|edition|signature|select|preferred|standard|touring|cx|forester|sport|special|series|2dr|4dr|5dr|7dr|12dr|15dr|21dr|23dr|32dr|40dr|45dr|5seater|7seater|compact|mpv|minivan|roadster|crossover|gtline|cabrio|cabriolet|estate|estate|saloon|super|base|lifestyle|lux|xdrive|xdrive20d|d|rline|spaceback|vision|entry|entryline|life|light|ultimate|evo|ambiente|sve|sve|emotion|dynamic|action|line|tek|tronic|select|stand|entry|vtx|ls|dl|sx|hx|xe|xt|kt|xt|tm|hk|tl|luxe|intense|shine|pure|prestige|legend|premium|premium|supreme|gt|sline|audi|bmw|volkswagen|vw|peugeot|opel|mazda|mitsubishi|toyota|honda|kia|hyundai|nissan|seat|skoda|volvo|renault|suzuki|mini|subaru|chrysler|dodge|jeep|ram|chevrolet|ford|gmc|lincoln|buick|cadillac|lexus|infiniti|acura|jaguar|land|rover|alfa|romeo|fiat|maserati|ferrari|lamborghini|porsche|bugatti|aston|martin|bentley|rolls|royce|polestar|tesla|lucid|rivian|bollinger|canoo|byton|faraday|future|karma|nikola|nobe|regen|gordon|murray|automotive|hendrickson|hewes|hill|hino|hisun|honda|husqvarna|indian|infiniti|ironhorse|isuzu|jaguar|jeep|jensen|john|deere|karma|kia|lancia|land|rover|lincoln|lotus|lucid|mclaren|maserati|mazda|mercedes|mg|mini|mitsubishi|morgan|nimble|nissan|peugeot|pontiac|porsche|ram|renault|rolls|royce|saab|saturn|scion|seat|skoda|smart|ssangyong|subaru|suzuki|tesla|toyota|triumph|vauxhall|volkswagen|volvo|smart|uaz|ura|vespa|vortex|volkswagen|westfield|yamaha|yellow|zastava|zaz|zins|zundapp|zundapp|)\b', '', name)

    name = re.sub(r'\W+', ' ', name)
    name = re.sub(r'\b\d+hk\b', '', name, flags=re.IGNORECASE)
    return ' '.join(name.lower().split())

def match_car(finn_car, olx_car):
    finn_name = set(normalize_name(finn_car.get('heading', '')).split())
    olx_name = set(normalize_name(olx_car.get('title', '')).split())

    # Check for any common words, including model names
    common_words = finn_name.issubset(olx_name) or olx_name.issubset(finn_name)
    model_match = bool((finn_name & olx_name) & models)

    if common_words or model_match:
        finn_year = finn_car.get('year', 0)
        olx_year = olx_car.get('special_labels', [])
        olx_year = next((int(label.get('value')) for label in olx_year if label.get('label') == 'Godište'), 0)
        return abs(finn_year - olx_year) <= 0
    return False

def pair_car_data(finn_data, olx_data):
    car_pairs = {}

    if not isinstance(finn_data, list) or not isinstance(olx_data, list):
        print("Error: Expected list format for API data")
        return car_pairs

    for car in finn_data:
        car_name = car.get('heading', '')
        car_price = car.get('price', {}).get('amount')
        car_link = car.get('canonical_url', '')
        car_year = car.get('year', 0)
        car_image_url = car.get('image', {}).get('url', '')
        car_regno = car.get('regno', '')
        car_mileage = car.get('mileage', '')
        if car_name and car_price is not None:
            car_pairs[car_name] = {
                'finn_price': car_price,
                'olx_prices': [],
                'olx_ids': [],
                'olx_names': [],
                'olx_mileages':[],
                'olx_images':[],
                'year': car_year,
                'link': car_link,
                'image_url': car_image_url,
                'regno': car_regno,
                'mileage' : car_mileage,
            }

    for car in olx_data:
        if isinstance(car, dict):
            olx_name = car.get('title', '')
            olx_price = car.get('price')
            olx_id = car.get('id')
            olx_image = car.get('image')
            olx_mileage = next((label["value"] for label in car["special_labels"] if label["label"] == "Kilometraža"), None)

            if olx_name and olx_price is not None:
                for finn_name, data in car_pairs.items():
                    if match_car({'heading': finn_name, 'year': data['year']}, car):
                        car_pairs[finn_name]['olx_prices'].append(olx_price)
                        car_pairs[finn_name]['olx_ids'].append(olx_id)
                        car_pairs[finn_name]['olx_names'].append(olx_name)
                        car_pairs[finn_name]['olx_images'].append(olx_image)
                        car_pairs[finn_name]['olx_mileages'].append(olx_mileage)

    return car_pairs

finn_data = fetch_finn_data()
olx_data = fetch_olx_data()

paired_data = pair_car_data(finn_data, olx_data)

olx_finn_output = []
for car_name, data in paired_data.items():
    olx_prices = data['olx_prices']
    if olx_prices:
        finn_price = data['finn_price']
        year = data['year']
        link = data['link']
        image_url = data['image_url']
        regno = data['regno']
        olx_ids = data['olx_ids']
        mileage = data['mileage']
        olx_names = data['olx_names']
        olx_images = data['olx_images']
        olx_mileages = data['olx_mileages']

        car_entry = {
            'car_name': car_name,
            'year': year,
            'finn_price': finn_price,
            'finn_link': link,
            'image_url': image_url,
            'regno': regno,
            'mileage' : mileage,
            'olx_prices': olx_prices,
            'olx_ids' : olx_ids,
            'olx_names' : olx_names,
            'olx_images' : olx_images,
            'olx_mileages' : olx_mileages,
        }
        olx_finn_output.append(car_entry)

for car in olx_finn_output:
    if car['year'] >= 2015 and car.get('regno'):
            registration_number = car['regno'] 
            tax_return = TAX_RETURN.fetch_tax_return(registration_number)
            car['tax_return'] = tax_return
    
    else:
        car['tax_return'] = None

current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, 'data')
os.makedirs(data_dir, exist_ok=True)

print("length of list: ", len(olx_finn_output))
with open(os.path.join(data_dir, '=OLX_PEUGEOT.json'), 'w', encoding='utf-8') as json_file:
	if olx_finn_output:
	    json.dump(olx_finn_output, json_file, ensure_ascii=False, indent=4)


import datetime
with open('__LOG__.txt', 'a', encoding='utf-8') as file:
    file.write(f"{datetime.datetime.now()} - =OLX_PEUGEOT.py ran\n")
