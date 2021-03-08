package main

import (
	"fmt"
	"info441/servers/gateway/directors"
	"info441/servers/gateway/handlers"
	"info441/servers/gateway/models/users"
	"info441/servers/gateway/sessions"
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"time"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"
)

// main is the main entry point for the server
func main() {
	// Read env variables
	addr := os.Getenv("ADDR")
	sessionKey := os.Getenv("SESSIONKEY")
	redisAddr := os.Getenv("REDISADDR")
	DSN := fmt.Sprintf("root:%s@tcp(mysqldb:3306)/mysqldb", os.Getenv("MYSQL_ROOT_PASSWORD"))
	messagesAddr := os.Getenv("MESSAGESADDR")
	summaryAddr := os.Getenv("SUMMARYADDR")

	if len(addr) == 0 {
		addr = ":443"
	}

	if len(redisAddr) == 0 {
		redisAddr = "127.0.0.1:6379"
	}

	if len(DSN) == 0 {
		DSN = fmt.Sprintf("root:%s@tcp(mysqldb:3306)/mysqldb", "info441")
	}

	// Path to TLS public certificate
	TLSCERT := os.Getenv("TLSCERT")
	if len(TLSCERT) == 0 {
		log.Fatal("No TLSCERT environment variable found")
	}

	// Path to TLS private key
	TLSKEY := os.Getenv("TLSKEY")
	if len(TLSKEY) == 0 {
		log.Fatal("No TLSKEY environment variable found")
	}

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

	// Get reverse proxy targets
	messageTargets := directors.GetTargets(messagesAddr)
	summaryTargets := directors.GetTargets(summaryAddr)

	// Set up proxies
	summaryProxy := &httputil.ReverseProxy{Director: directors.CustomDirector(summaryTargets, ctx)}
	messageProxy := &httputil.ReverseProxy{Director: directors.CustomDirector(messageTargets, ctx)}

	// New mux
	mux := http.NewServeMux()

	log.Printf("Messaging server addresses: %s", messagesAddr)
	log.Printf("Processed to: %v", messageTargets[0])

	// Routes
	mux.HandleFunc("/v1/users", ctx.UsersHandler)
	mux.HandleFunc("/v1/users/", ctx.SpecificUsersHandler)
	mux.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/", ctx.SpecificSessionsHandler)

	// Proxy routes
	mux.Handle("/v1/summary", summaryProxy)
	mux.Handle("/v1/channels", messageProxy)
	mux.Handle("/v1/channels/", messageProxy)
	mux.Handle("/v1/messages/", messageProxy)

	// Wrap CORS and serve
	wrappedMux := handlers.NewHeaderHandler(mux)

	// Listen and serve
	log.Printf("Gateway server is listening at port %s", addr)
	log.Fatal(http.ListenAndServeTLS(addr, TLSCERT, TLSKEY, wrappedMux))
}
