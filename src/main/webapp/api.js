export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzU0MDU2OTM1fQ.2WRrJ_oAhh0zZ43bM86uUcbenHfGqhrJXT3_lHgtDC2wqjftEIeiLPck-R5IzNvsmVRtilYUcjHmZy0VoC3XDQ"
    : new URLSearchParams(window.location.search).get("jwt");


   