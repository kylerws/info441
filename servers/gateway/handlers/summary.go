package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"

	"golang.org/x/net/html"
)

//PreviewImage represents a preview image for a page
type PreviewImage struct {
	URL       string `json:"url,omitempty"`
	SecureURL string `json:"secureURL,omitempty"`
	Type      string `json:"type,omitempty"`
	Width     int    `json:"width,omitempty"`
	Height    int    `json:"height,omitempty"`
	Alt       string `json:"alt,omitempty"`
}

//PageSummary represents summary properties for a web page
type PageSummary struct {
	Type        string          `json:"type,omitempty"`
	URL         string          `json:"url,omitempty"`
	Title       string          `json:"title,omitempty"`
	SiteName    string          `json:"siteName,omitempty"`
	Description string          `json:"description,omitempty"`
	Author      string          `json:"author,omitempty"`
	Keywords    []string        `json:"keywords,omitempty"`
	Icon        *PreviewImage   `json:"icon,omitempty"`
	Images      []*PreviewImage `json:"images,omitempty"`
}

// //headerCORS the header tag for origins
// const headerCORS = "Access-Control-Allow-Origin"

// //corsAnyOrigin sets origin to wildcard
// const corsAnyOrigin = "*"

//SummaryHandler handles requests for the page summary API.
//This API expects one query string parameter named `url`,
//which should contain a URL to a web page. It responds with
//a JSON-encoded PageSummary struct containing the page summary
//meta-data.
func SummaryHandler(w http.ResponseWriter, r *http.Request) {
	/*TODO: add code and additional functions to do the following:
	- Add an HTTP header to the response with the name
	 `Access-Control-Allow-Origin` and a value of `*`. This will
	  allow cross-origin AJAX requests to your server.
	- Get the `url` query string parameter value from the request.
	  If not supplied, respond with an http.StatusBadRequest error.
	- Call fetchHTML() to fetch the requested URL. See comments in that
	  function for more details.
	- Call extractSummary() to extract the page summary meta-data,
	  as directed in the assignment. See comments in that function
	  for more details
	- Close the response HTML stream so that you don't leak resources.
	- Finally, respond with a JSON-encoded version of the PageSummary
	  struct. That way the client can easily parse the JSON back into
	  an object. Remember to tell the client that the response content
	  type is JSON.

	Helpful Links:
	https://golang.org/pkg/net/http/#Request.FormValue
	https://golang.org/pkg/net/http/#Error
	https://golang.org/pkg/encoding/json/#NewEncoder
	*/

	// Allow any origin
	// w.Header().Add(headerCORS, corsAnyOrigin)

	// Get url query
	url := r.URL.Query().Get("url")
	if len(url) == 0 {
		http.Error(w, "Specify a url", http.StatusBadRequest)
	}

	// Fetch content
	stream, err := fetchHTML(url)
	if err != nil {
		http.Error(w, err.Error(), 404)
	}

	// Tokenize
	summary, sumErr := extractSummary(url, stream)
	if sumErr != nil {
		http.Error(w, sumErr.Error(), 200)
	}

	// Close stream
	defer stream.Close()

	// Respond with JSON encoded summary
	buffer, mErr := json.Marshal(summary)
	if mErr != nil {
		http.Error(w, mErr.Error(), 500)
	}

	// Set content type
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Write content
	w.Write(buffer)
}

//fetchHTML fetches `pageURL` and returns the body stream or an error.
//Errors are returned if the response status code is an error (>=400),
//or if the content type indicates the URL is not an HTML page.
func fetchHTML(pageURL string) (io.ReadCloser, error) {
	/*TODO: Do an HTTP GET for the page URL. If the response status
	code is >= 400, return a nil stream and an error. If the response
	content type does not indicate that the content is a web page, return
	a nil stream and an error. Otherwise return the response body and
	no (nil) error.

	To test your implementation of this function, run the TestFetchHTML
	test in summary_test.go. You can do that directly in Visual Studio Code,
	or at the command line by running:
		go test -run TestFetchHTML

	Helpful Links:
	https://golang.org/pkg/net/http/#Get
	*/
	resp, err := http.Get(pageURL)

	// If err
	if err != nil {
		return nil, err
	}

	// Check response status code
	if resp.StatusCode == http.StatusNotFound {
		return nil, errors.New("Page not found")
	}

	// Check response content type
	ctype := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(ctype, "text/html") {
		return nil, errors.New("Content type is not a webpage")
	}

	return resp.Body, nil
}

//extractSummary tokenizes the `htmlStream` and populates a PageSummary
//struct with the page's summary meta-data.
func extractSummary(pageURL string, htmlStream io.ReadCloser) (*PageSummary, error) {
	/*TODO: tokenize the `htmlStream` and extract the page summary meta-data
	according to the assignment description.

	To test your implementation of this function, run the TestExtractSummary
	test in summary_test.go. You can do that directly in Visual Studio Code,
	or at the command line by running:
		go test -run TestExtractSummary

	Helpful Links:
	https://drstearns.github.io/tutorials/tokenizing/
	http://ogp.me/
	https://developers.facebook.com/docs/reference/opengraph/
	https://golang.org/pkg/net/url/#URL.ResolveReference
	*/

	// New tokenizer
	tokenizer := html.NewTokenizer(htmlStream)

	// PageSummary
	summary := &PageSummary{}

	// Flag for title
	titleFound := false

	// Current img to build
	currImg := &PreviewImage{}

	// Flag for image full
	imgHasContent := false

	// Tokenize
Loop:
	for {
		// Get the next token type
		tokenType := tokenizer.Next()

		// Process token according to the token type
		switch tokenType {
		case html.ErrorToken:
			// Get error
			err := tokenizer.Err()

			// If end of file, return summary
			if err == io.EOF {
				break Loop
			}

			// Else bad HTML, return error
			return summary, err
		case html.StartTagToken, html.SelfClosingTagToken:
			// Get token
			token := tokenizer.Token()

			// If meta tag
			if token.Data == "meta" {
				// Get field type and content
				field, content := extractMeta(token)

				if strings.HasPrefix(field, "og:image") {
					// If global image is populated and its a new og:image
					if imgHasContent && field == "og:image" {
						// If first time, initialize array
						if summary.Images == nil {
							summary.Images = []*PreviewImage{}
						}

						// handle rel path
						if strings.HasPrefix(currImg.URL, "/") {
							currImg.URL = handleRelPath(pageURL, currImg.URL)
						}

						// add to summary struct
						summary.Images = append(summary.Images, currImg)

						// new image to global
						currImg = &PreviewImage{}
					}

					extractImg(token, currImg)

					// If it didn't have content, now it does
					if !imgHasContent {
						imgHasContent = true
					}
				}

				if field == "og:title" {
					titleFound = true
				}

				// Add field to page summary
				setSummaryField(field, content, summary)
			}

			// If title tag
			if token.Data == "title" && !titleFound {
				tokenType = tokenizer.Next() // next token is the text
				if tokenType == html.TextToken {
					setSummaryField("og:title", tokenizer.Token().Data, summary)
				}
			}

			// If link tag
			if token.Data == "link" {
				icon, err := extractIcon(token, summary)
				if err == nil {
					// Handle rel path
					if strings.HasPrefix(icon.URL, "/") {
						icon.URL = handleRelPath(pageURL, icon.URL)
					}

					summary.Icon = icon
				}
			}
		}
	}

	///// Exit point /////

	// Add last picture
	if imgHasContent {
		if summary.Images == nil {
			summary.Images = []*PreviewImage{}
		}

		// handle rel path
		if strings.HasPrefix(currImg.URL, "/") {
			currImg.URL = handleRelPath(pageURL, currImg.URL)
		}

		summary.Images = append(summary.Images, currImg)
	}

	// Return page summary
	return summary, nil
}

// handleRelPath takes a relative path and returns an absolute path
func handleRelPath(baseURL string, relativePath string) string {
	absPath := ""
	array := strings.Split(baseURL, "/")
	if len(array) > 0 {
		currentEnd := array[len(array)-1]
		if strings.Contains(currentEnd, ".") {
			array[len(array)-1] = relativePath
		}
	}

	absPath += array[0]
	for i := 1; i < len(array)-1; i++ {
		absPath += ("/" + array[i])
	}
	absPath += relativePath

	return absPath
}

// extractMeta takes a token for a meta tag
// returns the tags field type and content
func extractMeta(t html.Token) (string, string) {
	// Return vals
	field, content := "", ""

	// Loop through attributes
	for _, attr := range t.Attr {
		// If attr is property
		if attr.Key == "property" || attr.Key == "name" {
			field = attr.Val
		}

		// If img
		if attr.Key == "property" && strings.HasPrefix(attr.Val, "og:image") {
			return attr.Val, ""
		}

		// If attr is content
		if attr.Key == "content" {
			content = attr.Val
		}
	}

	return field, content
}

// extractIcon takes a token and returns a PreviewImage for icon
func extractIcon(t html.Token, ps *PageSummary) (*PreviewImage, error) {
	img := &PreviewImage{}

	for _, attr := range t.Attr {
		// Check if this is an icon
		if attr.Key == "rel" && attr.Val != "icon" {
			return nil, errors.New("Link tag is not an icon")
		}

		// Stores data
		data := attr.Val

		// Set img field
		setPreviewImgField(attr.Key, data, img)
	}

	return img, nil
}

// extractImg takes a token and tockenizer
// returns a PreviewImage for an OG image
func extractImg(t html.Token, img *PreviewImage) {
	// img.URL = "!!!!!!!!extractImg"

	// Flag for PreviewImage field and value to be set
	field, data := "", ""

	// Loop through attributes
	for _, attr := range t.Attr {
		// Get field
		if attr.Key == "property" {
			props := strings.Split(attr.Val, ":")
			field = props[len(props)-1]
		}

		// Get data
		if attr.Key == "content" {
			data = attr.Val
		}
	}

	// Set attributes
	setPreviewImgField(field, data, img)
}

// setPreviewImg takes a *PreviewImage and sets the specified field
// string f - the field to set
// string data - the field data
// *PreviewImage img - pointer for the PreviewImage
func setPreviewImgField(f string, data string, img *PreviewImage) {
	switch f {
	case "image", "url", "href":
		img.URL = data
	case "secure_url":
		img.SecureURL = data
	case "type":
		img.Type = data
	case "width":
		d, _ := strconv.Atoi(data)
		img.Width = d
	case "height":
		d, _ := strconv.Atoi(data)
		img.Height = d
	case "alt":
		img.Alt = data
	case "sizes": // Special case for icon image
		if data == "any" {
			img.Height, img.Width = 0, 0 // if SVG, set h and w to 0
		} else {
			dim := strings.Split(data, "x") // else, parse string

			// Convert to ints and set
			h, _ := strconv.Atoi(dim[0])
			w, _ := strconv.Atoi(dim[1])
			img.Height, img.Width = h, w
		}

	}
}

// setSummaryField takes a *PageSummary and sets the specified field
// string f - the field to set
// string data - the field data
// *PageSummary ps - pointer for the PageSummary
func setSummaryField(f string, data string, ps *PageSummary) {
	switch f {
	case "og:type":
		ps.Type = data
	case "og:url":
		ps.URL = data
	case "og:title":
		ps.Title = data
	case "og:site_name":
		ps.SiteName = data
	case "og:description":
		ps.Description = data
	case "description":
		if ps.Description == "" {
			ps.Description = data
		}
	case "author":
		ps.Author = data
	case "keywords":
		// Split strings on commas
		keywords := strings.Split(data, ",")

		// Trim whitespace
		for i, keyword := range keywords {
			keywords[i] = strings.TrimSpace(keyword)
		}

		ps.Keywords = keywords
	}
}
