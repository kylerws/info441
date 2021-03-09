package main

import (
	"log"
	"net/http"
	"time"
)

func baseHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("baseHandler called at %s", time.Now())
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Successfully connected to HTTPS"))
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("testHandler called at %s", time.Now())
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Successfully connected to route"))
}

// main is the main entry point for the server
func main() {
	// Https connection
	addr := ":443"

	// Cert locations
	TLSCERT := "/etc/letsencrypt/live/api.scheduleup.info/fullchain.pem"
	TLSKEY := "/etc/letsencrypt/live/api.scheduleup.info/privkey.pem"

	// New mux
	mux := http.NewServeMux()

	// Routes
	mux.HandleFunc("/", baseHandler)
	mux.HandleFunc("/v1/test", testHandler)

	// Listen and serve
	log.Printf("Gateway server is listening at port %s", addr)
	log.Fatal(http.ListenAndServeTLS(addr, TLSCERT, TLSKEY, mux))
}
