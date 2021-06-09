
exports.up = function(knex) {
    return knex.schema.createTable('user', (table) => {
        table.increments('id');
        table.string('name').notNullable();
        table.string('password').notNullable();
        table.string('email').notNullable().unique();
        table.timestamps(true, true);
    }).createTable('expense', (table) => {
        table.increments();
        table.integer('userId').notNullable().references('id').inTable('user');
        table.integer('amount').notNullable();
        table.string('category');
        table.string('description');
        table.timestamps(true, true);
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user').dropTableIfExists('expense');
  };
  