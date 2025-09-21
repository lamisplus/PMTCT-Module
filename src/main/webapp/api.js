export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzU4NDA5ODUzfQ.A1KqjxxGjgdKLx_VIhnUHKIG-2qkjmNpe_dEzdBHfLGFlAjzkaBYeX2-Et5JU0K2Q8_38j9uMke1FHN5LN-8CQ"
    : new URLSearchParams(window.location.search).get("jwt");

    

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";