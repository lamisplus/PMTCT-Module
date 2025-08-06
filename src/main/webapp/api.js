export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzU0NDk5OTE2fQ.fODwsAuaE2v0HTAzqV6hzk5IGQigzWsCuKfMht3seIxvZHoPrev0dzG60BCRuJ23qNMigc5wrlc1KZ7_wyjrIQ"
    : new URLSearchParams(window.location.search).get("jwt");


