var mongoose = require('mongoose');
var Schema = mongoose.Schema;
console.log(mongoose.connection.readyState);

contactSchema = new Schema( {
	name: String,
	number: String,
	company: String,
	user_id: Schema.ObjectId,
	is_delete: { type: Boolean, default: false },
	date : { type : Date, default: Date.now }
}),
contact = mongoose.model('contact', contactSchema);

module.exports = contact;