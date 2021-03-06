// POST: handle creating new teams

// ALSO INITIALIZE TEAM SCHEDULE TO BE EQUAL TO CREATOR SCHEDULE
const postTeamHandler = async (req, res, { Team, UserSchedule }) => {
    console.log("REQUEST: postTeamHandler called")
    if (!req.get("X-User")) {
        res.setHeader("Content-Type", "text/plain")
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    console.log(user)

    const { name, description } = req.body;

    if (!name || !description) {
        res.setHeader("Content-Type", "text/plain")
        res.status(400).send("Must provide team name and description");
        return;
    }

    const teamExists = await Team.find({"name": name})
    if (teamExists.length > 0) {
        res.setHeader("Content-Type", "text/plain")
        res.status(409).send('team already created with that name')
        return;
    }

    const createdAt = new Date();
    const creatorSchedule = await UserSchedule.find({"userID": user.id})

    if (creatorSchedule.length == 0) {
        res.setHeader("Content-Type", "text/plain")
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

    const firstday = creatorSchedule[0]
    const team = {
        "name": name,
        "description": description,
        "members": [user],
        "schedule": teamSchedule,
        "createdAt": createdAt,
        "creator": user
    };



    const query = new Team(team);
    query.save((err, newTeam) => {
        if (err) {
            res.setHeader("Content-Type", "text/plain")
            res.status(500).send('unable to create channel' + err);
            return;
        }

        res.setHeader("Content-Type", "application/json");
        res.status(201).json(newTeam);
        return;
    });
};

// GET: handle getting teams that the curren user is a part of

const getTeamsHandler = async (req, res, { Team }) => {
    console.log("REQUEST: getTeamsHandler called")
    if (!req.get("X-User")) {
        res.setHeader("Content-Type", "text/plain")
        res.status(401).send('User not authorized');
        return;
    }
    const userID = JSON.parse(req.get('X-User')).id

    const teams = await Team.find({'members.id': userID})
    if(teams.length == 0) {
        res.setHeader("Content-Type", "text/plain")
        res.status(404).send('User is not member of any team')
        return
    }

    var teamData = teams.map(team => {
        return { id: team._id, teamName: team.name, desc: team.description }
    })

    res.setHeader("Content-Type", "application/json")
    res.status(200).json(teamData)
}

module.exports = { postTeamHandler, getTeamsHandler }