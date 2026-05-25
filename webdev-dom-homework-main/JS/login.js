import { loginUser } from './auth.js';
import { renderApp } from './index.js';

export function renderLoginPage() {
  const container = document.querySelector('.container');
  
  container.innerHTML = `
    <div class="login-container">
      <h1 class="login-title">Вход в аккаунт</h1>
      <form class="login-form" id="login-form">
        <div class="form-group">
          <label for="login-input" class="form-label">Логин</label>
          <input
            type="text"
            id="login-input"
            class="form-input"
            placeholder="Введите ваш логин"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label for="password-input" class="form-label">Пароль</label>
          <input
            type="password"
            id="password-input"
            class="form-input"
            placeholder="Введите ваш пароль"
            autocomplete="current-password"
          />
        </div>
        <div class="login-buttons">
          <button type="submit" class="login-button">Войти</button>
          <button type="button" class="register-button" id="register-btn">Зарегистрироваться</button>
        </div>
        <div id="login-error" class="login-error hidden"></div>
      </form>
    </div>
  `;

  const loginForm = document.getElementById('login-form');
  const registerBtn = document.getElementById('register-btn');
  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');
  const errorDiv = document.getElementById('login-error');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!login || !password) {
      showError('Заполните все поля');
      return;
    }
    
    errorDiv.classList.add('hidden');
    
    try {
      const user = await loginUser(login, password);
      renderApp();
    } catch (error) {
      showError(error.message);
    }
  });

  registerBtn.addEventListener('click', () => {
    renderRegisterPage();
  });
  
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
}

// Рендер страницы регистрации
export function renderRegisterPage() {
  const container = document.querySelector('.container');
  
  container.innerHTML = `
    <div class="login-container">
      <h1 class="login-title">Регистрация</h1>
      <form class="login-form" id="register-form">
        <div class="form-group">
          <label for="name-input" class="form-label">Имя</label>
          <input
            type="text"
            id="name-input"
            class="form-input"
            placeholder="Введите ваше имя"
          />
        </div>
        <div class="form-group">
          <label for="login-input" class="form-label">Логин</label>
          <input
            type="text"
            id="login-input"
            class="form-input"
            placeholder="Введите логин"
          />
        </div>
        <div class="form-group">
          <label for="password-input" class="form-label">Пароль</label>
          <input
            type="password"
            id="password-input"
            class="form-input"
            placeholder="Введите пароль"
          />
        </div>
        <div class="login-buttons">
          <button type="submit" class="login-button">Зарегистрироваться</button>
          <button type="button" class="register-button" id="back-to-login">Назад к входу</button>
        </div>
        <div id="register-error" class="login-error hidden"></div>
      </form>
    </div>
  `;

  const registerForm = document.getElementById('register-form');
  const backBtn = document.getElementById('back-to-login');
  const errorDiv = document.getElementById('register-error');
  const nameInput = document.getElementById('name-input');
  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!name || !login || !password) {
      showError('Заполните все поля');
      return;
    }
    
    if (name.length < 2) {
      showError('Имя должно содержать не менее 2 символов');
      return;
    }
    
    if (password.length < 3) {
      showError('Пароль должен содержать не менее 3 символов');
      return;
    }
    
    errorDiv.classList.add('hidden');
    
    try {
      const { registerUser, saveUserData } = await import('./auth.js');
      const user = await registerUser(login, name, password);
      saveUserData(user);
      renderApp();
    } catch (error) {
      showError(error.message);
    }
  });

  backBtn.addEventListener('click', () => {
    renderLoginPage();
  });
  
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
}