export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ1MzM5Njc0fQ.GH1w4GWJIDvhuXsE3-tcE6gxRfetgotQHwz1DzXpXasrKkrsFQ47Qz0aL5eTHH5BHh_wR6Wc7laXDCAPbfB1_g"
    : new URLSearchParams(window.location.search).get("jwt");


   