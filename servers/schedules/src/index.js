
const mongoose = require('mongoose')
const express = require('express')
const { teamSchema, userScheduleSchema } = require('./schemas')

const { postTeamHandler } = require("./teamsHandler")
const { postMembersHandler, getMembersHandler } = require("./teamMembersHandler")
const { postUserScheduleHandler, getUserScheduleHandler } = require("./scheduleHandler")

// Create mongo endpoint
const mongoEndpoint = process.env.MONGOADDR
const port = process.env.PORT

// Connect to mongodb
const connect = () => {
    mongoose.connect(mongoEndpoint);
}

// const mongoEndpoint = "mongodb://localhost:27017/test"
// const port = 4000


// Create the model
const Team = mongoose.model("Team", teamSchema)
const UserSchedule = mongoose.model("UserSchedule", userScheduleSchema)

// const Message = mongoose.model("Schedule", scheduleSchema)

// Start express
const app = express();
app.use(express.json());

connect();

const RequestWrapper = (handler, SchemeAndDbForwarder) => {
    return (req, res) => {
        handler(req, res, SchemeAndDbForwarder);
    }
};

// on frist connect, main will be called and the app will start
mongoose.connection.on('error', console.error)
    .on('disconnected', connect)
    .once('open', main);

app.post("/v1/teams", RequestWrapper(postTeamHandler, { Team, UserSchedule }));
// app.post("/v1/teams/:teamID/members", RequestWrapper(postMembersHandler, { Team, UserSchedule }));
// app.get("/v1/teams/:teamID/members", RequestWrapper(getMembersHandler, { Team }));
// app.post("/v1/schedule/", RequestWrapper(postUserScheduleHandler, { UserSchedule }));
// app.get("/v1/schedule/", RequestWrapper(getUserScheduleHandler, { UserSchedule }));



async function main() {
    app.listen(port, () => {
        console.log(`server listening ${port}`);
    })
};