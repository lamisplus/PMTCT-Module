export const  token = (new URLSearchParams(window.location.search)).get("jwt")
export const url = '/api/v1/'
// export const url =  'http://localhost:8383/api/v1/';
// export const  token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNjc1NTYyODI3fQ.OUIdX5G_6j-FgT1h1Tb3bnYst8MjYTG9vW9rpJHU4_sNuUtX377Vw5sKZEys6QLQX11vMTD-le-FZ3ykNu0BQw'