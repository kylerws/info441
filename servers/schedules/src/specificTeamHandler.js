var mongoose = require('mongoose');

const getSpecificTeamHandler = async (req, res, { Team }) => {
    console.log("REQUEST: getSpecificTeam called")
    if (!req.get("X-User")) {
        res.setHeader("Content-Type", "text/plain")
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    const userID = user['id']
    const teamID = req.params.teamID

    if(!teamID || teamID === '') {
        res.setHeader("Content-Type", "text/plain")
        res.status(400).send("Must send a team id")
        return
    }

    const team = await Team.findOne({_id: mongoose.Types.ObjectId(teamID), "members.id": userID});
    
    if (!team) {
        res.setHeader("Content-Type", "text/plain")
        res.status(404).send('We did not find a team with provided name that you are a part of')
        return;
    }
    const schedule = team['schedule']

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(schedule)
}


// reference for sorting the times
// const messages = await Message.find({"channelID": channelID}).sort({"createdAt":-1}).limit(100);
module.exports = { getSpecificTeamHandler };
