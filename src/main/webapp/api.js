export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJlY2V3c0FDRTUiLCJhdXRoIjoiU3VwZXIgQWRtaW4sUkRFIiwibmFtZSI6IkVDRVdTIEFDRTUiLCJleHAiOjE3Njc1OTY1OTJ9.wMiA48RU1aaJ0pcqC1tT5yVqCgMt-ZlWlBZ-ODVy7xE4sgkrqOXJGP1losn9oeNAxfwz1TpINI_whNkw0Xv4Kw"
    : new URLSearchParams(window.location.search).get("jwt");

export const wsUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";

