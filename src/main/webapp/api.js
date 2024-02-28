export const url = process.env.NODE_ENV === "development"
  ? "http://localhost:8585/api/v1/"
  : "/api/v1/";
export const token = process.env.NODE_ENV === "development"
  ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzA5MTgxODEzfQ.oo7fQc_7QWNVfjwN_9GXY0ficCHkX2G6ksioH5yfSBBtKdyt2YNIHctCjwyF9S9jNCVjUgz22SmV-w6InhuG1w"
  : new URLSearchParams(window.location.search).get("jwt");
