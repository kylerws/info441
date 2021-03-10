// post members to team
// get teams availability

function needsUpdate(userTime, teamTime, startTime) {
    // if team start is before (less than user start), needs update

    // return teamStartTime < userStartTime
    // console.log("team start " + teamStartTime + " user start: " + userStartTime)
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



const postMembersHandler = async (req, res, { Team, UserSchedule }) => {
    // if (!req.get("X-User")) {
    //   res.status(401).send('User not authorized');
    //   return;
    // }
  
    // const user = JSON.parse(req.get('X-User'));

    const user = {id: 1, email: 'mackenzie@msn.com'}

    const userID = user['id']
  
    // Get channel id from path
    const teamID = req.params.teamID
    const team = await Team.find({_id: teamID});


    // res.send(team)
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
        res.status(401).send('not channel creator')
        return;
    }

    const { id, email } = req.body

    const addedMember = {
      "id": id,
      "email": email
    }

    // try {
    const currMember = await Team.find({_id : teamID, "members.id": addedMember['id']});
    
    // UNCOMMENT THIS WHEN DONE TESTING BELOW

    if (currMember.length > 0) {
        res.status(409).send('user is already a member of this channel')
        return;
    }

    // get the current member's scheduleExists
    // console.log('started')
    const addedMemberSched = await UserSchedule.find({"userID": addedMember['id']})
    // console.log('schedule found')

    if (addedMemberSched.length == 0) {
        res.status(401).send('Added members must have posted availability to be added to a team.')
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
            // const teamSched = await Team.find({_id : teamID, "schedule.day": currDay})
            const userSched = await UserSchedule.find({"userID" : addedMember['id'], "schedule.day": currDay})
            // res.send(userSched)
            // return;
            if (userSched.length > 0) {
                const userSchedToCompare = userSched[0]['schedule']
                const index = userSchedToCompare.findIndex(d => d.day == currDay)
                const userDayEntry = userSchedToCompare[index]

                const userStart = userDayEntry['startTime']
                const teamStart = curr['startTime']

                const userEnd = userDayEntry['endTime']
                const teamEnd = curr['endTime']

                if (needsUpdate(userStart, teamStart, true)) {
                    console.log('update start needed')
                    console.log(updatedTeamSched[index]['startTime'] + ' is the old start time, outside function for ' + currDay)
                    updateTeamSched(updatedTeamSched, index, userStart, true)
                    console.log(updatedTeamSched['startTime'] + ' is the new start time, outside function for ' + currDay)
                }

                if (needsUpdate(userEnd, teamEnd, false)) {
                    console.log('update end needed')
                    console.log(updatedTeamSched[index]['endTime'] + ' is the old endTime, outside function for ' + currDay)
                    updateTeamSched(updatedTeamSched, index, userEnd, false)
                    console.log(updatedTeamSched[index]['endTime'] + ' is the new endTime, outside function for ' + currDay)
                
                }

            } else {
                console.log('there is NOT a schedule to compare for ' + currDay)
                console.log('started resetting time')
                const newTime = updatedTeamSched[i]['startTime']
                console.log('got new time time')
                updatedTeamSched[i]['endTime'] = newTime
            }

        }


        Team.findOneAndUpdate({_id: teamID}, {$set:{"schedule": updatedTeamSched}}, { new: true }, function(err, data) {
            if (err) {
                res.status(400).send("Data: " + data + "\nError: " + err);
                return;
            }
            console.log("updated schedule for new emmeber")
            res.status(201).send('Member added to channel, schedule updated');
        });
    }

    

    // res.send('finished')
    // return;

    // test('this is', 'a test')

    // check if the added user's start time for each day is earlier / later than the curren start time
    // check if the added user's start time for each day is earlier / later than the curren start time

    try {
        const newMembers = team[0]['members'];
        newMembers.push(addedMember)
        Team.findOneAndUpdate({_id: teamID},{$set:{"members": newMembers}}, { new: true }, function(err, data) {
            if (err) {
                res.status(400).send("message: " + data + " delete error: " + err);
                return;
            }
        })
    } catch(e) {
        res.status(500).send('not working')
    }
    // console.log(len(newMembers))
    res.setHeader("Content-Type", "application/json");
    res.status(201).send(newMembers)
}

const getMembersHandler = async (req, res, { Team }) => {
    const teamID = req.params.teamID
    const team = await Team.findOne({_id: teamID});


    // res.send(team)
    if (team == null ) {
        res.status(404).send('team not found')
        return;
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(team['members'])
}


// delete members from team


const deleteMembersHandler = async(req, res, {Team}) => {
    const teamID = req.params.teamID
    const memberID = JSON.parse(req.body['id']);

    const currteam = await Team.find({_id: teamID});

    currteam['members'] = currteam['members'].filter(el => el['id'] != memberID);

    Team.findOneAndUpdate(
        {"id": teamID}, {$set:{"members": currteam['members']}},
        { new: true },
        function(err, data) {
        if (err) {
            res.status(400).send("message: " + data + " delete error: " + err);
            return;
        }
        res.json(data);
    });
}

module.exports = {postMembersHandler, getMembersHandler, deleteMembersHandler};
