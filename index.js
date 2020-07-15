const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response) => {
  response.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
