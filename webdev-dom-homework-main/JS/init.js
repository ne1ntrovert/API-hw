import { comments } from './comments.js';
import { renderComments } from './render.js';

// Функция задержки для симуляции API
function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, interval);
  });
}

function initEventHandlers() {
  const commentsList = document.getElementById("comments-list");
  
  // Обработчик для ответа на комментарий
  commentsList.addEventListener("click", (event) => {
    if (event.target.classList.contains("like-button")) {
      return;
    }
    
    const commentElement = event.target.closest(".comment");
    if (!commentElement) return;
    
    const commentId = Number(commentElement.dataset.id);
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
      const replyText = `> ${comment.name}:\n${comment.text}\n\n`;
      const commentInput = document.getElementById("comment-input");
      commentInput.value = replyText;
      commentInput.focus();
      commentInput.scrollIntoView({ behavior: "smooth" });
    }
  });
  
  // Обработчик лайков с имитацией запроса
  commentsList.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    if (!likeButton) return;
    
    const commentId = Number(likeButton.dataset.id);
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    // Если лайк уже в процессе загрузки — игнорируем повторный клик
    if (comment.isLikeLoading) return;
    
    // Устанавливаем флаг загрузки и перерисовываем (появляется анимация)
    comment.isLikeLoading = true;
    renderComments();
    
    // Симулируем запрос к API через delay
    delay(500)
      .then(() => {
        if (comment.isLiked) {
          comment.likes -= 1;
        } else {
          comment.likes += 1;
        }
        comment.isLiked = !comment.isLiked;
        comment.isLikeLoading = false;
        renderComments();
      })
      .catch(() => {
        comment.isLikeLoading = false;
        renderComments();
        alert('Не удалось поставить лайк');
      });
  });
}

export { initEventHandlers };