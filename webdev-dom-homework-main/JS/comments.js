import { API_URL } from './config.js';
import { getToken } from './auth.js';

export let comments = [];

export async function loadComments() {
  try {
    const response = await fetch(API_URL);

    if (response.status === 500) {
      throw new Error('Ошибка сервера');
    }

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    const data = await response.json();

    comments = data.comments.map((comment) => ({
      id: comment.id,
      name: comment.author.name,
      date: formatDateFromISO(comment.date),
      text: comment.text,
      likes: comment.likes,
      isLiked: comment.isLiked || false,
      isLikeLoading: false,
    }));
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Нет интернета');
    }
    throw error;
  }
}

export async function addCommentToAPI(text, forceError = false) {
  const token = getToken();
  
  const body = {
    text: text.trim(),
  };
  
  if (forceError) {
    body.forceError = true;
  }
  
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    throw new Error('Не авторизован');
  }

  if (response.status === 400) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка валидации');
  }
  
  if (response.status === 500) {
    throw new Error('Ошибка сервера');
  }

  if (!response.ok) {
    throw new Error('Не удалось добавить комментарий');
  }

  return await response.json();
}

export function formatDateFromISO(isoString) {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}