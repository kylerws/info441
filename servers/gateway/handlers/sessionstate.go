package handlers

import (
	"time"

	"info441/servers/gateway/models/users"
)

// SessionState contains the User and start time of a session
type SessionState struct {
	StartTime time.Time
	User      users.User
}
