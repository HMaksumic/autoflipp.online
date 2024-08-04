# API Endpoints Overview

### User Management
- **POST /register**: Registers a new user with a username and password.
- **POST /login**: Logs in a user and returns an access token.

### Token Handling
- **POST /decode-token**: Decodes a given JWT and returns its contents.

### Saving entries
- **GET /favorites**: Retrieves a list of favorite cars for the logged-in user.
- **POST /favorites**: Adds a car to the logged-in user's favorites.
- **DELETE /favorites/<int:car_id>**: Removes a car from the logged-in user's favorites.

### Car Data
- **GET /api/olx_other**: Retrieves car data from the "olx_finn_before2015.json" file.
- **GET /api/olx_audi**: Retrieves Audi car data from the "OLX_AUDI.json" file.
- **GET /api/olx_bmw**: Retrieves BMW car data from the "OLX_BMW.json" file.
- **GET /api/olx_mercedes**: Retrieves Mercedes car data from the "OLX_MERCEDES.json" file.
- **GET /api/olx_peugeot**: Retrieves Peugeot car data from the "OLX_PEUGEOT.json" file.
- **GET /api/olx_volvo**: Retrieves Volvo car data from the "OLX_VOLVO.json" file.
- **GET /api/olx_vw**: Retrieves Volkswagen car data from the "OLX_VW.json" file.
