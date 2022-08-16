const dotenv = require('dotenv');
dotenv.config(); // connecting to .env

module.exports = {
    REACT_APP_ALCHEMY_API_URL: process.env.REACT_APP_ALCHEMY_API_URL,
    REACT_APP_PRIVATE_KEY: process.env.REACT_APP_PRIVATE_KEY,
    REACT_APP_PINATA_KEY: process.env.REACT_APP_PINATA_KEY,
    REACT_APP_PINATA_SECRET: process.env.REACT_APP_PINATA_SECRET,
    REACT_APP_PINATA_JWT: process.env.REACT_APP_PINATA_JWT
}