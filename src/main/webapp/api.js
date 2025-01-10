export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
<<<<<<< HEAD
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM2NTI1MjI0fQ.rzCD1Cg3st71ku-CW09pvo4f6U_UodmhVwwOuxB-xlY7USlsfte7grwNveUn-VwXe616DJ3hLPubFzTpHEJ1-g"
=======
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM2NDQ3MTE0fQ.4X40rNbgZhNZL18z-0KlslhkN9Z8lXT9HQbmICWWCGaO6JaHWXWRK9r9qlCWVLSqk9hrhZjgiDbE6uxK9bl2Tg"
>>>>>>> cad298ab11d6080c461f98b8225a517c1ca72fb6
    : new URLSearchParams(window.location.search).get("jwt");

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
   