const tokenHeaders = (bkashConfig) => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    username: bkashConfig?.username,
    password: bkashConfig?.password,
  }
}

module.exports = tokenHeaders
