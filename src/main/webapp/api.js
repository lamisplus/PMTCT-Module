export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzQ3ODY1OTcwfQ.dPjsNfhVoDPKzeO-sfjeaApopok36bSYb3ilD08__TlJfG_ZoyDumy_XKw7SGF5YUggHC7MtDHRlW9iB8fVt2Q"
    : new URLSearchParams(window.location.search).get("jwt");


   