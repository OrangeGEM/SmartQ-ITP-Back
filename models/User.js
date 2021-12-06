const {Schema, model, Types} = require('mongoose');

const UserSchema = new Schema({
    "email" : {type: String, required: true, unique: true},
    "password" : {type: String, required: true},
    "isActivated" : {type: Boolean, default: false },
    "activatedLink" : {type: String}
})

module.exports = model( 'User', UserSchema );