import { loadComments } from './comments.js';
import { renderComments } from './render.js';
import { initEventHandlers } from './init.js';
import { API_URL } from './config.js';

export function setCommentsLoading(isLoading) {
  const commentsList = document.getElementById('comments-list');
  const loader = document.getElementById('comments-loader');
  
  if (!loader) {
    const container = document.getElementById('comments-container');
    const newLoader = document.createElement('div');
    newLoader.id = 'comments-loader';
    newLoader.className = 'loader';
    newLoader.textContent = 'Загрузка комментариев...';
    container.appendChild(newLoader);
  }
  
  const loaderElement = document.getElementById('comments-loader');
  if (isLoading) {
    commentsList.classList.add('hidden');
    loaderElement.classList.remove('hidden');
  } else {
    commentsList.classList.remove('hidden');
    loaderElement.classList.add('hidden');
  }
}

export function setSendingLoading(isLoading) {
  const addForm = document.getElementById('add-form-container');
  const sendingLoader = document.getElementById('sending-loader');
  
  if (!sendingLoader && isLoading) {
    const container = document.querySelector('.container');
    const newLoader = document.createElement('div');
    newLoader.id = 'sending-loader';
    newLoader.className = 'sending-loader hidden';
    newLoader.textContent = 'Комментарий добавляется...';
    container.appendChild(newLoader);
  }
  
  const loaderElement = document.getElementById('sending-loader');
  if (isLoading) {
    addForm.classList.add('hidden');
    loaderElement.classList.remove('hidden');
  } else {
    addForm.classList.remove('hidden');
    loaderElement.classList.add('hidden');
  }
}

function validateComment(name, text) {
  const trimmedName = name.trim();
  const trimmedText = text.trim();
  
  if (trimmedName.length < 3 || trimmedText.length < 3) {
    alert('Имя и комментарий должны быть не короче 3 символов');
    return false;
  }
  
  return true;
}

async function addComment(name, text, forceError = false) {
  const trimmedName = name.trim();
  const trimmedText = text.trim();

  if (!validateComment(name, text)) {
    throw new Error('Validation failed');
  }

  try {
    const body = {
      name: trimmedName,
      text: trimmedText,
    };
    
    if (forceError) {
      body.forceError = true;
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(body),
    });

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
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Нет интернета');
    }
    throw error;
  }
}

async function addCommentWithRetry(name, text, retryCount = 0) {
  try {
    return await addComment(name, text, retryCount > 0);
  } catch (error) {
    if (error.message === 'Ошибка сервера' && retryCount < 3) {
      alert(`Сервер временно недоступен. Повторная попытка ${retryCount + 1} из 3...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return addCommentWithRetry(name, text, retryCount + 1);
    }
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const nameInput = document.getElementById('name-input');
  const commentInput = document.getElementById('comment-input');
  const addButton = document.getElementById('add-button');

  initEventHandlers();

  setCommentsLoading(true);
  
  try {
    await loadComments();
    renderComments();
  } catch (error) {
    if (error.message === 'Нет интернета') {
      alert('Кажется, у вас сломался интернет, попробуйте позже');
    } else if (error.message === 'Ошибка сервера') {
      alert('Сервер сломался, попробуй позже');
    } else {
      alert(error.message);
    }
  } finally {
    setCommentsLoading(false);
  }

  const handleAddComment = async () => {
    const nameValue = nameInput.value;
    const commentValue = commentInput.value;
    
    setSendingLoading(true);
    
    try {
      await addCommentWithRetry(nameValue, commentValue);
      await loadComments();
      renderComments();
      
      nameInput.value = '';
      commentInput.value = '';
      nameInput.focus();
    } catch (error) {
      if (error.message === 'Validation failed') {
        return;
      } else if (error.message === 'Нет интернета') {
        alert('Кажется, у вас сломался интернет, попробуйте позже');
      } else if (error.message === 'Ошибка сервера') {
        alert('Сервер сломался, попробуй позже');
      } else {
        alert(error.message || 'Не удалось добавить комментарий');
      }
      // Форма НЕ очищается, данные остаются
    } finally {
      setSendingLoading(false);
    }
  };

  addButton.addEventListener('click', handleAddComment);

  commentInput.addEventListener('keydown', async (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      await handleAddComment();
    }
  });
});