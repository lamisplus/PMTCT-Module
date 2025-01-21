export const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8383/api/v1/"
    : "/api/v1/";
export const token =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNzM3NDc3NTA1fQ.WfqMfLMoJ7oAamu4EirG__G4YG3ViKBABW8CyBqTLo-Td3rtOO1cD8Oqb70_KaiOcWWxsuTWiROYNQb6wekOQw"
    : new URLSearchParams(window.location.search).get("jwt");

    export const wsUrl = process.env.NODE_ENV === "development"
    ? "http://localhost:8383/websocket"
    : "/websocket";
   