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

async function addComment(name, text) {
  const trimmedName = name.trim();
  const trimmedText = text.trim();

  if (trimmedName.length < 3 || trimmedText.length < 3) {
    alert('Имя и текст должны содержать не менее 3 символов');
    return false;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      name: trimmedName,
      text: trimmedText,
    }),
  });

  if (response.status === 400) {
    const errorData = await response.json();
    alert(errorData.error);
    return false;
  }

  if (!response.ok) {
    alert('Не удалось добавить комментарий');
    return false;
  }

  await loadComments();
  renderComments();

  return true;
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
    alert(error.message);
  } finally {
    setCommentsLoading(false);
  }

  addButton.addEventListener('click', async () => {
    setSendingLoading(true);
    
    const success = await addComment(nameInput.value, commentInput.value);

    setSendingLoading(false);
    
    if (success) {
      nameInput.value = '';
      commentInput.value = '';
      nameInput.focus();
    }
  });

  commentInput.addEventListener('keydown', async (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
      setSendingLoading(true);
      
      const success = await addComment(nameInput.value, commentInput.value);

      setSendingLoading(false);
      
      if (success) {
        nameInput.value = '';
        commentInput.value = '';
        nameInput.focus();
      }
    }
  });
});