/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('leads', (table) => {
    table.increments('id').primary();
    table.integer('lead_number').notNullable().unique();
    table.string('lead_origin');
    table.string('lead_source');
    table.integer('total_visits');
    table.integer('time_spent_on_website');
    table.decimal('page_views_per_visit', 5, 2);
    table.string('last_activity');
    table.integer('conversion_score');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('leads');
};