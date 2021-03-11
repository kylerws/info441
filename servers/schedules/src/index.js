
const mongoose = require('mongoose')
const express = require('express')
const {teamSchema, userScheduleSchema} = require('./schemas')

const { postTeamHandler, getTeamsHandler } = require("./teamsHandler")
const { postMembersHandler, getMembersHandler } = require("./teamMembersHandler")
const { postUserScheduleHandler, getUserScheduleHandler } = require("./scheduleHandler")
const { getSpecificTeamHandler } = require("./specificTeamHandler")

// create mongo endpoint, it will make the test database
// const mongoEndpoint = "mongodb://localhost:27017/test"
// const port = 4000

const mongoEndpoint = process.env.MONGOADDR
const port = process.env.PORT

// Create the model
const Team = mongoose.model("Team", teamSchema)
const UserSchedule = mongoose.model("UserSchedule", userScheduleSchema)

// Start express
const app = express();
app.use(express.json());

// Connect to mongodb
const connect = () => {
    mongoose.connect(mongoEndpoint);
}

// Wraps handlers to accept requests
const RequestWrapper = (handler, SchemeAndDbForwarder) => {
    return (req, res) => {
        handler(req, res, SchemeAndDbForwarder);
    }
};

// Open connection
connect();

// On first connect, main will be called and the app will start
mongoose.connection.on('error', console.error)
    .on('disconnected', connect)
    .once('open', main);

// Teams endpoint
app.route("/v1/teams")
    .post(RequestWrapper(postTeamHandler, { Team, UserSchedule }))
    .get(RequestWrapper(getTeamsHandler, { Team, UserSchedule }))

app.post("/v1/teams/:teamID/members", RequestWrapper(postMembersHandler, { Team, UserSchedule }));
app.get("/v1/teams/:teamID/members", RequestWrapper(getMembersHandler, { Team }));
app.post("/v1/schedule", RequestWrapper(postUserScheduleHandler, { UserSchedule }));
app.get("/v1/schedule", RequestWrapper(getUserScheduleHandler, { UserSchedule }));
app.get("/v1/teams/:teamID", RequestWrapper(getSpecificTeamHandler, { Team }));

async function main() {
    app.listen(port, () => {
        console.log(`server listening ${port}`);
    })
};