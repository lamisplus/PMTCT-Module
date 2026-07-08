export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFJERSIsIm5hbWUiOiJHdWVzdCBHdWVzdCIsImV4cCI6MTc4MzM1MTc0OH0.ICLFTVLaixfYBX31Gr25FQGYpCZD9PYT4AOSu06ktaN7Bj1eu8k2oPd3ajdn2ZzOqtQTvTG8foPCPzr43oMxzw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
