import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time


options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--start-maximized')
options.add_argument('--disable-infobars')
options.add_argument('--disable-extensions')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service = Service(executable_path="chromedriver.exe")
driver = webdriver.Chrome(service=service, options=options)

base_url = "https://www.finn.no/car/used/search.html?dealer_segment=3&fuel=2&make=0.817&price_to=200000&sales_form=1&year_from=2010&page="

all_data = []

def accept_cookies():
    button_clicked = False
    try:
        #looping through all iframes and attempt to find and click the button
        for iframe in driver.find_elements(By.TAG_NAME, 'iframe'):
            driver.switch_to.frame(iframe)
            try:
                wait = WebDriverWait(driver, 10)
                cookie_button = wait.until(EC.element_to_be_clickable((By.XPATH, '//button[@title="Godta alle"]')))
                driver.execute_script("arguments[0].click();", cookie_button)
                print("Cookie consent has been accepted.")
                button_clicked = True
                break
            except Exception as e:
                print("Button not found in this iframe, continuing to next iframe:", e)
            finally:
                driver.switch_to.default_content()

        if not button_clicked:
            print("Could not find the 'Godta alle' button in any iframe.")
    except Exception as e:
        print("Error during the process:", e)

def fetch_and_process_page(url):
    driver.get(url)

    time.sleep(3) 
    webpage_content = driver.page_source

    soup = BeautifulSoup(webpage_content, 'html.parser')

    script_tag = soup.find('script', id='__NEXT_DATA__')
    if script_tag:
        try:
            json_data = json.loads(script_tag.string)
            remove_filler(json_data)
            return json_data
        except json.JSONDecodeError as e:
            print("Error decoding JSON:", e)
    else:
        print("No JSON data found in the script tag")
    return None


def remove_filler(data):
    if isinstance(data, dict):
        for key in ["filters", "appGip", "assetPrefix", "buildId", "customServer", "gssp", "isFallback", "page", "runtimeConfig"]:
            if key in data:
                del data[key]
        for key in data:
            remove_filler(data[key])
    elif isinstance(data, list):
        for item in data:
            remove_filler(item)

#number of finn pages to fetch
total_pages = 12

#fetching data from the first page
url = base_url + str(1)
driver.get(url)
accept_cookies()
data = fetch_and_process_page(url)
if data:
    all_data.extend(data['props']['pageProps']['search'].get('docs', []))

#fetching data from the remaining pages
for page in range(2, total_pages + 1):
    url = base_url + str(page)
    data = fetch_and_process_page(url)
    if data:
        all_data.extend(data['props']['pageProps']['search'].get('docs', []))


#saving the collected data to JSON file.
with open('data/VW_SEARCH.json', 'w', encoding='utf-8') as json_file:
    json.dump(all_data, json_file, indent=4)

print(f"Data from {total_pages} pages saved to 'VW_SEARCH.json'")

driver.quit()

import datetime
with open('__LOG__.txt', 'a', encoding='utf-8') as file:
    file.write(f"{datetime.datetime.now()} - _VW_SEARCH.py ran\n")