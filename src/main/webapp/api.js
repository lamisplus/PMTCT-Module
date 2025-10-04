export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluLFVzZXIiLCJuYW1lIjoiR3Vlc3QgR3Vlc3QiLCJleHAiOjE3NTk0MjgzNTZ9.IW5Ypt5LgOB9mPoKfwcxofB4ezzzTjObk8yTyn9XzCArDFMV_Jmh4iK-W5aqePsEIn-TFTvBrjsgA-i2yQKspA"
    : new URLSearchParams(window.location.search).get("jwt");

    

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";