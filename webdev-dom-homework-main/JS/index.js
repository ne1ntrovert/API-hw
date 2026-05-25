import { loadComments, addCommentToAPI } from './comments.js';
import { renderComments } from './render.js';
import { initEventHandlers } from './init.js';
import { isAuthenticated, getUser, logout } from './auth.js';
import { renderLoginPage } from './login.js';

function setCommentsLoading(isLoading) {
  const commentsList = document.getElementById('comments-list');
  const loader = document.getElementById('comments-loader');
  
  if (isLoading) {
    if (commentsList) commentsList.classList.add('hidden');
    if (loader) loader.classList.remove('hidden');
  } else {
    if (commentsList) commentsList.classList.remove('hidden');
    if (loader) loader.classList.add('hidden');
  }
}

function setSendingLoading(isLoading) {
  const addForm = document.getElementById('add-form-container');
  const sendingLoader = document.getElementById('sending-loader');
  
  if (isLoading) {
    if (addForm) addForm.classList.add('hidden');
    if (sendingLoader) sendingLoader.classList.remove('hidden');
  } else {
    if (addForm) addForm.classList.remove('hidden');
    if (sendingLoader) sendingLoader.classList.add('hidden');
  }
}

function validateComment(text) {
  const trimmedText = text.trim();
  
  if (trimmedText.length < 3) {
    alert('Комментарий должен быть не короче 3 символов');
    return false;
  }
  
  return true;
}

async function addCommentWithRetry(text, retryCount = 0) {
  try {
    return await addCommentToAPI(text, retryCount > 0);
  } catch (error) {
    if (error.message === 'Ошибка сервера' && retryCount < 3) {
      alert(`Сервер временно недоступен. Повторная попытка ${retryCount + 1} из 3...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return addCommentWithRetry(text, retryCount + 1);
    }
    throw error;
  }
}

function renderAddForm() {
  const user = getUser();
  const container = document.querySelector('.container');
  const existingForm = document.getElementById('add-form-container');
  
  if (existingForm) existingForm.remove();
  
  const addFormHtml = `
    <div class="add-form" id="add-form-container">
      <input
        type="text"
        class="add-form-name"
        value="${user?.name || ''}"
        id="name-input"
        readonly
      />
      <textarea
        type="textarea"
        class="add-form-text"
        placeholder="Введите ваш комментарий"
        rows="4"
        id="comment-input"
      ></textarea>
      <div class="add-form-row">
        <button class="add-form-button" id="add-button">Написать</button>
      </div>
    </div>
    <div id="sending-loader" class="sending-loader hidden">Комментарий добавляется...</div>
  `;
  
  container.insertAdjacentHTML('beforeend', addFormHtml);

  const addButton = document.getElementById('add-button');
  const commentInput = document.getElementById('comment-input');
  
  if (addButton) {
    const handleAddComment = async () => {
      const commentValue = commentInput.value;
      
      if (!validateComment(commentValue)) {
        return;
      }
      
      setSendingLoading(true);
      
      try {
        await addCommentWithRetry(commentValue);
        await loadComments();
        renderComments();
        commentInput.value = '';
        commentInput.focus();
        initEventHandlers();
      } catch (error) {
        if (error.message === 'Не авторизован') {
          alert('Сессия истекла. Пожалуйста, авторизуйтесь снова.');
          logout();
          renderApp();
        } else if (error.message === 'Нет интернета') {
          alert('Кажется, у вас сломался интернет, попробуйте позже');
        } else if (error.message === 'Ошибка сервера') {
          alert('Сервер сломался, попробуй позже');
        } else {
          alert(error.message || 'Не удалось добавить комментарий');
        }
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
  }
}

function renderAuthLink() {
  const container = document.querySelector('.container');
  const existingLink = document.getElementById('auth-link-container');
  
  if (existingLink) existingLink.remove();
  
  const authLinkHtml = `
    <div class="auth-link-container" id="auth-link-container">
      <button class="auth-link" id="auth-link-btn">🔐 Чтобы добавить комментарий, авторизуйтесь</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', authLinkHtml);
  
  const authBtn = document.getElementById('auth-link-btn');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      renderLoginPage();
    });
  }
}

function renderLogoutButton() {
  const container = document.querySelector('.container');
  const existingLogout = document.getElementById('logout-container');
  
  if (existingLogout) existingLogout.remove();
  
  const logoutHtml = `
    <div class="logout-container" id="logout-container">
      <button class="logout-button" id="logout-btn">🚪 Выйти</button>
    </div>
  `;
  
  container.insertAdjacentHTML('afterbegin', logoutHtml);
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      renderApp();
    });
  }
}

export async function renderApp() {
  const container = document.querySelector('.container');
  const isAuth = isAuthenticated();
  
  // Сохраняем базовую структуру
  container.innerHTML = `
    <div id="comments-container">
      <ul class="comments" id="comments-list"></ul>
      <div id="comments-loader" class="loader">Загрузка комментариев...</div>
    </div>
  `;
  
  if (isAuth) {
    renderLogoutButton();
  }
  
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
  
  if (isAuth) {
    renderAddForm();
  } else {
    renderAuthLink();
  }

  setTimeout(() => {
    initEventHandlers();
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});