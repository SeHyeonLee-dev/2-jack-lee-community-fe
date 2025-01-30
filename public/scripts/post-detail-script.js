import { BASE_URL } from '../global.js';

const checkAuth = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/auths/check-session`, {
            method: 'GET',
            credentials: 'include', // ✅ 세션 쿠키 포함 필수
        });

        if (response.status === 401) {
            console.warn(
                'Unauthorized access detected. Redirecting to login page...',
            );
            window.location.href = '/users/login'; // ✅ 로그인 페이지로 강제 이동
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
};

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', checkAuth);

document.addEventListener('DOMContentLoaded', async () => {
    // 현재 URL에서 post_id 추출
    const getPostIdFromUrl = () => window.location.pathname.split('/').pop();

    // fetch를 통해 API 호출을 처리하는 유틸리티 함수
    const fetchAPI = async (url, options = {}) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Fetch error: ${url}`, error);
        }
    };

    // 로그인 시 세션에서 유저 데이터 가져오는 함수
    const getUserInfo = () =>
        fetchAPI(`${BASE_URL}/api/auths/profile`, {
            method: 'GET',
            credentials: 'include',
        });

    // 사용자 정보를 렌더링 (프로필 이미지 등)
    const renderUserData = async () => {
        const user = await getUserInfo();
        const profileImage = document.querySelector('.profile');
        profileImage.src =
            user?.profile_image_url || 'https://www.gravatar.com/avatar/?d=mp';
    };

    // 게시글 상세 정보를 렌더링
    const renderPost = async () => {
        const postId = getPostIdFromUrl();
        const postData = (await fetchAPI(`${BASE_URL}/api/posts/${postId}`))
            ?.data;
        console.log(postData);

        if (!postData) return;

        document.getElementById('post-title').innerText = postData.post_title;
        document.getElementById('post-profile').src = postData.author
            .profile_image
            ? postData.author.profile_image
            : 'https://www.gravatar.com/avatar/?d=mp';
        document.getElementById('post-writer').innerText =
            postData.author.username;
        document.getElementById('post-time').innerText = postData.created_at;

        const postImagesElement = document.querySelector('.post-images');
        const postImageElement = document.getElementById('post-image');
        if (postData.post_image_url) {
            const postImageName = postData.post_image_url.split('/').pop();
            postImageElement.src = `${BASE_URL}/post-images/${postImageName}`;
            postImageElement.style.display = 'block';
        } else {
            postImagesElement.style.display = 'none';
            postImageElement.style.display = 'none'; // 이미지가 없으면 숨김 처리
        }

        document.getElementById('post-text').innerText = postData.post_content;
        document.getElementById('post-like-count').innerText =
            postData.post_likes;
        document.getElementById('post-views-count').innerText =
            postData.post_views;

        const currentUser = await getUserInfo();
        const isAuthor = currentUser?.user_id === postData.author.user_id;

        document.querySelector('.post-nav-right').innerHTML = isAuthor
            ? `
                <button id="post-modify">수정</button>
                <button id="post-delete">삭제</button>
              `
            : '';

        const modifyButton = document.getElementById('post-modify');
        if (modifyButton) {
            modifyButton.addEventListener('click', () => {
                const postId = getPostIdFromUrl();
                window.location.href = `/posts/${postId}/edit`;
            });
        }

        const deleteButton = document.getElementById('post-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                const postId = getPostIdFromUrl();

                const deletePostModal =
                    document.getElementById('postDeleteModal');
                const cancelPostDeleteButton =
                    document.getElementById('cancel-btn-id');
                const confirmPostDeleteButton =
                    document.getElementById('confirm-btn-id');

                deletePostModal.style.display = 'flex';

                cancelPostDeleteButton.onclick = () => {
                    deletePostModal.style.display = 'none';
                };

                const deletePost = async (postId) => {
                    try {
                        const response = await fetchAPI(
                            `${BASE_URL}/api/posts/${postId}`,
                            {
                                method: 'DELETE',
                                credentials: 'include',
                            },
                        );

                        if (!response.ok) {
                            throw new Error('삭제할 게시글을 찾지 못했습니다.');
                        }
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
        }
    };

    // 댓글을 JSON 파일에서 가져와 표시하는 함수
    const fetchCommentData = async (postId) => {
        try {
            return await fetchAPI(`${BASE_URL}/api/comments/${postId}`);
        } catch (e) {
            console.error('comments fetch error:', e);
        }
    };

    const renderComments = async () => {
        const postId = getPostIdFromUrl();
        const comments = await fetchCommentData(postId);
        const commentsData = comments?.data;

        const commentList = document.querySelector('.comment-list');
        commentList.innerHTML = '';

        if (!commentsData || commentsData.length === 0) {
            return;
        }

        const currentUser = await getUserInfo();

        commentsData.forEach((comment) => {
            const isAuthor = currentUser?.user_id === comment.author.user_id;
            const commentProfileImage = comment.author.profile_image
                ? comment.author.profile_image
                : 'https://www.gravatar.com/avatar/?d=mp';

            const commentCard = `
                <div class="comment" data-comment-id="${comment.comment_id}">
                    <img src="${commentProfileImage}" alt="프로필 사진">
                    <div class="comment-content">
                        <div class="comment-header">
                            <h4>${comment.author.username}</h4>
                            <small>${comment.created_at}</small>
                        </div>
                        <div class="comment-text">${comment.comment_content}</div>
                        ${
                            isAuthor
                                ? `
                            <div class="comment-actions">
                                <button class="comment-edit-btn">수정</button>
                                <button class="comment-delete-btn">삭제</button>
                            </div>
                            `
                                : ''
                        }
                    </div>
                </div>
            `;

            commentList.insertAdjacentHTML('beforeend', commentCard);
        });

        // 댓글 수 업데이트
        const commentsCount = commentsData.length;
        document.getElementById('post-comment-count').textContent =
            commentsCount;
    };

    const initializeCommentEvents = () => {
        const commentList = document.querySelector('.comment-list');
        const deleteModal = document.getElementById('commentDeleteModal');
        const cancelDeleteButton = document.getElementById('cancelDelete');
        const confirmDeleteButton = document.getElementById('confirmDelete');

        let targetCommentCard = null;

        commentList.addEventListener('click', async (event) => {
            const target = event.target;

            if (target.classList.contains('comment-edit-btn')) {
                const commentCard = target.closest('.comment');
                const commentId = commentCard.dataset.commentId;
                const commentText = commentCard.querySelector('.comment-text');
                const commentInput = document.getElementById('comment-input');
                const commentSubmitButton =
                    document.getElementById('comment-submit-btn');

                isEditing = true;
                commentSubmitButton.dataset.commentId = commentId;
                commentInput.value = commentText.textContent;
                commentSubmitButton.innerText = '댓글 수정';
            }

            if (target.classList.contains('comment-delete-btn')) {
                targetCommentCard = target.closest('.comment');
                deleteModal.style.display = 'flex';
            }
        });

        cancelDeleteButton.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            targetCommentCard = null;
        });

        confirmDeleteButton.addEventListener('click', async () => {
            if (!targetCommentCard) return;

            const commentId = targetCommentCard.dataset.commentId;
            const postId = getPostIdFromUrl();

            try {
                await fetchAPI(
                    `${BASE_URL}/api/comments/${postId}/${commentId}`,
                    {
                        method: 'DELETE',
                    },
                );

                targetCommentCard.remove();
            } catch (error) {
                console.error('댓글 삭제 중 에러:', error);
            } finally {
                deleteModal.style.display = 'none';
                targetCommentCard = null;
            }

            // 댓글 렌더링 업데이트
            await renderComments();
        });
    };

    await renderComments();
    initializeCommentEvents();

    let isEditing = false;

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
                const commentId =
                    document.getElementById('comment-submit-btn').dataset
                        .commentId;

                try {
                    await fetchAPI(
                        `${BASE_URL}/api/comments/${postId}/${commentId}`,
                        {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                comment_content: commentText,
                            }),
                        },
                    );

                    isEditing = false;
                    commentInput.value = '';
                    document.getElementById('comment-submit-btn').innerText =
                        '댓글 작성';
                    document
                        .getElementById('comment-submit-btn')
                        .removeAttribute('data-comment-id');

                    await renderComments();
                } catch (e) {
                    console.error('Comment Modify Error:', e);
                }
            } else {
                try {
                    await fetchAPI(`${BASE_URL}/api/comments/${postId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            comment_content: commentText,
                        }),
                        credentials: 'include',
                    });

                    commentInput.value = '';
                    await renderComments();
                } catch (e) {
                    console.error('Comment Create Error:', e);
                }
            }
        });

    // 좋아요 상태를 확인하고 버튼 스타일 업데이트 함수
    const updateLikeButton = async (postId, userId, likeButton) => {
        try {
            const likeStatus = await fetchAPI(
                `${BASE_URL}/api/likes/${postId}/${userId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            console.log(likeStatus);

            // 좋아요 상태에 따라 배경색 변경
            likeButton.style.backgroundColor = likeStatus.data
                ? '#d9d9d9' // 좋아요 클릭된 상태
                : '#9e9595'; // 좋아요 클릭되지 않은 상태
        } catch (error) {
            console.error('Failed to fetch like status:', error);
        }
    };

    // 좋아요 상태를 확인하고 버튼 스타일 업데이트 함수
    const firstUpdateLikeButton = async (postId, userId, likeButton) => {
        try {
            const likeStatus = await fetchAPI(
                `${BASE_URL}/api/likes/${postId}/${userId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            console.log(likeStatus);

            // 좋아요 상태에 따라 배경색 변경
            likeButton.style.backgroundColor = likeStatus.data
                ? '#9e9595' // 좋아요 클릭된 상태
                : '#d9d9d9'; // 좋아요 클릭되지 않은 상태
        } catch (error) {
            console.error('Failed to fetch like status:', error);
        }
    };

    const initializeLikeButton = async () => {
        const postId = getPostIdFromUrl();
        const user = await getUserInfo();
        const userId = user?.user_id;
        const likeButton = document.querySelector('.post-like');

        // 초기 좋아요 상태 확인 및 스타일 업데이트
        firstUpdateLikeButton(postId, userId, likeButton);

        likeButton.addEventListener('click', async () => {
            // likeStatus 가 true이면 좋아요 누른 것, false면 안 누른 것것
            await updateLikeButton(postId, userId, likeButton);

            await fetchAPI(`${BASE_URL}/api/likes/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });
            const likesCount = await fetchAPI(
                `${BASE_URL}/api/likes/${postId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );
            document.getElementById('post-like-count').innerText =
                likesCount?.data || 0;
        });
    };

    const updateViewCount = async () => {
        const postId = getPostIdFromUrl();
        const response = await fetchAPI(
            `${BASE_URL}/api/posts/${postId}/views`,
            {
                method: 'POST',
            },
        );
        const views = response?.data;
        document.getElementById('post-views-count').innerText = views || 0;
    };

    await renderUserData();
    await renderPost();
    await renderComments();
    await initializeLikeButton();
    await updateViewCount();
});
