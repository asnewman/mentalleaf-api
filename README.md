# mentalleaf-api
![Node.js CI](https://github.com/asnewman/mentalleaf-api/workflows/Node.js%20CI/badge.svg)

API for the open source MentalLeaf web app.
## Running locally
1. `yarn`
1. Run mongodb locally or create a free instance on [https://mongodb.com](https://mongodb.com)
1. Create a `.dotenv` file and add/fill the following properties
    * `MONGO_URI=<your mongodb uri>`
    * `ACCESS_TOKEN_SECRET=<generate with require('crypto').randomBytes(64).toString('hex')>`
    * `REFRESH_TOKEN_SECRET=<generate with require('crypto').randomBytes(64).toString('hex')>`
1. `yarn start`
