package handlers

import "net/http"

// HeaderHandler wraps mux with CORS headers
type HeaderHandler struct {
	Handler http.Handler
}

func (hh *HeaderHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("Access-Control-Max-Age", "600")
	hh.Handler.ServeHTTP(w, r)
}

// NewHeaderHandler wraps mux
func NewHeaderHandler(handlerToWrap http.Handler) *HeaderHandler {
	return &HeaderHandler{handlerToWrap}
}
