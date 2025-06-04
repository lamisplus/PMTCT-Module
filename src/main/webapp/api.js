export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ5MDU5Njk4fQ.uj2ii01z-gA53ym8W83JR3JCHK_KVB3mD3PySiwl9ZTJQOWbaMISIa4RZsUEVP97gkeHL1XePn-593ZdFub7Pw"
    : new URLSearchParams(window.location.search).get("jwt");

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
   