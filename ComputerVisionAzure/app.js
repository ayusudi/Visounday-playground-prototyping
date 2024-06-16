const axios = require('axios');
const fs = require("fs")

require('dotenv').config();

const subscriptionKey = process.env.SUBSCRIPTION_KEY; // Replace with your subscription key
const endpoint = process.env.ENDPOINT; // Replace with your endpoint

const imageUrl = "URL IMAGE"
const apiVersion = '2024-02-01';

const headers = {
  'Ocp-Apim-Subscription-Key': subscriptionKey,
  'Content-Type': 'application/json'
};

const params = {
  features: 'caption,read',
  'model-version': 'latest',
  language: 'en',
  'api-version': apiVersion
};

const data = {
  url: imageUrl
};

axios.post(`${endpoint}/computervision/imageanalysis:analyze`, data, {
  headers: headers,
  params: params
})
  .then(response => {
    console.log('Response:', response.data);
    fs.writeFileSync("output.json", JSON.stringify(response.data, null, 2))
  })
  .catch(error => {
    console.error('Error:', error);
  });
