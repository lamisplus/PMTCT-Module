export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIsUkRFIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzkwMDE3MDQwfQ.T1WHxhYD-EPBHLUZHSTLpoasD5TflnCkqlAfoV6sZas5bfuhE1MWHY2Zc408HCnq88gu1Ow57lehtwYUULC39Q"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
