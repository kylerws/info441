export default {
    base: "https://api.scheduleup.info",
    testbase: "https://api.scheduleup.info",
    handlers: {
        users: "/users",
        myuser: "/users/me",
        schedule: "/v1/schedule",
        teams: "/v1/teams",
        thisteam: "/v1/teams/{team_id}",
        sessions: "/sessions",
        sessionsMine: "/sessions/mine"
    }
}