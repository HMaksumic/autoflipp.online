# autoflipp.online - demo

*[autoflipp.online](https://autoflipp.onrender.com/)* was designed to identify profitable export opportunities for diesel cars. As Western countries, like Norway, phase out diesel vehicles, the used car market for them shrinks, driving prices down. The app compares cheap diesel cars in Norway that no one wants to buy, with the same car models in Bosnia where they are attractive on the market and go for higher prices. Certain cars were eligable for a government tax refund on export which made exporting the car even more profitable.

**The website was created back in 2024 in the context of these news articles and actually had some active users:**

https://www.nrk.no/norge/europa-tommer-norge-for-bruktbiler-1.16481958

https://www.nrk.no/norge/sendte-40.000-bruktbiler-ut-av-landet-i-fjor-1.16723250

**The data currently shown on the website was the last data the flask server scraped that I had a backup for. The backend webservice is currently suspended.**

## Quick rundown

**Frontend:** React.js, Vite, HTML, CSS

**Backend:** [server.py](flask-server/server.py), This file contains the main server logic for the Flask application.

Search files use Selenium to scrape data from the website finn.no.
Matching Files (`=OLX_{brand}.py`) match the scraped data against cars from the `olx.ba/api/search` API.

Upon matching cars, those that are appropriate will run the `TAX_RETURN` script to fetch the tax return for that car from the Norwegian tax authority, [Skatteetaten](https://www.skatteetaten.no/person/avgifter/bil/eksportere/regn-ut/) by inputting the registration number of the car.

## Hosting Information

The backend webservice was hosted on [Amazon Web Services](https://aws.amazon.com/), using EC2, Nginx, Gunicorn and was SSL certified.
Searching and matching scripts used to be run automatically from 00:00 - 02:00 daily to ensure that the app was up to date

## API Endpoints

For detailed information about the API endpoints, refer to the [API Endpoints Overview](flask-server/README.md).
