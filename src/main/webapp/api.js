export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM0MDIzNjU3fQ.5qINAuontQm2kjoAVA-qYfSZOX8x2oPV7ruAv7lScHNe5zX9XlVdc2pdEm8fJ95KrNeNqmhyQCE6SXWGYW-Mlw"
    : new URLSearchParams(window.location.search).get("jwt");


   