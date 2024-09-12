export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJuyhygyhIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzI1NTU5NDExfQ.LJf-O9gNZR8ZhOjKoENBbYP8Ca68p_5i66cimdIg4PRjn7JtedU4p1h7i1wRU4ircQFw-ymwXtz_myLyhVyRyA"
    : new URLSearchParams(window.location.search).get("jwt");

