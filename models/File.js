const {Schema, model, Types, ObjectId} = require('mongoose');

const FileSchema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    accessLink: {type: String},
    size: {type: Number, default: 0},
    path: {type: String, default: ''},
    user: {type: ObjectId, ref: 'User'},
    memberId: {type: String},
    parent: {type: ObjectId, ref: 'File'},
    childs: [{type: ObjectId, ref: 'File'}],
})

module.exports = model( 'File', FileSchema );