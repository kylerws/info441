package directors

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"

	"info441/servers/gateway/handlers"
	"info441/servers/gateway/sessions"
)

// Target holds the url and scheme for the director
type Target struct {
	Host   string
	Scheme string
}

// Director customizes traffic requests for Reverse Proxy
type Director func(r *http.Request)

// XUser contains user data to forward to microservices
type XUser struct {
	ID       int64  `json:"id"`
	Email    string `json:"email"`
	UserName string `json:"username"`
}

// GetTargets splits comma seperated list of host addrs
func GetTargets(addrList string) []*Target {
	addrs := strings.Split(addrList, ",")
	targets := make([]*Target, len(addrs))
	for i, addr := range addrs {
		addr = strings.TrimPrefix(addr, "http://") // convert to correct format
		targets[i] = &Target{addr, "http"}
	}
	return targets
}

// CustomDirector forwards to the microservice and passes it the current user.
func CustomDirector(targets []*Target, ctx *handlers.HandlerContext) Director {
	var counter int32
	counter = 0
	mutex := sync.Mutex{}

	return func(r *http.Request) {
		mutex.Lock()
		defer mutex.Unlock()
		targ := targets[counter%int32(len(targets))]
		atomic.AddInt32(&counter, 1)

		// Add forwarded host header
		r.Header.Add("X-Forwarded-Host", r.Host)

		// Remove X-User always
		r.Header.Del("X-User")

		// Authenticate and add X-User header
		state := &handlers.SessionState{}
		_, err := sessions.GetState(r, ctx.SigningKey, ctx.SessionStore, state)

		// If successful auth
		if err == nil {
			log.Printf("No error, converting to X-User")
			// User from store
			user, err := ctx.UserStore.GetByID(state.User.ID)
			log.Printf("Got user: %v", user)
			log.Printf("USER ID=%v", user.ID)
			if err != nil {
				log.Printf("Could not retrieve authenticated user:\n%s", err.Error())
			}

			// Convert to XUser type and marshal
			xUser := &XUser{user.ID, user.Email, user.UserName}
			userJSON, err := json.Marshal(xUser)
			if err != nil {
				log.Printf("Could not convert auth user to X-User\n%s", err.Error())
			} else {
				r.Header.Add("X-User", string(userJSON))
				log.Printf("Added xUser%v %v", xUser.ID, xUser.Email)
			}
		}

		// Set host and scheme
		r.Host = targ.Host
		r.URL.Host = targ.Host
		r.URL.Scheme = targ.Scheme
		log.Printf("Request forwarded to host: %s", targ.Host)
	}
}
