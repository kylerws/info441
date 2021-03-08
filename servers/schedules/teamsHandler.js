// POST: handle creating new teams

// ALSO INITIALIZE TEAM SCHEDULE TO BE EQUAL TO CREATOR SCHEDULE
const postTeamHandler = async (req, res, { Team }) => {
    // if (!req.get("X-User")) {
    //     res.status(401).send('User not authorized');
    //     return;
    // }

    // const user = JSON.parse(req.get('X-User'));
    const user = {id: 2, email: 'mackenzie@msn.com'}
    const{ name, description, private } = req.body;

    if (!name) {
        res.status(400).send("Must provide team name");
        return;
    }

    const teamExists = await Team.find({"name": name})

    if (teamExists.length > 0) {
        res.send('team already created with that name')
        return;
    }

    const createdAt = new Date();

    const team = {
        "name": name,
        "description": description,
        "private": private,
        "members": [user],
        "createdAt": createdAt,
        "creator": user
    };

    const query = new Team(team);
    query.save((err, newTeam) => {
        if (err) {
            res.status(500).send('unable to create channel' + err);
            return;
        }
        newTeam['id'] == newTeam._id
        // res.send(newChannel._id)
        res.setHeader("Content-Type", "application/json");
        res.status(201).json(newTeam);
        return;
    });
};

module.exports = {postTeamHandler};