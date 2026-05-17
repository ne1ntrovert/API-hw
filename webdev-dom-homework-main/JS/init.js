import { comments } from './comments.js';
import { renderComments } from './render.js';

function delay(interval = 300) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, interval);
  });
}

function initEventHandlers() {
  const commentsList = document.getElementById("comments-list");
  
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
  
  commentsList.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    if (!likeButton) return;
    
    const commentId = Number(likeButton.dataset.id);
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    if (comment.isLikeLoading) return;
    
    comment.isLikeLoading = true;
    renderComments();
    
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
