export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUxNjg5NDM3fQ.n8iDLv1FvB2BvI3ysDLbM3B8QA9rPleOgzvPhXi5HBqUvo12IAEdu05FvUsDUx2fgXATu05yIq9Goyyzn6iOkw"
    : new URLSearchParams(window.location.search).get("jwt");


   