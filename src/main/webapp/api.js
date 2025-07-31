export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8789/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzU0MDAwMjI0fQ.QI5Z-6VyIHe6anEj7OfluVZwc6p3F23J2Jvlwpj-k3jQQSeKqWBySCYAtRbOVvBIm8jlYKquGfAuSBU5bc02GQ"
    : new URLSearchParams(window.location.search).get("jwt");


