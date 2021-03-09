const Schema = require('mongoose').Schema;

const teamSchema = new Schema({
    // id: {type: Schema.Types.ObjectId, required: true, unique: true, auto = true},
    name: {type: String, required: true, unique: true},
    description: String,
    private: {type: Boolean, required: true, unique: false},
    members: {type: [{id: Number, email: String}]},
    schedule: {type: [{day: String, startTime: Date, endTime: Date}]},
    createdAt: {type: Date, required: true, unique: false},
    creator: {type: {id: Number, email: String}},
    editedAt: Date
});

const userScheduleSchema = new Schema({
    // id: {type: Schema.Types.ObjectId, required: true, unique: true},
    userID: {type: {id: Number, email: String}},
    schedule: {type: [{day: String, startTime: Date, endTime: Date}]}
    // createdAt: {type: Date, required: true, unique: false},
    // editedAt: Date
})

module.exports = {teamSchema, userScheduleSchema};