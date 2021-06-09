// Update with your config settings.
const {knexSnakeCaseMappers} = require('objection'); 


module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'expense-tracker',
      user:     'postgres',
      password: 'Tan30062001',
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
