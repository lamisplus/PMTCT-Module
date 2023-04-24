export const  token = (new URLSearchParams(window.location.search)).get("jwt")
export const url = '/api/v1/'
// export const url =  'http://localhost:9090/api/v1/';
// export const  token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNjgyMzYxMDM2fQ.csauKx1U0y9o7hefyJREzMXt3DkB_d8meBAex8dNcyV3R6WdzIGjGWVY8qPHj1AJ1bCL5lVExkff1S0RANlLOA'