const { updateTeamSched, needsUpdate, windowIsValid } = require("./scheduleHandler")


const postMembersHandler = async (req, res, { Team, UserSchedule }) => {
    console.log("REQUEST: postMembers called")
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const user = {id: 3, email: 'user3'}

    const userID = user['id']
  
    // Get channel id from path
    const teamID = req.params.teamID
    const team = await Team.find({_id: teamID});

    if (team == null ) {
        res.status(404).send('team not found')
        return;
    }

    const creator = team[0]['creator']
    if (creator == null) {
        res.status(404).send('creator not found')
        return;
    }

    if (team[0]['creator']['id'] != userID) {
        res.status(403).send('not channel creator')
        return;
    }

    const { email } = req.body
    if (!email) {
        res.status(404).send("Must provide an email to add")
        return
    }


    // try {
    const currMember = await Team.find({_id : teamID, "members.email": email});

    // ---------------------------------------UNCOMMENT WHEN DONE TESTING-------------
    if (currMember.length > 0) {
        res.status(409).send('user is already a member of this channel')
        return;
    }

    const addedMemberSched = await UserSchedule.findOne({"userEmail": email})
    console.log('new member id:' + addedMemberSched['userID'])
    // res.send(addedMemberSched)
    // return;

    if (addedMemberSched.length == 0) {
        res.status(400).send('must add a valid user with a posted schedule')
        return;
    }

    const addedUserID = addedMemberSched['userID']

    const addedMember = {
        "id": addedUserID,
        "email": email
    }

    if (addedMemberSched.length == 0) {
        res.status(403).send('Added members must have posted availability to be added to a team.')
        return;
    }

    const teamObj = await Team.find({_id : teamID})
    const updatedTeamSched = teamObj[0]['schedule']

    if (teamObj.length > 0) {

        const schedArray = teamObj[0]['schedule']
        console.log('loop entered, num iters: ' + schedArray.length)

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


                if (needsUpdate(userStart, teamStart, true)) {
                    updateTeamSched(updatedTeamSched, i, userStart, true)
                    dayWasUpdated = true
                }

                if (needsUpdate(userEnd, teamEnd, false)) {
                    updateTeamSched(updatedTeamSched, i, userEnd, false)
                    dayWasUpdated = true
                
                }

                // check the relationship between start time and end time
                if (dayWasUpdated) {
                    // get start da
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
            // console.log("updated schedule for new emmeber")
            // res.status(201).send('Member added to channel, schedule updated');
        });
    }

    
    // Add members to team
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

const getMembersHandler = async (req, res, { Team }) => {
    console.log("REQUEST: getMembers called")
    if (!req.get("X-User")) {
        res.status(401).send('User not authorized');
        return;
    }

    const user = JSON.parse(req.get('X-User'));
    // const user = {id: 1, email: 'user1'}
    const userID = user['id']
    const teamID = req.params.teamID
    const team = await Team.findOne({_id: teamID, "members.id": userID});

    if (team == null ) {
        res.status(404).send('we did not find a team you are a part of with the given credentials')
        return;
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(team['members'])
}


// delete members from team


// const deleteMembersHandler = async(req, res, {Team}) => {
//     console.log("REQUEST: deleteMembers called")
//     const teamID = req.params.teamID
//     const memberID = JSON.parse(req.body['id']);

//     const currteam = await Team.find({_id: teamID});

//     currteam['members'] = currteam['members'].filter(el => el['id'] != memberID);

//     Team.findOneAndUpdate(
//         {"id": teamID}, {$set:{"members": currteam['members']}},
//         { new: true },
//         function(err, data) {
//         if (err) {
//             res.status(400).send("message: " + data + " delete error: " + err);
//             return;
//         }
//         res.json(data);
//     });
// }

module.exports = {postMembersHandler, getMembersHandler };
