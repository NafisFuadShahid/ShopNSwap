const tokenParameters = (bkashConfig) => {
  return {
    app_key: bkashConfig?.app_key,
    app_secret: bkashConfig?.app_secret,
  }
}

module.exports = tokenParameters
