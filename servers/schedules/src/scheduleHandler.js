// post user's schedule
const postUserScheduleHandler = async (req, res, { UserSchedule }) => {
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));


    // const user = {id: 4, email: 'user4'}

    const userID = user['id']
    const userEmail = user['email']

    const{ day, startTime, endTime } = req.body;

    if (!startTime || !endTime || !day) {
        res.status(400).send("Must provide start and end time");
        return;
    }

    if (startTime >= endTime) {
        res.status(400).send('start time must be before end time')
        return;
    }

    const userSchedulePosted = await UserSchedule.find({"userID": userID})
    console.log(userSchedulePosted.length)
    if (userSchedulePosted.length == 0) {
        const userSchedule = {
            "userID": userID,
            "userEmail": userEmail,
            "schedule": [{"day": day, "startTime": startTime, "endTime": endTime}]
        };

        const query = new UserSchedule(userSchedule);
        query.save((err, userSchedule) => {
            if (err) {
                res.status(500).send('unable to create schedule' + err);
                return;
            }
            
            // res.send(newChannel._id)
            res.setHeader("Content-Type", "application/json");
            res.status(201).json(userSchedule)
            // res.status(201).json(userSchedule['schedule']);
            return;
        });
    } else {
        // find the existing schedule for this user
        // check if they have a schedule posted for this day
        const dayExists = await UserSchedule.find({"schedule.day": day, "userID": userID})
        if (dayExists.length > 0) {
            res.status(409).send('availability already created for this day / user')
            return;
        }

        // res.send(userSchedulePosted)
        const dayToAdd = {"day": day, "startTime": startTime, "endTime": endTime}
        userSchedulePosted[0]['schedule'].push(dayToAdd)

        UserSchedule.findOneAndUpdate({"userID": userID}, {$set:{"schedule": userSchedulePosted[0]['schedule']}}, { new: true }, function(err, data) {
            if (err) {
                res.status(400).send("Data: " + data + "\nError: " + err);
                return;
            }

            res.setHeader("Content-Type", "application/json");
            res.status(201).json(userSchedulePosted);
            return;
          });
    }
}

    // patch user's schedule
const getUserScheduleHandler = async (req, res, { UserSchedule }) => {    
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const userID = user['id']
    const userEmail = user['email']
    const userSchedule = await UserSchedule.findOne({"userEmail": userEmail})
    if (!userSchedule) {
        res.status(404).send("Schedule not found for user")
        return
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(userSchedule['schedule'])
}

module.exports = {postUserScheduleHandler, getUserScheduleHandler};
