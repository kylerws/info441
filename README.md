# Project Proposal
**Final Project for INFO 441**

**Team Members:** Kyler Sakumoto, Mackenzie Hutchison, Youssof Kowdan & Shruti Kompella

## Project Description

## Technical Description
### Database Diagram

### User Stories

### Endpoints
#### /teams
**POST:** creates a new team

- Request Body

```go
{
  teamName  (team name)
  owner     (user ID of team owner)
  members   (array of user IDs)
}
```
 

- Response Header

  - ```Authorization``` - bearer token with session ID 