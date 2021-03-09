package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"info441/servers/gateway/handlers"
	"info441/servers/gateway/models/users"
	"info441/servers/gateway/sessions"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"
)

// main is the main entry point for the server
func main() {

	// Read env variables
	addr := os.Getenv("ADDR")
	TLSCERT := os.Getenv("TLSCERT")
	TLSKEY := os.Getenv("TLSKEY")
	sessionKey := os.Getenv("SESSIONKEY")
	redisAddr := os.Getenv("REDISADDR")
	DSN := fmt.Sprintf("root:%s@tcp(mysqldb:3306)/mysqldb", os.Getenv("MYSQL_ROOT_PASSWORD"))

	// Set defaults if empty
	if len(addr) == 0 {
		addr = ":443"
	}
	if len(TLSCERT) == 0 {
		log.Fatal("No TLSCERT environment variable found")
	}
	if len(TLSKEY) == 0 {
		log.Fatal("No TLSKEY environment variable found")
	}
	if len(redisAddr) == 0 {
		redisAddr = "127.0.0.1:6379"
	}
	if len(DSN) == 0 {
		DSN = fmt.Sprintf("root:%s@tcp(mysqldb:3306)/mysqldb", "info441")
	}

	// Get addr for schedules
	// schedulesAddr := os.Getenv("SCHEDULESADDR")
	// if len(schedulesAddr) == 0 {
	// 	schedulesAddr = "schedules:80"
	// }

	// Create session store
	redisDB := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	sessionStore := sessions.NewRedisStore(redisDB, time.Hour)

	// Create user store
	userStore, err := users.NewMySQLStore(DSN)
	if err != nil {
		log.Printf("Unable to open sql database %v", err)
	}

	// Context Handler
	ctx := &handlers.HandlerContext{
		SigningKey:   sessionKey,
		SessionStore: sessionStore,
		UserStore:    userStore,
	}

	// Set up proxies
	// schedulesTargs := directors.GetTargets(schedulesAddr)
	// schedulesProxy := &httputil.ReverseProxy{Director: directors.CustomDirector(schedulesTargs, ctx)}

	// New mux
	mux := http.NewServeMux()

	// Routes
	mux.HandleFunc("/v1/users", ctx.UsersHandler)
	mux.HandleFunc("/v1/users/", ctx.SpecificUsersHandler)
	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/", ctx.SpecificSessionsHandler)

	// Proxy routes
	// mux.Handle("/v1/teams", schedulesProxy)
	// mux.Handle("/v1/teams/", schedulesProxy)

	// Wrap CORS and serve
	wrappedMux := handlers.NewHeaderHandler(mux)

	// Listen and serve
	log.Printf("Gateway server is listening at port %s", addr)
	log.Fatal(http.ListenAndServeTLS(addr, TLSCERT, TLSKEY, wrappedMux))
}
