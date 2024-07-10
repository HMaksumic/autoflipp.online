from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import logging
from datetime import datetime, timedelta
from webdriver_manager.chrome import ChromeDriverManager

current_date = datetime.now()
one_week_ahead = current_date + timedelta(weeks=1)
formatted_date = one_week_ahead.strftime("%d.%m.%Y")

options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--start-maximized')
options.add_argument('--disable-infobars')
options.add_argument('--disable-extensions')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service = Service(ChromeDriverManager().install())
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
            date_input.send_keys(formatted_date)
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
