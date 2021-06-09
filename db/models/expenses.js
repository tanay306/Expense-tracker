const {Model} = require('objection');

class Expense extends Model {
    static get tableName() {
        return 'expense';
    }
    static get relationMappings() {
        const User = require('./users');
        return {
            channel: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'expense.userId',
                    to: 'user.id'
                }
            }
        }
    }
}

module.exports = Expense