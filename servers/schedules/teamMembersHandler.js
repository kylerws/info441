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

    const user = {id: 20, email: 'mackenzie@msn.com'}

    const userID = user['id']
  
    // Get channel id from path
    const teamID = req.params.teamID
    const team = await Team.find({_id: teamID});


    // res.send(team)
    if (team == null ) {
        res.send('team not found')
        return;
    }

    const creator = team[0]['creator']
    if (creator == null) {
        res.send('creator not found')
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

    // if (currMember.length > 0) {
    //     res.send('user is already a member of this channel')
    //     return;
    // }

    // get the current member's scheduleExists
    // console.log('started')
    const addedMemberSched = await UserSchedule.find({"userID": addedMember['id']})
    // console.log('schedule found')
    const teamObj = await Team.find({_id : teamID})

    // schedule we keep for updating outside of the for loop
    const updatedTeamSched = teamObj[0]['schedule']


    if (addedMemberSched.length > 0) {
        const schedArray = addedMemberSched[0]['schedule']

        // res.send(updatedTeamSched)

        // res.send(updatedTeamSched)--FULL TEAM OBJECT
        // return;

        for (i = 0; i < schedArray.length; i++) {
            const curr = schedArray[i]
            const currDay = curr['day']
            const teamSched = await Team.find({_id : teamID, "schedule.day": currDay})
            if (teamSched.length > 0) {
                // console.log('there is a schedule to compare for ' + currDay)

                // gets full schedule
                const teamSchedToCompare = teamSched[0]['schedule']

                // console.log(entry)
                // const teamDayEntry = teamSchedToCompare.filter(d => d.day == currDay)
                const index = teamSchedToCompare.findIndex(d => d.day == currDay)
                const teamDayEntry = teamSchedToCompare[index]

                // Compare user start to team start
                const teamStart = teamDayEntry['startTime']
                const userStart = curr['startTime']

                const teamEnd = teamDayEntry['endTime']
                const userEnd = curr['endTime']

                // console.log('Schedule to compare for ' + currDay + " update needed = " + needsUpdate(userStart, teamStart, true))
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
            }

        }

        // const updatedTeamSched = await Team.find({_id : teamID})

        Team.findOneAndUpdate({_id: teamID}, {$set:{"schedule": updatedTeamSched}}, { new: true }, function(err, data) {
            if (err) {
                res.status(400).send("Data: " + data + "\nError: " + err);
                return;
            }
            console.log("updated schedule for new emmeber")
            // res.status(201).send('Member added to channel, schedule updated');
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
        res.send(newMembers)
    } catch(e) {
        res.send('not working')
    }
    // console.log(len(newMembers))
    res.send(newMembers)
    res.send('reached')
}

const getMembersHandler = async (req, res, { Team }) => {
    const teamID = req.params.teamID
    const team = await Team.find({_id: teamID});


    // res.send(team)
    if (team == null ) {
        res.send('team not found')
        return;
    }

    res.send(team)
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
