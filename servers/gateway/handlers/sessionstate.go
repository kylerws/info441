package handlers

import (
	"time"

	"assignments-fixed-kylerws/servers/gateway/models/users"
)

//TODO: define a session state struct for this web server
//see the assignment description for the fields you should include
//remember that other packages can only see exported fields!

// SessionState contains the User and start time of a session
type SessionState struct {
	StartTime time.Time
	User      users.User
}
