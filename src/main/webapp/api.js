export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUzODk0NTI1fQ.21V76rbBLXJ60Dv6YttBa0SwLczKQXqqoFUJKeNYu-i3MvoVW2k-V7NMWYYrnX3D130dRPxN08QQ8Ei_YcfdTg"
    : new URLSearchParams(window.location.search).get("jwt");


   