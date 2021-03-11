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
    console.log("REQUEST: getTeamIdByName")
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const userID = JSON.parse(req.get('X-User')).id
    // console.log(userID)

    // check to see if the user is a member of the team
    const teams = await Team.find({'members.id': userID})
    if(teams.length == 0) {
        res.status(404).send('User is not member of any team')
        return
    }

    // console.log(teams)
    var teamData = teams.map(team => {
        return { id: team._id, teamName: team.name }
    })
    // console.log(teamData)

    res.setHeader("Content-Type", "application/json")
    res.status(200).json(teamData)
}

module.exports = {postTeamHandler, getTeamIdByName}


//// OLD GET ////

// console.log("REQUEST: getTeamIdByName")
//     if (!req.get("X-User")) {
//         res.status(401).send('User not authorized');
//         return;
//     }

//     const user = JSON.parse(req.get('X-User'));
//     const userID = user['id']

//     const name = req.params.name
//     console.log(name)
//     if (!name) {
//         res.status(400).send("No team name given")
//         return
//     }

//     const team = await Team.findOne({'name': name})
//     if (!team) {
//         res.status(404).send('team not found with given name')
//         return
//     }

//     // check to see if the user is a member of the team
//     const isMember = await Team.findOne({'name': name, 'members.id': userID})
//     if(!isMember) {
//         res.status(403).send('You are not a member of this team')
//         return
//     }

//     res.setHeader("Content-Type", "application/json")
//     res.status(200).send(isMember._id)