// post members to team
// get teams availability
const postMembersHandler = async (req, res, { Team }) => {
    // if (!req.get("X-User")) {
    //   res.status(401).send('User not authorized');
    //   return;
    // }
  
    // const user = JSON.parse(req.get('X-User'));

    const user = {id: 2, email: 'mackenzie@msn.com'}

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
    
    if (currMember.length > 0) {
        res.send('user is already a member of this channel')
        return;
    }

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
    //     if (err) {
    //         res.status(400).send("message: " + data + " delete error: " + err);
    //         return;
    //     }
    //     res.setHeader("Content-Type", "application/json");
    //     res.status(201).send('Member added to team');
    //     return;
    //   });
    // } catch(e) {
    //   res.status(400).send("Incorrect JSON format")
    //   return;
    // }

    // console.log(team['name'])
    // console.log(channel)
  
    // THIS CODE BREAKS
    // Check channel creator

    // res.json(team[0]['creator']['id'])

    // if (team[0]['creator']['id'] != userID) {
    //   res.status(403).send("User is not channel creator");
    //   return;
    // }
  
    // const { id, email } = req.body
    // res.send('user is creator')
  
    // OLD CODE, also breaks
  
    // // Check that user is allowed to access channel
    // // const hasAccess = await Channel.find({_id : channelID, "creator.id": user['id']});
    // // if (!hasAccess) {
    // //     res.status(403).send("User is not channel creator");
    // //     return;
    // // }
  
    // // const channel = await Channel.findOne({_id: channelID});
    // // const test = channel['creator']['id']
    // // console.log(test == userID)
  
    // // if (test != userID) {
    // //   res.status(403).send("User is not channel creator");
    // //   return;
    // // }
  
  
  
    // SHOULD WORK, commented out for testing
  
    // const addedMember = {
    //   "id": id,
    //   "email": email
    // }
  
    // // Check that user is not already member
    // const currMember = await Channel.find({_id : channelID, "members.id": addedMember['id']});
    // if (currMember.length > 0) {
    //   res.status(409).send('User is already a member')
    //   return;
    // }
  
    // // Try add member to channel
    // try {
    //   const newMembers = channel[0]['members'].push(addedMember);
    //   Channel.findOneAndUpdate({_id: channelID},{$set:{"members": newMembers}}, { new: true }, function(err, data) {
    //     if (err) {
    //         res.status(400).send("message: " + data + " delete error: " + err);
    //         return;
    //     }
    //     res.setHeader("Content-Type", "application/json");
    //     res.status(201).send('Member added to channel');
    //   });
    // } catch(e) {
    //   res.status(400).send("Incorrect JSON format")
    // }
    // res.send("End test")
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

module.exports = {postMembersHandler, getMembersHandler};
