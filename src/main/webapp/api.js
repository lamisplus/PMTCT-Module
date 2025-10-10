export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIiLCJuYW1lIjoiR3Vlc3QgR3Vlc3QiLCJleHAiOjE3NjAxMTY2NTB9.qX_0TrssBUwH3kjcwY28zlwbilBRXxZ2g2QMhwb_kAUkOp_ndZchhjC7YuC1nJFJlen7JjENgw3S4ckwpvOesg"
    : new URLSearchParams(window.location.search).get("jwt");

    

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";