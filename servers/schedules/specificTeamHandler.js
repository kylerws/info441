// get specific team

const getSpecificTeamHandler = async (req, res, { Team }) => {
    const teamID = req.params.teamID
    const team = await Team.find({_id: teamID});


    // res.send(team)
    if (team == null ) {
        res.send('team not found')
        return;
    }
    res.setHeader("Content-Type", "application/json");
    res.send(team)
}


// reference for sorting the times
// const messages = await Message.find({"channelID": channelID}).sort({"createdAt":-1}).limit(100);
module.exports = {getSpecificTeamHandler};
