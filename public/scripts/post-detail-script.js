document.addEventListener('DOMContentLoaded', async () => {
    // 현재 URL에서 post_id 추출
    const getPostIdFromUrl = () => {
        const pathSegments = window.location.pathname.split('/');
        const postId = pathSegments[pathSegments.length - 1];
        return postId;
    };

    // 게시글 상세 정보 데이터 가져오기
    const fetchPostData = async (postId) => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/posts/${postId}`,
            );
            if (!response.ok) {
                throw new Error('게시글 정보를 불러오는데 실패했습니다.');
            }

            const posts = await response.json();
            return posts;
        } catch (e) {
            console.error('fetch error:', e);
        }
    };

    // DOM에 데이터 렌더링 (상세 페이지에 데이터 넣어주기)
    const renderPost = async () => {
        const postId = await getPostIdFromUrl();
        const posts = await fetchPostData(postId); // await 안해주면 promise 타입이 됨
        const postData = posts.data;

        if (postData) {
            document.getElementById('post-title').innerText =
                postData.post_title;
            document.getElementById('post-profile').src =
                postData.author.profile_image;
            document.getElementById('post-writer').innerText =
                postData.author.name;
            document.getElementById('post-time').innerText = postData.create_at;
            document.getElementById('post-title').innerText =
                postData.post_title;

            // 정적 파일 서빙을 통한 이미지 파일 가져오기
            const postImage = postData.post_image.split('/');
            const lastPostImage = postImage[postImage.length - 1];
            document.getElementById('post-image').src =
                `http://localhost:3000/post-images/${lastPostImage}`;

            document.getElementById('post-text').innerText =
                postData.post_content;
            document.getElementById('post-like-count').innerText =
                postData.likes;
            document.getElementById('post-views-count').innerText =
                postData.views;
            document.getElementById('post-comment-count').innerText =
                postData.comments;
        }
    };

    renderPost();

    // 게시글 수정 버튼 클릭 시 수정 페이지 이동
    document.getElementById('post-modify').addEventListener('click', () => {
        const postId = getPostIdFromUrl();
        window.location.href = `/posts/${postId}/edit`;
    });

    // 게시글 삭제 버튼 클릭 시 게시글 삭제
    document.getElementById('post-delete').addEventListener('click', () => {
        const postId = getPostIdFromUrl();
        const deletePostModal = document.getElementById('postDeleteModal');
        const cancelPostDeleteButton = document.getElementById('cancel-btn-id');
        const confirmPostDeleteButton =
            document.getElementById('confirm-btn-id');

        deletePostModal.style.display = 'flex';

        cancelPostDeleteButton.onclick = () => {
            deletePostModal.style.display = 'none';
        };

        const deletePost = async (postId) => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/posts/${postId}`,
                    {
                        method: 'DELETE',
                    },
                );
                if (!response.ok)
                    throw new Error('삭제할 게시글을 찾지 못했습니다.');
            } catch (e) {
                console.error('Post Delete Error:', e);
            }
        };

        confirmPostDeleteButton.onclick = () => {
            deletePost(postId);
            deletePostModal.style.display = 'none';
            window.location.href = `/posts`;
        };
    });

    // 댓글을 JSON 파일에서 가져와 표시하는 함수
    const fetchCommentData = async (postId) => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/posts/${postId}/comments`,
            );

            const comments = await response.json();
            return comments;
        } catch (e) {
            console.error('comments fetch error:', e);
        }
    };

    const renderComments = async () => {
        const postId = await getPostIdFromUrl();
        const comments = await fetchCommentData(postId);
        const commentsData = comments.data;

        const commentList = document.querySelector('.comment-list');
        commentList.innerHTML = ''; // 댓글 초기화

        if (!commentsData || commentsData.length === 0) {
            console.log('No comments to render');
            return;
        }

        // 댓글 렌더링
        commentsData.forEach((comment) => {
            const commentCard = document.createElement('div');
            commentCard.className = 'comment';
            commentCard.dataset.commentId = comment.comment_id; // 댓글 ID 저장
            commentCard.innerHTML = `
                <img src="${comment.profile_image}" alt="프로필 사진">
                <div class="comment-content">
                    <div class="comment-header">
                        <h4>${comment.author_name}</h4>
                        <small>${comment.comment_time}</small>
                    </div>
                    <div class="comment-text">${comment.comment_content}</div>
                    <div class="comment-actions">
                        <button class="comment-edit-btn">수정</button>
                        <button class="comment-delete-btn">삭제</button>
                    </div>
                </div>
            `;
            commentList.appendChild(commentCard);
        });
    };

    const initializeCommentEvents = () => {
        const commentList = document.querySelector('.comment-list');
        const deleteModal = document.getElementById('commentDeleteModal');
        const cancelDeleteButton = document.getElementById('cancelDelete');
        const confirmDeleteButton = document.getElementById('confirmDelete');

        let targetCommentCard = null; // 삭제할 댓글을 저장할 변수

        commentList.addEventListener('click', async (event) => {
            const target = event.target;

            if (target.classList.contains('comment-edit-btn')) {
                const commentCard = target.closest('.comment');
                const commentId = commentCard.dataset.commentId;
                const commentText = commentCard.querySelector('.comment-text');
                const commentInput = document.getElementById('comment-input');
                const commentSubmitButton =
                    document.getElementById('comment-submit-btn');

                // 수정 상태 설정
                isEditing = true;
                commentSubmitButton.dataset.commentId = commentId; // 수정 대상 댓글 ID 저장
                commentInput.value = commentText.textContent; // 수정할 내용 입력창에 표시
                commentSubmitButton.innerText = '댓글 수정'; // 버튼 텍스트 변경
            }

            if (target.classList.contains('comment-delete-btn')) {
                targetCommentCard = target.closest('.comment');
                deleteModal.style.display = 'flex';
            }
        });

        // 모달 "취소" 버튼 클릭 처리
        cancelDeleteButton.addEventListener('click', () => {
            deleteModal.style.display = 'none'; // 모달 창 닫기
            targetCommentCard = null; // 삭제 대상 초기화
        });

        // 모달 "확인" 버튼 클릭 처리
        confirmDeleteButton.addEventListener('click', async () => {
            if (!targetCommentCard) return;

            const commentId = targetCommentCard.dataset.commentId;
            const postId = getPostIdFromUrl();

            try {
                const response = await fetch(
                    `http://localhost:3000/api/posts/${postId}/comments/${commentId}`,
                    { method: 'DELETE' },
                );

                if (!response.ok) throw new Error('댓글 삭제 에러');

                // 댓글 삭제 성공 시 DOM에서 제거
                targetCommentCard.remove();
            } catch (error) {
                console.error('Comment Delete Error:', error);
            } finally {
                deleteModal.style.display = 'none'; // 모달 창 닫기
                targetCommentCard = null; // 삭제 대상 초기화
            }
        });
    };

    await renderComments(); // 댓글 렌더링
    initializeCommentEvents(); // 수정/삭제 이벤트 초기화

    // 댓글을 추가하는 함수
    // 댓글 작성 버튼이 수정 중일 때와 새 댓글 작성 중일 때의 동작을 분리해야 함.

    let isEditing = false; // 수정 상태 추적 변수

    document
        .getElementById('comment-submit-btn')
        .addEventListener('click', async function () {
            const commentInput = document.getElementById('comment-input');
            const commentText = commentInput.value;
            const postId = getPostIdFromUrl();

            if (commentText.trim() === '') {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            if (isEditing) {
                // 댓글 수정 로직
                const commentId =
                    document.getElementById('comment-submit-btn').dataset
                        .commentId;

                try {
                    const response = await fetch(
                        `http://localhost:3000/api/posts/${postId}/comments/${commentId}`,
                        {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                comment_content: commentText,
                            }),
                        },
                    );

                    if (!response.ok) throw new Error('댓글 수정 에러');

                    // 댓글 수정 성공 시
                    isEditing = false; // 수정 상태 초기화
                    commentInput.value = ''; // 입력 필드 초기화
                    document.getElementById('comment-submit-btn').innerText =
                        '댓글 작성'; // 버튼 텍스트 초기화
                    document
                        .getElementById('comment-submit-btn')
                        .removeAttribute('data-comment-id');

                    // 댓글 재렌더링
                    await renderComments();
                } catch (e) {
                    console.error('Comment Modify Error:', e);
                }
            } else {
                // 댓글 작성 로직
                const comment_content = commentText;
                const comment_author = {
                    id: 'abc1234',
                    name: 'Jack',
                    profile_image: '../images/고양이.jpg',
                };

                try {
                    const response = await fetch(
                        `http://localhost:3000/api/posts/${postId}/comments`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                comment_content,
                                comment_author,
                            }),
                        },
                    );

                    if (!response.ok) throw new Error('댓글 추가 에러');

                    // 댓글 작성 성공 시
                    commentInput.value = ''; // 입력 필드 초기화
                    await renderComments(); // 댓글 재렌더링
                } catch (e) {
                    console.error('Comment Create Error:', e);
                }
            }
        });
});
