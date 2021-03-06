package handlers

import (
	"assignments-fixed-kylerws/servers/gateway/models/users"
	"assignments-fixed-kylerws/servers/gateway/sessions"
)

//TODO: define a handler context struct that
//will be a receiver on any of your HTTP
//handler functions that need access to
//globals, such as the key used for signing
//and verifying SessionIDs, the session store
//and the user store

// HandlerContext is a reciever for HTTP authorization handlers.
// It contains the key used to sign and verify SessionIDs, the
// session store and the user store
type HandlerContext struct {
	SigningKey   string
	SessionStore sessions.Store
	UserStore    users.Store
}
