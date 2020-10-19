import request from '@/utils/request'

const api = {
  user: '/v1/user',
  permission: '/v1/per',
  cust: '/v1/cust',
  company: '/v1/company',
  role: '/v1/role'
}

export default api

export function getUserList (parameter) {
  return request({
    url: api.user + '/ding/pageByExample',
    method: 'get',
    params: parameter
  })
}
export function getCustomers (param) {
  return request({
    url: api.cust + '/authId/' + param,
    method: 'get'
  })
}
export function getCompanys (param) {
  return request({
    url: api.company + '/authId/' + param,
    method: 'get'
  })
}

export function getUserByRoleId (param) {
  return request({
    url: api.user + '/roleId/' + param,
    method: 'get'
  })
}
export function getPermissionByRoleId (param) {
  return request({
    url: api.permission + '/roleId/' + param,
    method: 'get'
  })
}

export function getPermission (parameter) {
  return request({
    url: api.permission + '/pageByExample',
    method: 'get',
    params: parameter
  })
}
export function savePermission (parameter) {
  return request({
    url: api.permission,
    method: 'Post',
    params: parameter
  })
}
export function grantPermission (parameter) {
  return request({
    url: api.permission + '/grant',
    method: 'Post',
    params: parameter
  })
}

export function grantUsers (parameter) {
  return request({
    url: api.role + '/users',
    method: 'Post',
    params: parameter
  })
}
export function grantPermissions (parameter) {
  return request({
    url: api.role + '/permissions',
    method: 'Post',
    params: parameter
  })
}
export function getRoleList (parameter) {
  return request({
    url: api.role + '/pageByExample',
    method: 'get',
    params: parameter
  })
}

export function saveRole (parameter) {
  return request({
    url: api.role,
    method: 'Post',
    params: parameter
  })
}
