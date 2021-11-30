module.exports = {
  secret: process.env.SECRET,
  mongodb: {
    uri: process.env.MONGO_HOST.replace("<username>", process.env.MONGO_USER)
      .replace("<password>", process.env.MONGO_PASSWORD)
      .replace("<db_name>", process.env.MONGO_DB_NAME),
  },
  GOOGLE_APPLICATION_CREDENTIALS:
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
};
