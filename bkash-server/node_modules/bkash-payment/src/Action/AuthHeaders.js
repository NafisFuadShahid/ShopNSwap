const grantToken = require("./GrantToken")

const authHeaders = async (bkashConfig) => {  
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    authorization: await grantToken(bkashConfig),
    "x-app-key": bkashConfig?.app_key,
  }
}

module.exports = authHeaders
