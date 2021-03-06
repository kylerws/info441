package main

import (
	"assignments-fixed-kylerws/servers/gateway/handlers"
	"assignments-fixed-kylerws/servers/gateway/models/users"
	"assignments-fixed-kylerws/servers/gateway/sessions"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"
)

// Director is of type Reverse Proxy director func
type Director func(r *http.Request)

// Target holds the url and scheme for the director
type Target struct {
	url    string
	scheme string
}

// CustomDirector takes a target and returns a custom director for reverse proxy
func CustomDirector(target *Target) Director {
	return func(r *http.Request) {
		// Forwarded Header
		r.Header.Add("X-Forwarded-Host", r.Host)

		r.Host = target.url
		r.URL.Host = target.url
		r.URL.Scheme = target.scheme
	}
}

// main is the main entry point for the server
func main() {
	// Read env variables
	addr := os.Getenv("ADDR")
	sessionKey := os.Getenv("SESSIONKEY")
	redisAddr := os.Getenv("REDISADDR")
	DSN := fmt.Sprintf("root:%s@tcp(mysqldb:3306)/mysqldb", os.Getenv("MYSQL_ROOT_PASSWORD"))
	log.Printf("DSN: %s", DSN)

	if len(addr) == 0 {
		addr = ":443"
	}

	if len(redisAddr) == 0 {
		redisAddr = "127.0.0.1:6379"
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

	redisDB := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	sessionStore := sessions.NewRedisStore(redisDB, time.Hour)

	userStore, err := users.NewMySQLStore(DSN)
	if err != nil {
		log.Printf("Unable to open sql database %v", err)
	}

	contextHandler := &handlers.HandlerContext{
		SigningKey:   sessionKey,
		SessionStore: sessionStore,
		UserStore:    userStore,
	}

	// New mux
	mux := http.NewServeMux()
	log.Printf("Cert: %s\nKey: %s", TLSCERT, TLSKEY)
	log.Printf("Server is listening at port %s", addr)

	// Routes
	mux.HandleFunc("v1/summary", handlers.SummaryHandler)
	mux.HandleFunc("/v1/users", contextHandler.UsersHandler)
	mux.HandleFunc("/v1/users/", contextHandler.SpecificUsersHandler)
	mux.HandleFunc("/v1/sessions", contextHandler.SessionsHandler)
	mux.HandleFunc("/v1/sessions/", contextHandler.SpecificSessionsHandler)
	wrappedMux := handlers.NewHeaderHandler(mux)

	log.Fatal(http.ListenAndServeTLS(addr, TLSCERT, TLSKEY, wrappedMux))
}
