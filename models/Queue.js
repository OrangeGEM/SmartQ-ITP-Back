const {Schema, model, Types} = require('mongoose');

const locale = 'en';
const today = new Date();
    
const month = today.toLocaleDateString(locale, { month: "short" })
const day = today.toLocaleDateString(locale, { day: "numeric" })
const year = today.toLocaleDateString(locale, { year: "numeric" })

const QueueSchema = new Schema({
    "user_id" : { type: String, required: true },
    "title" : { type: String },
    "keyword" : { type: String, required: true },
    "description" : { type: String },
    "date" : { type: String, default: `${month}. ${day} ${year}`},
    "wrap" : { type: Boolean, default: false },     
    "units" : [],
    "ticketNum" : { type: Number }
})

module.exports = model( 'Queue', QueueSchema );