export const url = process.env.NODE_ENV === "development"
  ? "http://localhost:8585/api/v1/"
  : "/api/v1/";
export const token = process.env.NODE_ENV === "development"
  ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzA5MjQ3NzIwfQ.AhdYocerAiXYKno1IheGuLpA6ID4L2xJTS-U4ernZdb3jOEk8UI5UsXI5gq6Z1ukL6tQQDQ-N2nnzMce8A8Pew"
  : new URLSearchParams(window.location.search).get("jwt");
