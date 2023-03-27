export const  token = (new URLSearchParams(window.location.search)).get("jwt")
export const url = '/api/v1/'
// export const url =  'http://localhost:8383/api/v1/';
// export const  token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJndWVzdEBsYW1pc3BsdXMub3JnIiwiYXV0aCI6IlN1cGVyIEFkbWluIiwibmFtZSI6Ikd1ZXN0IEd1ZXN0IiwiZXhwIjoxNjc5OTU5NjcyfQ.4r7nCpuH27fLvktTmE4ZnIuDS6Y45gNEqNRcyiaLJkkRTMgXGE_wqZu0r0FJtoqB_l1HKTixWST5ZXK_JdylUg'