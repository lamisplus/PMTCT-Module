export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzMxMDg3ODM4fQ.87tXguVFkQ4U7KrDaJt1oaHP41k7_bpcWvb-5vphAP8yZmZ85rA8Owwygynw6KOrP2YipK6t655D5UNUCNr7QQ"
    : new URLSearchParams(window.location.search).get("jwt");

