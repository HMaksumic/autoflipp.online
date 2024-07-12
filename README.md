# autoflipp.online

*[autoflipp.online](https://autoflipp.online/)* is designed to identify export opportunities for diesel cars. As Western countries phase out diesel vehicles, the used market for these cars shrinks, leading to lower prices. This website helps users find undervalued diesel cars, presenting an opportunity to buy and export them to markets where they fetch higher prices.

## Usage

Open your browser and navigate to *[autoflipp.online/home](https://autoflipp.online/home)* to access the interface. From there, you can register and sign in using your account to access personalized features, or browse cars without logging in. The platform allows you to search for cars using various filters and parameters. Once you identify a potential export opportunity, you can save the car ad for future reference if logged in. The backend handles user authentication and data storage, ensuring your saved searches and preferences are securely managed.

- Simplifies the process of finding undervalued cars.
- Highlights lucrative export opportunities.
- User authentication and data storage

## Technologies Used

### Frontend
  * **React.js + Vite**
  *  **React Router**
  *  **HTML**
  *  **CSS**

### Backend

#### `server.py`

* **Description**: This file contains the main server logic for the Flask application.
* **Tools Used**:
    * **Flask**: Used as the web development framework
    * **Flask-JWT-Extended**: Used for handling JSON Web Tokens (JWT) for user authentication.
    * **Flask-Migrate**: Manages database migrations for SQLAlchemy models.
    * **SQLAlchemy**: An ORM that provides a flexible SQL toolkit for Python.
    * **Werkzeug Security**: Provides functions to hash and check passwords securely.

#### Search Files (`_AUDI_SEARCH.py`, `_BMW_SEARCH.py`, `_MERCEDES_SEARCH.py`, `_OTHER_SEARCH.py`, `_PEUGEOT_SEARCH.py`, `_VOLVO_SEARCH.py`, `_VW_SEARCH.py`)

* **Description**: These files use Selenium to scrape data from the website `finn.no`.
* **Tools Used**:
    * **Selenium**: A web automation tool used to programmatically interact with web pages.

#### Matching Files (`=OLX_AUDI.py`, `=OLX_BMW.py`, `=OLX_MERCEDES.py`, `=OLX_OTHER.py`, `=OLX_PEUGEOT.py`, `=OLX_VOLVO.py`, `=OLX_VW.py`)

* **Description**: These files match the scraped data against cars from the `OLX.ba/api/search` API.
* **Tools Used**:
    * **Requests**: To make HTTP requests to the `OLX.ba` API and retrieve data for matching.
* **Additional Functionality**: Upon matching cars, those that are appropriate will run the `TAX_RETURN` script to fetch the tax return for that car from the Norwegian tax authority, [Skatteetaten](https://www.skatteetaten.no/person/avgifter/bil/eksportere/regn-ut/) by inputting the registration number of the car, also using Selenium.

## Hosting Information

The backend webservice is hosted on [Amazon Web Services](https://aws.amazon.com/), leveraging the following components:

- **Amazon EC2**: The application is deployed on an EC2 instance.
- **Nginx**: Nginx is used as a reverse proxy server to handle incoming requests and route them to the Gunicorn server.
- **Gunicorn**: Gunicorn is a Python WSGI HTTP Server for UNIX, serving the Flask application.
- **SSL Certified**: This web service is SSL certified using Let's Encrypt and Certbot.

Searching and matching scripts are run automatically from 00:00 - 02:00 daily to ensure that the app is up to date

## API Endpoints

For detailed information about the API endpoints, refer to the [API Endpoints Overview](flask-server/README.md).