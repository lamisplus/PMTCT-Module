export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM4MDgwMDIzfQ.-HMBJIPL1k1myrGKXbzke-Z4Gp-oXjnWOMPSQbiAJ9SbF98Bu9ba5FoL8moiU8l5r7rfasK90LnT3kQJuyUFxg"
    : new URLSearchParams(window.location.search).get("jwt");

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
   