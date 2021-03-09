const Schema = require('mongoose').Schema;

const teamSchema = new Schema({
    // id: {type: Schema.Types.ObjectId, required: true, unique: true, auto = true},
    name: {type: String, required: true, unique: true},
    description: String,
    private: {type: Boolean, required: true, unique: false},
    members: {type: [{id: Number, email: String}]},
    createdAt: {type: Date, required: true, unique: false},
    creator: {type: {id: Number, email: String}},
    editedAt: Date
});

const userScheduleSchema = new Schema({
    // id: {type: Schema.Types.ObjectId, required: true, unique: true},
    userID: {type: {id: Number, email: String}},
    day: {type: String, required: true, unique: false},
    startTime: {type: Date, required: true, unique: false},
    endTime: {type: Date, required: true, unique: false},
    // createdAt: {type: Date, required: true, unique: false},
    // editedAt: Date
})

const teamScheduleSchema = new Schema({
    teamID: {type: String, required: true, unique: true},
    day: {type: String, required: true, unique: false},
    startTime: {type: [{userId: String, time: Date}]},
    endTime: {type: [{userId: String, time: Date}]}
})


module.exports = {teamSchema, userScheduleSchema, teamScheduleSchema};