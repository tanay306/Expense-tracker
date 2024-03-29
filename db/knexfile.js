// Update with your config settings.
const {knexSnakeCaseMappers} = require('objection'); 


module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: process.env.DB_NAME ,
      user:     process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    },
    ...knexSnakeCaseMappers
  },

};
