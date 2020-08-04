module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://noteful_server@localhost/noteful',
    API_TOKEN: process.env.API_TOKEN || 'token',
  }