// post user's schedule
const postUserScheduleHandler = async (req, res, { UserSchedule }) => {
        // if (!req.get("X-User")) {
    //     res.status(401).send('User not authorized');
    //     return;
    // }

    // const user = JSON.parse(req.get('X-User'));

    const user = {id: 2, email: 'mackenzie@msn.com'}
    const userID = user['id']
    const{ day, startTime, endTime } = req.body;

    if (!startTime || !endTime) {
        res.status(400).send("Must provide start and end time");
        return;
    }

    // const teamExists = await Team.find({"name": name})

    // if (teamExists.length > 0) {
    //     res.send('team already created with that name')
    //     return;
    // }

    // const createdAt = new Date();

    const userSchedule = {
        "userID": userID,
        "startTime": startTime,
        "endTime": endTime
    };

    const query = new UserSchedule(userSchedule);
    query.save((err, userSchedule) => {
        if (err) {
            res.status(500).send('unable to create schedule' + err);
            return;
        }
        userSchedule['id'] == userSchedule._id
        // res.send(newChannel._id)
        res.setHeader("Content-Type", "application/json");
        res.status(201).json(userSchedule);
        return;
    });
}

    // patch user's schedule

module.exports = {postUserScheduleHandler};
