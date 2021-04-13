const Schema = require('mongoose').Schema;

const teamSchema = new Schema({
    name: {type: String, required: true, unique: true},
    description: String,
    members: {type: [{id: Number, email: String}]},
    schedule: {type: [{day: String, startTime: Date, endTime: Date, hasAvailability: Boolean}]},
    createdAt: {type: Date, required: true, unique: false},
    creator: {type: {id: Number, email: String}},
    editedAt: Date
});

const userScheduleSchema = new Schema({
    userID: {type: Number, required: true, unique: true},
    userEmail: {type: String, required: true, unique: true},
    schedule: {type: [{day: String, startTime: Date, endTime: Date}]}
    // createdAt: {type: Date, required: true, unique: false},
    // editedAt: Date
})

module.exports = {teamSchema, userScheduleSchema};
