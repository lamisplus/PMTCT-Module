export const  token = (new URLSearchParams(window.location.search)).get("jwt")
export const url = '/api/v1/'
// export const url =  'http://localhost:8383/api/v1/';
// export const  token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNjc1NDI4NDc1fQ.dtln0_USxJJ1FfQ079Rl-g_EZWcAQwcQnw2lziNq5msGSNjA90zrUzvlzdb4jVVt2bsnuZmUOJaY7ALqYbSjrg'