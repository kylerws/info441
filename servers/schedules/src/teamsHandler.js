// POST: handle creating new teams

// ALSO INITIALIZE TEAM SCHEDULE TO BE EQUAL TO CREATOR SCHEDULE
const postTeamHandler = async (req, res, { Team, UserSchedule }) => {
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const user = {id: 1, email: 'mackenzie@msn.com'}
    const userID = user['id']
    const{ name, description, private } = req.body;

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
    // res.send(schedArray)
    // return;
    const firstday = creatorSchedule[0]
    const team = {
        "name": name,
        "description": description,
        "private": private,
        "members": [user],
        "schedule": schedArray,
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

const getUserCred = async (req, res, { Team, UserSchedule }) => { = async (req, res, { Team, UserSchedule }) => {
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    res.send(user)
}

module.exports = {postTeamHandler, getUserCred}