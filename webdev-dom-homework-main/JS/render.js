import { escapeHtml } from './replaceAll.js';
import { comments } from './comments.js';

function renderComments() {
  const commentsList = document.getElementById("comments-list");
  
  if (!commentsList) return;
  
  const commentsHtml = comments.map((comment) => {
    let likeButtonClass = "like-button";
    
    if (comment.isLikeLoading) {
      likeButtonClass += " -loading-like";
    } else if (comment.isLiked) {
      likeButtonClass += " -active-like";
    }
    
    return `
      <li class="comment" data-id="${comment.id}">
        <div class="comment-header">
          <div>${escapeHtml(comment.name)}</div>
          <div>${comment.date}</div>
        </div>
        <div class="comment-body">
          <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
        <div class="comment-footer">
          <div class="likes">
            <span class="likes-counter">${comment.likes}</span>
            <button class="${likeButtonClass}" data-id="${comment.id}"></button>
          </div>
        </div>
      </li>
    `;
  }).join("");

  commentsList.innerHTML = commentsHtml;
}

export { renderComments };