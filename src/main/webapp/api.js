export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFJERSIsIm5hbWUiOiJHdWVzdCBHdWVzdCIsImV4cCI6MTc3OTAzMDczNn0.t-AOBss9oTqo-wxKTaZQVwYBD64xJrQLmggKF6V1kKBx8338WtHcJcsVdkASflDiInbzcpZjQrSsFmAFzTFkUA"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
