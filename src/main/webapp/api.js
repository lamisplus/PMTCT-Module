export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ4OTc2NDY5fQ.T1ykgKSkbSiHxWE6MQrrJ7HWFdPDd_xLB1Dle_zWZhOqtZUf2OJonooJmo5B4a5JAIIfEJmv_oUNcGhjnkzyQQ"
    : new URLSearchParams(window.location.search).get("jwt");


   