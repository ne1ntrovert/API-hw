import { USER_API_URL, LOGIN_API_URL, TOKEN_KEY, USER_KEY } from './config.js';

export async function registerUser(login, name, password) {
  try {
    const response = await fetch(USER_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        login: login,
        name: name,
        password: password,
      }),
    });

    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.error || 'Пользователь с таким логином уже существует');
    }

    if (!response.ok) {
      throw new Error('Ошибка при регистрации');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Нет интернета');
    }
    throw error;
  }
}

export async function loginUser(login, password) {
  try {
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        login: login,
        password: password,
      }),
    });

    if (response.status === 400) {
      throw new Error('Неверный логин или пароль');
    }

    if (!response.ok) {
      throw new Error('Ошибка при авторизации');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Нет интернета');
    }
    throw error;
  }
}

export function saveUserData(user) {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify({
    id: user.id,
    login: user.login,
    name: user.name,
  }));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getToken() !== null && getUser() !== null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthHeaders() {
  const token = getToken();
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}