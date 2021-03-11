// POST: handle creating new teams

// ALSO INITIALIZE TEAM SCHEDULE TO BE EQUAL TO CREATOR SCHEDULE
const postTeamHandler = async (req, res, { Team, UserSchedule }) => {
    console.log("REQUEST: postTeam called")
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const user = {id: 1, email: 'user1'}
    const userID = user['id']
    const{ name, description } = req.body;

    if (!name) {
        res.status(400).send("Must provide team name");
        return;
    }

    const teamExists = await Team.find({"name": name})

    if (teamExists.length > 0) {
        res.status(409).send('team already created with that name')
        return;
    }

    const createdAt = new Date();
    const creatorSchedule = await UserSchedule.find({"userID": userID})

    if (creatorSchedule.length == 0) {
        res.status(401).send('Not authorized to create, please post availability first.')
        return;
    }

    const schedArray = creatorSchedule[0]['schedule']
    const teamSchedule = []
    for (i=0; i < schedArray.length; i++) {
        curr = schedArray[i]
        const specificDay = {
            "day": curr['day'],
            "startTime": curr['startTime'],
            "endTime": curr['endTime'],
            "hasAvailability": true
        }
        teamSchedule.push(specificDay)
    }

    // res.send(schedArray)
    // return;
    const firstday = creatorSchedule[0]
    const team = {
        "name": name,
        "description": description,
        // "private": private,
        "members": [user],
        "schedule": teamSchedule,
        "createdAt": createdAt,
        "creator": user
    };



    const query = new Team(team);
    query.save((err, newTeam) => {

        if (err) {
            res.status(500).send('unable to create channel' + err);
            return;
        }


        // newTeam['id'] == newTeam._id

        // res.send(newChannel._id)

        res.setHeader("Content-Type", "application/json");
        res.status(201).json(newTeam);
        return;
    });
};



const getTeamIdByName = async (req, res, { Team }) => {
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const user = {'id': 1, 'email': 'sdkjfh'}
    const { name } = req.body;
    const userID = user['id']
    const team = await Team.findOne({'name': name})
    console.log(!team)

    if(!team) {
        res.status(404).send('team not found with given name')
        return
    }

    // check to see if the user is a member of the team

    const isMember = await Team.findOne({'name': name, 'members.id': userID})
    if(!isMember) {
        res.status(404).send('You are not a member of this team')
        return
    }

    res.setHeader("Content-Type", "application/json");
    res.send(isMember._id)
}

module.exports = {postTeamHandler, getTeamIdByName}