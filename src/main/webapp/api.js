export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzUzNzE4MDAyfQ.DivxeUI-EXDaQ35aOCTTjTzYHShVOu-Q_8Z151VfUo0duEbnP9S6-Xul4dgsvYWh-z3Pnrda88b8wVNh27bfng"
    : new URLSearchParams(window.location.search).get("jwt");


   