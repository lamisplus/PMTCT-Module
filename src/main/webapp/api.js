export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIsUkRFIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzg4NTQ5NDA1fQ.34LFM2aychC4XPrwXr-YDsZcR0n0GNvcv9KR-qEgsI-PFAwoThvUCluo1mjUI9n0n9vP-y7G2ZNnHgPBObahcQ"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
