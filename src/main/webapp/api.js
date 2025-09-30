export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIiLCJuYW1lIjoiR3Vlc3QgR3Vlc3QiLCJleHAiOjE3NTkyNzAyMTd9.Kc6SVpk4dHFZdEaby0gO0zmHS0oTcaHpPbZrP-P-riPreFSSUOJ1MAD-qtw3BkrQWcMIOuaU5ysbcojXLTmPtA"
    : new URLSearchParams(window.location.search).get("jwt");

    

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";