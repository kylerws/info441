// Checks X-User auth header and returns JSON parsed user object
const authenticate = (res, req) => {
  var user = req.get("X-User")

  // Check authentication
  if (!user) {
    res.status(401).send('User not authenticated')
    return null
  }

  return JSON.parse(user)
}

  const user = authenticate(res, req)
  if (!user) return

// const findTeam = async (teamID, userID, { Team } )  => {
//   teams = await Team.find({_id : teamID, "members.id": userID})
//   if (teams.length >= )
// }

// Checks if user with userID is the creator of given team
// Writes status 403 to response if not
// Returns boolean
const isCreator = (team, userID, res) => {
  const creator = team.creator
  if (creator == null || creator.id != userID) {
    res.status(403).send("User is not creator of this team")
    return false
  }
  return true
}

// Check creator
if (!isCreator(teams[0], userID, res)) {
  return
}

module.exports = { authenticate }