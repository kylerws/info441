// post user's schedule

function needsUpdate(userTime, teamTime, startTime) {
    if (startTime) {
        return teamTime < userTime;
    }
    return teamTime > userTime;
}

function updateTeamSched(currentSched, dayIndex, newTime, startTime) {
    if (startTime) {
        currentSched[dayIndex]['startTime'] = newTime
    }

    currentSched[dayIndex]['endTime'] = newTime
    // return currentSched
    // return newSched;
}

function windowIsValid(daySchedule) {
    const currStart = daySchedule['startTime']
    const currEnd = daySchedule['endTime']
    if (currEnd <= currStart){
        daySchedule['hasAvailability'] = false
        // res.send('time was updated, and time window is invalid, hasAvailability=false')
        // return;
    } else {
        daySchedule['hasAvailability'] = true
        // res.send(updatedTeamSched[index]['hasAvailability'])
        // return;
    }
}

// updateTeamSched(currentSched, dayIndex, newTime, startTime)
// needsUpdate(userTime, teamTime, startTime)

const postUserScheduleHandler = async (req, res, { UserSchedule, Team }) => {
    console.log("REQUEST: postTeam called")
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));

    // const user = {id: 4, email: 'user4'}

    const userID = user['id']
    const userEmail = user['email']

    const{ day, startTime, endTime } = req.body;
        // check if the time at that day needs to be adjusted for the team
    const dayExists = await UserSchedule.find({"schedule.day": day, "userID": userID})
    if (dayExists.length > 0) {
        res.status(409).send('availability already created for this day / user')
        return;
    }

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

        // check to see if the user is part of a team
        const teamsForUser = await Team.find({'members.id': userID})

        for(i = 0; i < teamsForUser.length; i++) {
            // get specific team
            const teamSchedule = teamsForUser[i]['schedule']

            // get specific team schedule where the day = day
            const teamDayIndex = teamSchedule.findIndex(d => d.day == day)

            // check to see if this day is in the team and there are other members in the team
            // to know if this day should be updated
            var updated = false

            if (teamsForUser[i]['members'].length > 1) {
                if (teamDayIndex != -1) {
                    if (needsUpdate(startTime, teamDay.startTime, true)) {
                        updateTeamSched(teamSchedule, teamDayIndex, startTime, true)
                        updated = true
                    }

                    if (needsUpdate(endTime, teamDay.endTime, false)) {
                        updateTeamSched(teamSchedule, teamDayIndex, startTime, false)
                        updated = true
                    }

                    // if we changed either team end time or team start time, check the window is valid
                    if (updated) {
                        windowIsValid(teamSchedule[teamDayIndex])
                    }
                }
            } else {
                // if you are the only one in the team, add this to the team schedule
                teamSchedule.push({"day": day, "startTime": startTime, "endTime": endTime, "hasAvailability": true})
                updated = true
            }

            if (updated) {
                Team.findOneAndUpdate({_id: teamsForUser[i]['id']}, {$set:{"schedule": teamSchedule}}, { new: true }, function(err, data) {
                    if (err) {
                        res.status(400).send("Data: " + data + "\nError: " + err);
                        return;
                    }
                });
            }
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
            // res.status(201).json(userSchedulePosted[0]['schedule']);
            return;
        });
        // res.send('ok')
    }
}

    // patch user's schedule
const getUserScheduleHandler = async (req, res, { UserSchedule }) => {    
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const user = {id: 2, email: 'user2'}
    const userID = user['id']
    const userEmail = user['email']
    const userSchedule = await UserSchedule.findOne({"userEmail": userEmail})

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(userSchedule['schedule'])
}

module.exports = {postUserScheduleHandler, getUserScheduleHandler, updateTeamSched, needsUpdate, windowIsValid};
