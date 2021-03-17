// I stayed up way too late thinking this out lmao
//
// Here's the basic idea. In the schema, we:
//
// Store a teamWeights array where:
//	- Each index is an hour (out of 24)
//	- The value is the number of team members available at that hour
//
// Something like:
// [3, 4, 4, 4, 0, 3, 4, 4, 2, 3, 1, 3, 4, 4, 4, 2 ... ]
//
// We keep track of the total number of members in the team, and add or subtract 1 from the weights
// when we add/remove a member based on their personal availability (also an array of 24)
//
// The team availability is where any weight == the number of team members
//
// So in the example above, if there are 4 members ....
// here are the available times:
//     1AM   2AM   3AM               6AM   7AM              12PM   1PM   2PM  ...
//
// Here's how we can actually code this:


// Number of users in team
nUsers = 0

// Weights that represent the number of members available at that time
// For my sanity (and yours lmao) I did 12 instead of 24
// 
// So, weights[1] is the number of members available at 1AM, weights[2] => 2AM ...
// Right now, no users in the team so every time is 0
teamWeights = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]


// Function: Convert team weights to actual availability
// 
// Take in the teamWeights and number of users in the team
// Return true if everyone is available at that time (arr[i] == n), false if not
// 
// Output: [true, true, false, true, true, true, false, false ... ]
function weightsToSchedule(arr, n) {
	return arr.map(d => {
  	return d == n
  })
}

// Function: print the actual available times to the user
//
// This just takes this true / false schedule, and prints the corresponding time if
// its available for everyone. We wouldn't put this in react but the general idea is
// the same: display if TRUE, don't display if FALSE
//
// Output: [0AM  1AM   -   3AM   4AM   5AM   -   -   ...]
function printSchedule(sched) {
	str = ""
  for (i = 0; i < sched.length; i++) {
  	if (sched[i]) {
    	str += i + "AM" + "    "
    } else {
    	str += " - " + "    "
    }
  }
  console.log(str)
}

// So lets see what's available in the empty teamWeights, with no members
// Right now, every time should be available since no technicallyyyyyy, no one isn't
//
// This should return TRUE and print every time
schedule = weightsToSchedule(teamWeights, nUsers)
console.log(schedule)
printSchedule(schedule)


// Lets add a new user
// These values could honestly be anything. I chose booleans cause that made sense to me,
// (true if availablle, false if not) but it could even be numbers (i.e. 1, 0) or anything binary
user1 = [true, true, true, false, false, false, true, true, true, true, false, false]


// Function: Add user availability into team
// This takes the user array, and the team array. If the user is available at the time at i,
// add 1 to the weights[i]. Now, 1 member is available at that time
//
// Returns the updated availability weights of the team
function addUser(userArr, teamArr) {
	for (i = 0; i < teamArr.length; i++) {
  	if (userArr[i]) {
    	teamArr[i] += 1
    }
  }
  
 return teamArr
}


// Let's see what happens when we add 1 user with an availability array
console.log("\nAfter 1 user")

// first, update the teamWeights
teamWeights = addUser(user1, teamWeights)		
console.log(teamWeights)

// then, convert the weights to a schedule of TRUE if available and FALSE if times are blocked out
teamSchedule = weightsToSchedule(teamWeights, 1)
console.log(teamSchedule)

// finally, we can show these visually as a schedule of available times
printSchedule(teamSchedule)


// Now lets add another user. Their availabilty should narrow down the team availability
user2 = [false, true, true, true, false, true, true, true, true, false, false, false]

console.log("\nAfter 2nd user")

// print the same fields as before
teamWeights = addUser(user2, teamWeights)		// updated weights
console.log(teamWeights)

teamSchedule = weightsToSchedule(teamWeights, 2)	// weights to a schedule
console.log(teamSchedule)

printSchedule(teamSchedule)		// display schedule (to client, probably)


// Putting the whole algorithm together, this is how it would run for another user
console.log("\n3rd user")
user3 = [true, false, false, false, true, true, true, true, false, true, true, true]

teamWeights = addUser(user3, teamWeights)						// this has to be stored in schema
teamSchedule = weightsToSchedule(teamWeights, 3)		// don't need to store, we could just have a helper func
printSchedule(teamSchedule)													// all display stuff is handled client-side



// Spinning further......
//
// These are more thoughts I had about this algorithm
// Major props if you get this far down


// The biggest reason why I like this: we don't need start or end times
// 
// This works because of printSchedule (or how we display to a web app really): We don't actually need
// to convert these availability points into real blocks of availability, because its obvious when we 
// print them out
//
//     1AM    2AM                         6AM    7AM    8AM
//
// Instantly, I can understand that 1-2 is available, and so is 6-8AM (not that I need to spell that out
// for you but, hey, I'm in this deep already). If you can imagine that these are filled in blocks on 
// a calendar grid, that's our web client right there.
//
// Really, it doesn't matter that we haven't actually specified start and end times, because its obvious
// which blocks of times are available.


// Also, the process is simple. We just keep track of weights of availabilty at each hour. Each weight is
// the number of users available at that time (Step 1)
//
// If the weight == current number of members, then that time is available for the team (Step 2)
// Then, if TRUE we display something for that time, and if FALSE we don't (Step 3)
// The user can infer the rest


// This should make adding and deleting incredibly easy
//
// This should also work for deleting because its just the same process in reverse, but I 
// haven't tested it. Patching might be tricky, but I think we could do this by:
//
// 1) remove user from team weights (so clear the team of that user's availability)
// 2) add the new updated user weights, which should then calculate the new team availabilites


// Another problem is what if we end up with available times with no neighbors like:
//
//     2AM               6AM           8AM
//
// Because the algorithm will consider these as "available" (weight == n of users) but in reality
// this is just an overlap of start and end times.
//
// I think this could be handled client-side (check neighbors, don't display if none)
// or also server-side (check neighbors and don't return if none). Idk which one will be easier
// so there's some food for thought aye


// The last problem is we don't really have access to which users are available when, only
// what times work for everyone. At least in the Team schema. Client-side, I could make several
// requests at once, one for each member and one for the whole team, everytime we display the 
// schedule but that seems janky.....
//
// Then again, that's exactly how the schema is now, so really we don't lose anything (right?....)

