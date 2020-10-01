# mentalleaf-api
![Node.js CI](https://github.com/asnewman/mentalleaf-api/workflows/Node.js%20CI/badge.svg)

API for the open source MentalLeaf web app.
## Running locally
1. `yarn`
1. Run mongodb locally or create a free instance on [https://mongodb.com](https://mongodb.com)
1. Create a `.env` file and add/fill the following properties
    * `MONGO_URI=<your mongodb uri>`
    * `ACCESS_TOKEN_SECRET=<generate with require('crypto').randomBytes(64).toString('hex')>`
    * `REFRESH_TOKEN_SECRET=<generate with require('crypto').randomBytes(64).toString('hex')>`
    * `RUN_ENVIRONMENT=dev`
1. If you want emailing to users to work add the following fields to the `.env`
    * `EMAIL_HOST=<your email's host server address>`
    * `EMAIL_PORT=<your email's port>`
    * `EMAIL_USER=<your email's user name>`
    * `EMAIL_PASS=<your email's password>`
    * `EMAIL_ADDRESS=<your email address>`

1. `yarn start`
