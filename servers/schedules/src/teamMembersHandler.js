const { updateTeamSched, needsUpdate, windowIsValid } = require("./scheduleHandler")

// POST: add new members to teams

// ALSO UPDATES TEAM SCHEDULE WITH THE ADDITION OF THE NEW USER'S AVAILABILITY
const postMembersHandler = async (req, res, { Team, UserSchedule }) => {
    console.log("REQUEST: postMembers called")
    if (!req.get("X-User")) {
        res.setHeader("Content-Type", "text/plain")
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));

    const userID = user['id']
  
    const teamID = req.params.teamID
    const team = await Team.find({_id: teamID});

    if (team == null ) {
        res.setHeader("Content-Type", "text/plain")
        res.status(404).send('team not found')
        return;
    }

    const creator = team[0]['creator']
    if (creator == null) {
        res.setHeader("Content-Type", "text/plain")

        res.status(404).send('creator not found')
        return;
    }

    if (team[0]['creator']['id'] != userID) {
        res.setHeader("Content-Type", "text/plain")

        res.status(403).send('not channel creator')
        return;
    }

    const { email } = req.body
    if (!email) {
        res.setHeader("Content-Type", "text/plain")

        res.status(404).send("Must provide an email to add")
        return
    }


    const currMember = await Team.find({_id : teamID, "members.email": email});

    if (currMember.length > 0) {
        res.setHeader("Content-Type", "text/plain")

        res.status(409).send('user is already a member of this channel')
        return;
    }

    const addedMemberSched = await UserSchedule.findOne({"userEmail": email})

    if (!addedMemberSched) {
        res.setHeader("Content-Type", "text/plain")

        res.status(400).send('must add a valid user with a posted schedule')
        return;
    }

    const addedUserID = addedMemberSched['userID']

    const addedMember = {
        "id": addedUserID,
        "email": email
    }

    const teamObj = await Team.find({_id : teamID})
    const updatedTeamSched = teamObj[0]['schedule']

    if (teamObj.length > 0) {

        const schedArray = teamObj[0]['schedule']

        for (i = 0; i < schedArray.length; i++) {
            const curr = schedArray[i]
            const currDay = curr['day']
            const userSched = await UserSchedule.find({"userID" : addedMember['id'], "schedule.day": currDay})
            var dayWasUpdated = false

            if (userSched.length > 0) {
                const userSchedToCompare = userSched[0]['schedule']
                const index = userSchedToCompare.findIndex(d => d.day == currDay)
                const userDayEntry = userSchedToCompare[index]
                const userStart = userDayEntry['startTime']
                const teamStart = curr['startTime']
                const userEnd = userDayEntry['endTime']
                const teamEnd = curr['endTime']

                console.log(' starting team end ' + teamEnd)

                if (needsUpdate(userStart, teamStart, true)) {
                    console.log('updating team start')
                    console.log('updating team start from' + teamStart + 'to' + userStart)
                    updateTeamSched(updatedTeamSched, i, userStart, true)
                    dayWasUpdated = true
                }

                if (needsUpdate(userEnd, teamEnd, false)) {
                    console.log('updating team end')
                    console.log('updating team end from' + teamEnd + 'to' + userEnd)
                    updateTeamSched(updatedTeamSched, i, userEnd, false)
                    dayWasUpdated = true
                
                }

                // check the relationship between start time and end time
                if (dayWasUpdated) {
                    // get start da
                    console.log('day was updated=' + dayWasUpdated)
                    windowIsValid(updatedTeamSched[i])
                }
            } else {
                console.log('there is NOT a schedule to compare for ' + currDay)
                // change the day start time to be the end time
                const currStart = updatedTeamSched[i]['startTime']
                updateTeamSched(updatedTeamSched, i, currStart, false)
                updatedTeamSched[i]['hasAvailability'] = false
            }

        }


        Team.findOneAndUpdate({_id: teamID}, {$set:{"schedule": updatedTeamSched}}, { new: true }, function(err, data) {
            if (err) {
                res.status(400).send("Data: " + data + "\nError: " + err);
                return;
            }
        });
    }

    try {
        const newMembers = team[0]['members'];
        newMembers.push(addedMember)
        Team.findOneAndUpdate({_id: teamID},{$set:{"members": newMembers}}, { new: true }, function(err, data) {
            if (err) {
                res.status(400).send("message: " + data + " delete error: " + err);
                return;
            }
            res.setHeader("Content-Type", "application/json");
            res.status(201).json(newMembers)
        })
    } catch(e) {
        res.status(500).send('not working')
    } 
}

// GET: get the members of a team by a given ID
const getMembersHandler = async (req, res, { Team }) => {
    console.log("REQUEST: getMembers called")
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    const userID = user['id']
    const teamID = req.params.teamID
    const team = await Team.findOne({_id: teamID, "members.id": userID});

    if (team == null ) {
        console.log("No team members found for id " + teamID)
        res.setHeader("Content-Type", "text/plain")
        res.status(404).send('we did not find a team you are a part of with the given credentials')
        return;
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(team['members'])
}

module.exports = {postMembersHandler, getMembersHandler };
