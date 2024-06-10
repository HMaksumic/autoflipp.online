from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from autoscraper import AutoScraper
import time

# Setting up Selenium WebDriver options
options = webdriver.ChromeOptions()
options.add_argument('--headless')  # Run Chrome in headless mode (without GUI)
options.add_argument('--start-maximized')  # Maximize window size to avoid elements being out of the viewport
options.add_argument('--disable-infobars')
options.add_argument('--disable-extensions')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

# Correctly initializing the Chrome driver
driver = webdriver.Chrome(options)


# Navigate to the URL
url = "https://www.prisjakt.no/search?search=iphone"
driver.get(url)

# Wait for JavaScript to load and execute
time.sleep(5)  # Adjust timing based on network speed and site specifics

# Get the page source after JavaScript execution
webpage_content = driver.page_source

# Close the driver
driver.quit()

# Now use AutoScraper
wanted_list = ["4990,-", "New Apple iPhone 11 (128GB)"]
scraper = AutoScraper()
result = scraper.build(html=webpage_content, wanted_list=wanted_list)
print("Building Result:", result)

similar_result = scraper.get_result_similar(html=webpage_content, grouped=True)
print("Similar Result:", similar_result)

#scraper.set_rule_aliases({'rule_hii5' : 'Title', 'rule_ibzk' : 'Price'})
#scraper.keep_rules(['rule_hii5', 'rule_ibzk'])
#scraper.save('amazon-search')

