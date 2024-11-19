// 댓글을 추가하는 함수
document.getElementById('submit-btn').addEventListener('click', function() {
    const commentInput = document.getElementById('comment-input');
    const commentText = commentInput.value;

    if (commentText.trim() === '') {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    // 현재 시간
    const now = new Date();
    const timeString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;

    // 프로필 이미지 URL (임시 이미지 사용)
    const profileImg = 'https://via.placeholder.com/50';

    // 작성자 정보 (임시 작성자)
    const authorName = '더미 작성자1';

    // 댓글을 위한 HTML 요소 생성
    const commentList = document.querySelector('.comment-list');

    const commentDiv = document.createElement('div');
    commentDiv.classList.add('comment');

    commentDiv.innerHTML = `
        <img src="${profileImg}" alt="프로필 사진">
        <div class="comment-content">
            <div class="comment-header">
                <h4>${authorName}</h4>
                <small>${timeString}</small>
            </div>
            <div class="comment-text">${commentText}</div>
            <div class="comment-actions">
                <button class="comment-edit-btn">수정</button>
                <button class="comment-delete-btn">삭제</button>
            </div>
        </div>
    `;

    // 댓글 목록에 추가
    commentList.appendChild(commentDiv);

    // 댓글 입력 필드 초기화
    commentInput.value = '';

    // 삭제 버튼 이벤트 리스너
    const deleteBtn = commentDiv.querySelector('.comment-delete-btn');
    deleteBtn.addEventListener('click', function() {
        const deleteModal = document.getElementById('commentDeleteModal');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');

        deleteModal.style.display = 'flex';

        cancelDelete.onclick = () => {
            deleteModal.style.display = 'none';
        }

        confirmDelete.onclick = () => {
            commentDiv.remove();
            deleteModal.style.display = 'none';
        }
    });

    // 수정 버튼 이벤트 리스너
    const editBtn = commentDiv.querySelector('.comment-edit-btn');
    editBtn.addEventListener('click', function() {
        const newComment = prompt('수정할 내용을 입력하세요:', commentText);
        if (newComment !== null && newComment.trim() !== '') {
            commentDiv.querySelector('.comment-text').innerText = newComment;
        }
    });
});


  