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

base_url = "https://www.finn.no/car/used/search.html?dealer_segment=3&fuel=2&make=0.744&make=0.749&make=0.757&make=0.785&make=0.792&make=0.787&make=0.796&make=0.795&make=0.808&make=0.813&make=0.817&make=0.818&price_to=200000&sales_form=1&year_from=2015&page="

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

logging.basicConfig(level=logging.INFO)
def TAX_AUTHORITY_COOKIE():
    try:
        logging.info("Checking for cookie consent button...")
        time.sleep(2)
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
                time.sleep(2)
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
        time.sleep(2) 
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
                    time.sleep(2)
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
        time.sleep(2) 
        #switch to the same iframe to find the date input field
        driver.switch_to.frame(driver.find_element(By.CSS_SELECTOR, "iframe#iFrameResizer0"))
        try:
            time.sleep(2)  
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
            time.sleep(2)  
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
            time.sleep(2)
            if "Beregnet refusjon av engangsavgift på oppgitt utførselstidspunkt" in driver.page_source:
                logging.info("Next section loaded successfully.")
                break
            else:
                logging.info("Next section did not load. Retrying click.")
                break
        driver.switch_to.default_content()

        time.sleep(3)  #grabbing tax return from site and formatting it
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
total_pages = 7

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

for car in all_data:
    if car['year'] >= 2015 and car.get('regno'):
            registration_number = car['regno'] 
            tax_return = fetch_tax_return(registration_number)
            car['tax_return'] = tax_return

#saving the collected data to JSON file.
with open('finn_search_after2015.json', 'w', encoding='utf-8') as json_file:
    json.dump(all_data, json_file, indent=4)

print(f"Data from {total_pages} pages saved to 'finn_search_after2015.json'")

driver.quit()