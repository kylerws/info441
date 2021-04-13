
const mongoose = require('mongoose')
const express = require('express')
const {teamSchema, userScheduleSchema} = require('./schemas')

const { postTeamHandler, getTeamsHandler } = require("./teamsHandler")
const { postMembersHandler, getMembersHandler } = require("./teamMembersHandler")
const { postUserScheduleHandler, getUserScheduleHandler } = require("./scheduleHandler")
const { getSpecificTeamHandler } = require("./specificTeamHandler")

// Local testing mongo endpoints
// const mongoEndpoint = "mongodb://localhost:27017/test"
// const port = 4000

// Constants for mongo endpoint
const mongoEndpoint = process.env.MONGOADDR
const port = process.env.PORT

// Function connect opens the connection to mongo
const connect = () => {
    mongoose.connect(mongoEndpoint);
}

// Function RequestWrapper wraps handler functions to accept requests
const RequestWrapper = (handler, SchemeAndDbForwarder) => {
    return (req, res) => {
        handler(req, res, SchemeAndDbForwarder);
    }
};

// Returns HTTP status 405 (method not allowed) for all requests
const methodNotAllowed = (req, res, next) => res.status(405).send()

// Create the model
const Team = mongoose.model("Team", teamSchema)
const UserSchedule = mongoose.model("UserSchedule", userScheduleSchema)

// Start express
const app = express();
app.use(express.json());

// Open connection to mongo
connect();

// On disconnect, try to reconnect to mongo
mongoose.connection.on('error', console.error)
    .on('disconnected', connect)
    .once('open', main);

// Teams endpoint
app.route("/v1/teams")
    .post(RequestWrapper(postTeamHandler, { Team, UserSchedule }))
    .get(RequestWrapper(getTeamsHandler, { Team, UserSchedule }))
    .all(methodNotAllowed);

// Members endpoint
app.route("v1/teams/:teamID/members")
    .post(RequestWrapper(postMembersHandler, { Team, UserSchedule }))
    .get(RequestWrapper(getMembersHandler, { Team }))
    .all(methodNotAllowed);

// Schedule endpoint
app.route("/v1/schedule")
    .post(RequestWrapper(postUserScheduleHandler, { UserSchedule, Team }))
    .get(RequestWrapper(getUserScheduleHandler, { UserSchedule }))
    .all(methodNotAllowed);

// Specific team endpoint
app.route("/v1/teams/:teamID")
    .get(RequestWrapper(getSpecificTeamHandler, { Team }))
    .all(methodNotAllowed);

// Entrypoint for server
async function main() {
    app.listen(port, () => {
        console.log(`server listening ${port}`);
    })
};