export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIiLCJuYW1lIjoiR3Vlc3QgR3Vlc3QiLCJleHAiOjE3NjA3NDYzNDh9.nHl62M1HmtEdqXUMYOGt7dXnDFHR9pO4U-GYDKV1u8winmfVCQvuJqrnhpvaFLdJZO7guybI4_SrCHtVjRuA4g"
    : new URLSearchParams(window.location.search).get("jwt");

    

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";