import requests
import schedule
import time
'''
this module is for the purpose of keeping the backend running as i only have a free instance that spins down if inactive
this does not currently break TOS of the hosting service i use
'''

def send_request():
    try:
        response = requests.get("https://backend-server-hcvn.onrender.com/api/olx_peugeot")
        response.raise_for_status() 
        print(f"Response Status Code: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

schedule.every(14).minutes.do(send_request)

while True:
    schedule.run_pending()
    time.sleep(1)