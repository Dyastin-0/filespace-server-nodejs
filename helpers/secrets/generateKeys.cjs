const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const getSecret = require("./getSecret.cjs");

const envFilePath = path.join(__dirname, "../../.env");

const generateKeys = async () => {
  try {
    const accessKey = await getSecret("ACCESS_TOKEN_KEY");
    const refreshKey = await getSecret("REFRESH_TOKEN_KEY");
    const emailKey = await getSecret("EMAIL_TOKEN_KEY");
    const dbUrl = await getSecret("MONGODB_URI");
    const serverEmail = await getSecret("SERVER_EMAIL");
    const serverEmailPassword = await getSecret("SERVER_EMAIL_PASSWORD");
    const googleClientId = await getSecret("GOOGLE_CLIENT_ID");
    const googleClientSecret = await getSecret("GOOGLE_CLIENT_SECRET");

    const newVariables = [
      `MONGODB_URL=${dbUrl}`,
      `SERVER_EMAIL=${serverEmail}`,
      `SERVER_EMAIL_PASSWORD=${serverEmailPassword}`,
      `ACCESS_TOKEN_SECRET=${accessKey}`,
      `REFRESH_TOKEN_SECRET=${refreshKey}`,
      `EMAIL_TOKEN_SECRET=${emailKey}`,
      `BASE_CLIENT_URL=https://filespace.dyastin.tech`,
      "PORT=5004",
      "VERSION=v1",
      "NODE_ENV=production",
      "GCLOUD_PROJECT_ID=filespace-442811",
      "GOOGLE_APPLICATION_CREDENTIALS=./secretsaccesor.json",
      `GOOGLE_CLIENT_ID=${googleClientId}`,
      `GOOGLE_CLIENT_SECRET=${googleClientSecret}`,
    ];

    const fileContent = fs.readFileSync(envFilePath, { encoding: "utf8" });

    const lines = fileContent.split("\n");

    const firstLine = lines[0];
    const newContent = [firstLine, ...newVariables].join("\n") + "\n";

    fs.writeFileSync(envFilePath, newContent, { encoding: "utf8" });

    console.log(`Successfully updated secrets in ${envFilePath}.`);
  } catch (error) {
    console.error("Error generating keys or updating .env file:", error);
  }
};

generateKeys();
