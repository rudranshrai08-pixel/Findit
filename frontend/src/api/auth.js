export async function send(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('Cannot reach FindIt. Start the backend with npm run api in a second terminal.');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Something went wrong. Please try again.');
  return result;
}

function post(path, data = {}) {
  return send(path, { method: 'POST', body: JSON.stringify(data) });
}

const authApi = {
  register: (account) => post('/api/auth/register', account),
  login: (email, password) => post('/api/auth/login', { email, password }),
  currentUser: () => send('/api/auth/me').then((result) => result.user),
  updateProfile: (profile) => send('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(profile) }),
  changePassword: (data) => send('/api/auth/password', { method: 'PATCH', body: JSON.stringify(data) }),
  myListings: () => send('/api/auth/my-listings').then((result) => result.listings),
  savedIds: () => send('/api/auth/saved').then((result) => result.listingIds),
  updateSavedIds: (listingIds) => send('/api/auth/saved', { method: 'PUT', body: JSON.stringify({ listingIds }) }),
  logout: () => post('/api/auth/logout'),
  forgotPassword: (email) => post('/api/auth/forgot-password', { email }),
  resetPassword: (token, email, password) => post('/api/auth/reset-password', { token, email, password }),
};

export default authApi;


