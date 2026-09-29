import api from '../../util/api.js';
export const githubRequest = (method, path, data) => api.request({
  method, url: `/github${path}`, data, timeout: 120000,
  headers: { Authorization: `Bearer ${sessionStorage.getItem('userToken') || ''}` },
});
export async function connectGithub() {
  const { data } = await githubRequest('post', '/connect');
  sessionStorage.setItem('github-oauth-state', data.state);
  window.location.assign(data.url);
}
