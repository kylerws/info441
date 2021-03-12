function needsUpdate(userTime, teamTime, startTime) {
    if (startTime) {
        return teamTime < userTime;
    }
    console.log(userTime + '>' + teamTime + '=' + teamTime > userTime + ' will update if true')
    return teamTime > userTime;
}

function updateTeamSched(currentSched, dayIndex, newTime, startTime) {
    if (startTime) {
        currentSched[dayIndex]['startTime'] = newTime
    } else {
        currentSched[dayIndex]['endTime'] = newTime
    }
}

function windowIsValid(daySchedule) {
    const currStart = daySchedule['startTime']
    const currEnd = daySchedule['endTime']
    if (currEnd <= currStart){
        daySchedule['hasAvailability'] = false
    } else {
        daySchedule['hasAvailability'] = true
    }
    console.log('current start: ' + currStart + 'current end: ' + currEnd + " has availability " + daySchedule['hasAvailability'])
}

// POST: add availability for days to the user schedule

// ADDS NEW DAYS TO A USER SCHEDULE AND INCORPORATES NEW ADDITIONS INTO ANY
// TEAM AVAILABILITY THE USER IS A PART OF
const postUserScheduleHandler = async (req, res, { UserSchedule, Team }) => {
    console.log("REQUEST: postUserScheduleHandlers called")
    if (!req.get("X-User")) {
        res.setHeader("Content-Type", "text/plain")

        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));

    const userID = user['id']
    const userEmail = user['email']

    const{ day, startTime, endTime } = req.body;

    if ( !day || !startTime || !endTime) {
        res.setHeader("Content-Type", "text/plain")

        res.status(400).send('must include day, start time, and end time')
        return;
    }

    const dayExists = await UserSchedule.find({"schedule.day": day, "userID": userID})
    if (dayExists.length > 0) {
        res.setHeader("Content-Type", "text/plain")

        res.status(409).send('availability already created for this day / user')
        return;
    }

    if (startTime >= endTime) {
        res.setHeader("Content-Type", "text/plain")

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
                res.setHeader("Content-Type", "text/plain")

                res.status(500).send('unable to create schedule' + err);
                return;
            }            
            res.setHeader("Content-Type", "application/json");
            res.status(201).json(userSchedule)
            return;
        });
    } else {
        const teamsForUser = await Team.find({'members.id': userID})
        for(i = 0; i < teamsForUser.length; i++) {
            const teamSchedule = teamsForUser[i]['schedule']
            const teamDayIndex = teamSchedule.findIndex(d => d.day == day)
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

                    if (updated) {
                        windowIsValid(teamSchedule[teamDayIndex])
                    }
                }
            } else {
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

// GET: get user schedule
const getUserScheduleHandler = async (req, res, { UserSchedule }) => { 
    console.log("REQUEST: getUserSchedule called") 
    if (!req.get("X-User")) {
        res.setHeader("Content-Type", "text/plain")

        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    const userEmail = user['email']
    const userSchedule = await UserSchedule.findOne({"userEmail": userEmail})
    if (!userSchedule) {
        res.setHeader("Content-Type", "text/plain")
        res.status(404).send("Schedule not found for user")
        return
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(userSchedule['schedule'])
}

module.exports = {postUserScheduleHandler, getUserScheduleHandler, updateTeamSched, needsUpdate, windowIsValid};
