import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup


options = webdriver.ChromeOptions()
options.add_argument('--headless') 
options.add_argument('--start-maximized')
options.add_argument('--disable-infobars')
options.add_argument('--disable-extensions')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

service= Service(executable_path = "chromedriver.exe")
driver = webdriver.Chrome(service=service, options=options)

url = "https://www.finn.no/car/used/search.html?fuel=2&price_to=100000&sales_form=1"
driver.get(url)

#Clicking the "accept cookies button"
button_clicked = False
try:
    #loop through all iframes and attempt to find and click the button
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

webpage_content = driver.page_source
#print(webpage_content)

driver.quit()

#Saving webpage content to file
with open('webpage_content.html', 'w', encoding='utf-8') as file:
    file.write(webpage_content)

print("Webpage content saved to webpage_content.html")

soup = BeautifulSoup(webpage_content, 'html.parser')

def remove_filler(data):
    if isinstance(data, dict):

        for key in ["filters", "appGip", "assetPrefix", "buildId", "customServer", "gssp", "isFallback", "page","runtimeConfig"]:
            if key in data:
                del data[key]

        for key in data:
            remove_filler(data[key])
    elif isinstance(data, list):
        for item in data:
            remove_filler(item)

#Takes only wanted data from the HTML
script_tag = soup.find('script', id='__NEXT_DATA__')
if script_tag:
    try:
        json_data = json.loads(script_tag.string)
        #Saving JSON file
        with open('website_search.json', 'w', encoding='utf-8') as json_file:
            remove_filler(json_data)
            json.dump(json_data, json_file, indent=4)

        print("JSON data saved to website_search.json")

    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
else:
    print("No JSON data found in the script tag")
