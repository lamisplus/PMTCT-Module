export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM2NDQ3MTE0fQ.4X40rNbgZhNZL18z-0KlslhkN9Z8lXT9HQbmICWWCGaO6JaHWXWRK9r9qlCWVLSqk9hrhZjgiDbE6uxK9bl2Tg"
    : new URLSearchParams(window.location.search).get("jwt");

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
   