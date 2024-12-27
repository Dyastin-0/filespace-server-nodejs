const dotenv = require("dotenv").config();

const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const name = `projects/filespace-442811/secrets/${secretName}/versions/1`;
  const [version] = await client.accessSecretVersion({
    name: name,
  });
  const payload = version.payload.data.toString("utf8");
  return payload;
}

module.exports = getSecret;
