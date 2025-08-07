export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzU0NTg5MTE1fQ.P6yOHrN1vQh-ZIwBl6OcbxE84dallmz8eCHGNp5aD5aZRTMkAHIFkE1yOXpZ7iuy5bxli8lhjdXlv5-LZfN-XA"
    : new URLSearchParams(window.location.search).get("jwt");


