export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ1NTIzODU0fQ.YqcVYBgA6Vd0N_kzPbOJMsjRrWyW59HG_X28SalT573vERm9shz_msJXrSSOhyWsNsMeRZ5tr6w9Ow8_xHemLQ"
    : new URLSearchParams(window.location.search).get("jwt");


   