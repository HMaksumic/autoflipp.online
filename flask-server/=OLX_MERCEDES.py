import requests
import re
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import logging

options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--start-maximized')
options.add_argument('--disable-infobars')
options.add_argument('--disable-extensions')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service = Service(executable_path="chromedriver.exe")
driver = webdriver.Chrome(service=service, options=options)

logging.basicConfig(level=logging.INFO)
def TAX_AUTHORITY_COOKIE():
    try:
        logging.info("Checking for cookie consent button...")
        time.sleep(1)
        accept_cookies = driver.find_element(By.CSS_SELECTOR, "#cookie-recommended-desktop-button")
        driver.execute_script("arguments[0].click();", accept_cookies)
        logging.info("Cookie consent has been accepted from Tax Authority.")
    except Exception as e:
        logging.error("Error accepting cookies: %s", e)

def fetch_tax_return(regno):
    tax_url = "https://www.skatteetaten.no/person/avgifter/bil/eksportere/regn-ut/"
    driver.get(tax_url)

    try:
        TAX_AUTHORITY_COOKIE()

        for iframe in driver.find_elements(By.TAG_NAME, 'iframe'):
            driver.switch_to.frame(iframe)
            try:
                time.sleep(1)
                reg_field = driver.find_element(By.CSS_SELECTOR, "#Regnummer")
                logging.info("inputting regno into site...")
                reg_field.send_keys(regno)
                reg_field.send_keys(Keys.RETURN)
                break
            except Exception as e:
                logging.info("Element not found in this iframe, continuing to next iframe: %s", e)
                driver.switch_to.default_content()

        driver.switch_to.default_content()

        print("Pressing next button...")
        time.sleep(1) 
        #FIX specify which iframe the button is in. 
        for iframe in driver.find_elements(By.TAG_NAME, 'iframe'):
            driver.switch_to.frame(iframe)
            try:
                next_button = driver.find_element(By.CSS_SELECTOR, "button.button[type='button']")
                driver.execute_script("arguments[0].scrollIntoView(true);", next_button)
                time.sleep(1)
                
                #due to errors in clicking button regularly i opted for this approach, should probably be revised later
                for _ in range(5):
                    driver.execute_script("arguments[0].click();", next_button)
                    time.sleep(1)
                    if "Ut av landet" in driver.page_source:
                        logging.info("Next section loaded successfully.")
                        break
                    else:
                        logging.info("Next section did not load. Retrying click.")
                break
            except Exception as e:
                logging.info("Element not found in this iframe, continuing to next iframe: %s", e)
                driver.switch_to.default_content()

        driver.switch_to.default_content()


        print("Attempting to input the export date...")
        time.sleep(1) 
        #switch to the same iframe to find the date input field
        driver.switch_to.frame(driver.find_element(By.CSS_SELECTOR, "iframe#iFrameResizer0"))
        try:
            time.sleep(1)  
            date_input = driver.find_element(By.CSS_SELECTOR, "input.form-control.input[placeholder='dd.mm.åååå'][type='text']")
            logging.info("Inputting export date into site...")
            
            driver.execute_script("arguments[0].scrollIntoView(true);", date_input)
            time.sleep(1)
            date_input.click()
            date_input.clear()
            date_input.send_keys("10.10.2024")
            date_input.send_keys(Keys.RETURN)
        except Exception as e:
            logging.error("Date input field not found: %s", e)
            driver.switch_to.default_content()
            return

        driver.switch_to.default_content()

        print("pressing seocnd next button...")

        driver.switch_to.frame(driver.find_element(By.CSS_SELECTOR, "iframe#iFrameResizer0"))
        second_next_button = driver.find_element(By.CSS_SELECTOR, "button.button[type='button']")
                
        driver.execute_script("arguments[0].scrollIntoView(true);", second_next_button)
        time.sleep(1)
                
                #due to errors in clicking button regularly i opted for this approach, should probably be revised later
        for _ in range(5):
            driver.execute_script("arguments[0].click();", second_next_button)
            time.sleep(1)  
            if "Regn ut" in driver.page_source:
                logging.info("Next section loaded successfully.")
                break
            else:
                logging.info("Next section did not load. Retrying click.")
                break
        driver.switch_to.default_content()

        print("pressing calculate button...")
        driver.switch_to.frame(driver.find_element(By.CSS_SELECTOR, "iframe#iFrameResizer0"))
        calculate_button = driver.find_element(By.CSS_SELECTOR, "button.button[type='button']")
                
        driver.execute_script("arguments[0].scrollIntoView(true);", calculate_button)
        time.sleep(1)
                
                #due to errors in clicking button regularly i opted for this approach, should probably be revised later
        for _ in range(5):
            driver.execute_script("arguments[0].click();", calculate_button)
            time.sleep(1)
            if "Beregnet refusjon av engangsavgift på oppgitt utførselstidspunkt" in driver.page_source:
                logging.info("Next section loaded successfully.")
                break
            else:
                logging.info("Next section did not load. Retrying click.")
                break
        driver.switch_to.default_content()

        time.sleep(1)  #grabbing tax return from site and formatting it
        driver.switch_to.frame(driver.find_element(By.CSS_SELECTOR, "iframe#iFrameResizer0"))
        tax_return_element = driver.find_element(By.CSS_SELECTOR, '#app-root > div > div > div.wiz-result2.is-success > div > div:nth-child(2) > div:nth-child(2) > div.calculation-red > div > div > div:nth-child(2)')
        tax_return = tax_return_element.text.strip()
        tax_return = tax_return.replace(" kroner", "")
        tax_return = tax_return.replace(",",".")
        tax_return = tax_return.replace(" ","")
        print(f"{regno}: tax return: {int(float(tax_return))}")
        return int(float(tax_return))

    except Exception as e:
        logging.error("Failed to fetch tax-return for %s: %s", regno, e)
        return None

def normalize_name(name):
    name = re.sub(r'(?i)\b(4matic|masse|utstyr|eu|ny|kontroll|service|oljeskift|cdi|tdi|dci|mpi|gdi|tdci|tfsi|tsi|td|cd|thp|blueefficiency|novi|model|triptonic|stanje|top|gtd|god|2008|2009|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|quattro|facelift|mercedes|benz|motion|tek|uvezana|uvoz|limited|edition|luxury|premium|base|sport|advanced|line|drive|paket|paket|edition|automatic|manual|diesel|sedan|hatchback|coupe|convertible|wagon|suv|compact|electric|hybrid|awd|fwd|rwd|l|xl|xxl|plus|pro|classic|comfort|executive|elegance|exclusive|design|performance|dynamic|style|active|emotion|innovation|limited|classic|supreme|highline|comfortline|trendline|elite|cosmo|prestige|allroad|cross|drive|line|connect|base|executive|essential|value|p|performance|track|trail|sportback|touring|all4|countryman|clubman|john|cooper|works|crosstrek|outback|forester|brz|wrx|sti|limited|touring|premium|black|edition|signature|select|preferred|standard|touring|cx|forester|sport|special|series|2dr|4dr|5dr|7dr|12dr|15dr|21dr|23dr|32dr|40dr|45dr|5seater|7seater|compact|mpv|minivan|roadster|crossover|gtline|cabrio|cabriolet|estate|estate|saloon|super|base|lifestyle|lux|xdrive|xdrive20d|d|rline|spaceback|vision|entry|entryline|life|light|ultimate|evo|ambiente|sve|sve|emotion|dynamic|action|line|tek|tronic|select|stand|entry|vtx|ls|dl|sx|hx|xe|xt|kt|xt|tm|hk|tl|luxe|intense|shine|pure|prestige|legend|premium|premium|supreme|gt|sline|audi|bmw|volkswagen|vw|peugeot|opel|mazda|mitsubishi|toyota|honda|kia|hyundai|nissan|seat|skoda|volvo|renault|suzuki|mini|subaru|chrysler|dodge|jeep|ram|chevrolet|ford|gmc|lincoln|buick|cadillac|lexus|infiniti|acura|jaguar|land|rover|alfa|romeo|fiat|maserati|ferrari|lamborghini|porsche|bugatti|aston|martin|bentley|rolls|royce|polestar|tesla|lucid|rivian|bollinger|canoo|byton|faraday|future|karma|nikola|nobe|regen|gordon|murray|automotive|hendrickson|hewes|hill|hino|hisun|honda|husqvarna|indian|infiniti|ironhorse|isuzu|jaguar|jeep|jensen|john|deere|karma|kia|lancia|land|rover|lincoln|lotus|lucid|mclaren|maserati|mazda|mercedes|mg|mini|mitsubishi|morgan|nimble|nissan|peugeot|pontiac|porsche|ram|renault|rolls|royce|saab|saturn|scion|seat|skoda|smart|ssangyong|subaru|suzuki|tesla|toyota|triumph|vauxhall|volkswagen|volvo|smart|uaz|ura|vespa|vortex|volkswagen|westfield|yamaha|yellow|zastava|zaz|zins|zundapp|zundapp|)\b', '', name)

    name = re.sub(r'\W+', ' ', name)
    name = re.sub(r'\b\d+hk\b', '', name, flags=re.IGNORECASE)
    return ' '.join(sorted(name.lower().split()))


#fetching data directly from file
def fetch_finn_data():
    json_file_path = 'data/MERCEDES_SEARCH.json'
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
def fetch_olx_data(max_pages=50):
    olx_url = 'https://olx.ba/api/search'
    params = {
            'attr': '3228323030382d393939393939293a372844697a656c29',
            'attr_encoded': '1',
            'category_id': '18',
            'brand': '56',
            'models': '0',
            'brands': '56',
            'page': 1,
            'per_page': 175
        }
    
    olx_data = []
    
    while params['page'] <= max_pages:
        try:
            response = requests.get(olx_url, params=params)
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

#car matching logic
def match_car(finn_car, olx_car):
    finn_name = normalize_name(finn_car.get('heading', ''))
    olx_name = normalize_name(olx_car.get('title', ''))
    if finn_name in olx_name or olx_name in finn_name:
        finn_year = finn_car.get('year', 0)
        olx_year = olx_car.get('special_labels', [])
        olx_year = next((int(label.get('value')) for label in olx_year if label.get('label') == 'Godište'), 0)
        return abs(finn_year - olx_year) <= 1
    return False

def pair_car_data(finn_data, olx_data):
    car_pairs = {}

    if not isinstance(finn_data, list) or not isinstance(olx_data, list):
        logging.error("Error: Expected list format for API data")
        return car_pairs

    for car in finn_data:
        car_name = normalize_name(car.get('heading', ''))
        car_price = car.get('price', {}).get('amount')
        car_link = car.get('canonical_url', '')
        car_year = car.get('year', 0)
        car_original_name = car.get('heading', '')
        car_image_url = car.get('image', {}).get('url', '')
        car_regno = car.get('regno', '')
        if car_name and car_price is not None:
            if car_name not in car_pairs:
                car_pairs[car_name] = {
                    'finn_price': car_price,
                    'olx_prices': [],
                    'year': car_year,
                    'link': car_link,
                    'original_name': car_original_name,
                    'image_url': car_image_url,
                    'regno': car_regno,
                    'olx_ids': [],
                }

    for car in olx_data:
        if isinstance(car, dict):
            olx_name = normalize_name(car.get('title', ''))
            olx_price = car.get('price')
            olx_id = car.get('id')

            if olx_name and olx_price is not None:
                for finn_name, data in car_pairs.items():
                    if match_car({'heading': finn_name, 'year': data['year']}, car):
                        car_pairs[finn_name]['olx_prices'].append(olx_price)
                        car_pairs[finn_name]['olx_ids'].append(olx_id)
                        break

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
        original_name = data['original_name']
        image_url = data['image_url']
        regno = data['regno']
        olx_ids = data['olx_ids']

        #creating json entry for each car
        car_entry = {
            'car_name': original_name,
            'normalized_name': car_name,
            'year': year,
            'finn_price': finn_price,
            'finn_link': link,
            'image_url': image_url,
            'regno': regno,
            'olx_prices': olx_prices,
            'olx_ids' : olx_ids,
        }
        olx_finn_output.append(car_entry)

for car in olx_finn_output:
    if car['year'] >= 2015 and car.get('regno'):
            registration_number = car['regno'] 
            tax_return = fetch_tax_return(registration_number)
            car['tax_return'] = tax_return
    
    else:
        car['tax_return'] = None

with open('data/=OLX_MERCEDES.json', 'w', encoding='utf-8') as json_file:
    json.dump(olx_finn_output, json_file, ensure_ascii=False, indent=4)