const fs = require("fs");
const path = require("path");
const dontenv = require("dotenv").config();

const envFilePath = path.join(__dirname, "../../.env");
const tempFilePath = path.join(__dirname, "../../secretsaccesor.json");

fs.writeFileSync(tempFilePath, process.env.SECRETS_SERVICE_ACCOUNT);

fs.appendFileSync(
  envFilePath,
  "\nGOOGLE_APPLICATION_CREDENTIALS=./secretsaccesor.json\n",
  { encoding: "utf8" }
);
