package handlers

import (
	"info441/servers/gateway/models/users"
	"info441/servers/gateway/sessions"
)

// HandlerContext is a reciever for HTTP authorization handlers.
// It contains the key used to sign and verify SessionIDs, the
// session store and the user store
type HandlerContext struct {
	SigningKey   string
	SessionStore sessions.Store
	UserStore    users.Store
}
