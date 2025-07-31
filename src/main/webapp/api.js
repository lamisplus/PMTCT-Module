export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUzOTc5MTgwfQ.jWTr4DpOFgrTvixql2gzHqKMB8x_mG99QCZDLHodD7kyk7FHp9-I9bGzlqDljJNWzEB_Hnv4tmF3VP1p4r8q_Q"
    : new URLSearchParams(window.location.search).get("jwt");


   