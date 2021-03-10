export default {
    base: "https://api.schedule.info",
    testbase: "https://api.schedule.info",
    handlers: {
        users: "/users",
        myuser: "/users/me",
        teams: "/teams",
        thisteam: "/teams/{team_id}",
        sessions: "/v1/sessions",
        sessionsMine: "/v1/sessions/mine"
    }
}