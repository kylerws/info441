// get specific team

const getSpecificTeamHandler = async (req, res, { Team }) => {
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const user = {id: 3, email: 'user3'}

    // const user = JSON.parse(req.get('X-User'));
    const userID = user['id']
    const teamID = req.params.teamID
    const team = await Team.findOne({_id: teamID, "members.id": userID});

    // res.send(team)
    if (team == null ) {
        res.status(404).send('We did not find a team with provided name that you are a part of')
        return;
    }
    const schedule = team['schedule']
    // const availableDays = schedule.filter(d => d.hasAvailability == true)

    res.setHeader("Content-Type", "application/json");
    // res.status(200).send(availableDays)
    res.status(200).send(schedule)

}


// reference for sorting the times
// const messages = await Message.find({"channelID": channelID}).sort({"createdAt":-1}).limit(100);
module.exports = {getSpecificTeamHandler};
