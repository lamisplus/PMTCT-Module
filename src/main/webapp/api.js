export const url = process.env.NODE_ENV === "development"
  ? "http://localhost:8585/api/v1/"
  : "/api/v1/";
export const token = process.env.NODE_ENV === "development"
  ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzA5MjIyOTY5fQ.PZLI2S4ukLhrPv2Fh9SUDmtGcBim2XazZ2I6roi7CkVx9frw3ZzLdMPpkaNJ0JgPlLoUFQr_13ZbGMCsW8KCAw"
  : new URLSearchParams(window.location.search).get("jwt");
