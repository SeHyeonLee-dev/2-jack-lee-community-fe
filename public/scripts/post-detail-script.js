import { BASE_URL } from '../../global.js';

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
            user?.profile_image || 'https://www.gravatar.com/avatar/?d=mp';
    };

    // 게시글 상세 정보를 렌더링
    const renderPost = async () => {
        const postId = getPostIdFromUrl();
        const postData = (await fetchAPI(`${BASE_URL}/api/posts/${postId}`))
            ?.data;

        if (!postData) return;

        document.getElementById('post-title').innerText = postData.post_title;
        document.getElementById('post-profile').src =
            postData.author.profile_image;
        document.getElementById('post-writer').innerText = postData.author.name;
        document.getElementById('post-time').innerText = postData.created_at;

        const postImageName = postData.post_image.split('/').pop();
        document.getElementById('post-image').src =
            `${BASE_URL}/post-images/${postImageName}`;

        document.getElementById('post-text').innerText = postData.post_content;
        document.getElementById('post-like-count').innerText = postData.likes;
        document.getElementById('post-views-count').innerText = postData.views;
        document.getElementById('post-comment-count').innerText =
            postData.comments;

        const currentUser = await getUserInfo();
        const isAuthor = currentUser?.id === postData.author.id;

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
            return await fetchAPI(`${BASE_URL}/api/posts/${postId}/comments`);
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
            const isAuthor = currentUser?.id === comment.comment_author.user_id;

            const commentCard = `
                <div class="comment" data-comment-id="${comment.comment_id}">
                    <img src="${comment.comment_author.profile_image}" alt="프로필 사진">
                    <div class="comment-content">
                        <div class="comment-header">
                            <h4>${comment.comment_author.nickname}</h4>
                            <small>${comment.comment_created_at}</small>
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
                    `${BASE_URL}/api/posts/${postId}/comments/${commentId}`,
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

            try {
                await fetchAPI(
                    `${BASE_URL}/api/posts/${postId}/comments_decrease`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    },
                );
            } catch (e) {
                console.error('댓글 수 감소 에러:', e);
            }
        });
    };

    const getCommentsFromServer = async () => {
        const postId = getPostIdFromUrl();
        try {
            const responseJson = await fetchAPI(
                `${BASE_URL}/api/posts/${postId}/comments_count`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            const comments = await responseJson?.data;

            document.getElementById('post-comment-count').textContent =
                comments;
        } catch (e) {
            console.error('error:', e);
        }
    };

    await renderComments();
    await getCommentsFromServer();
    initializeCommentEvents();

    let isEditing = false;

    document
        .getElementById('comment-submit-btn')
        .addEventListener('click', async function () {
            const commentInput = document.getElementById('comment-input');
            const commentText = commentInput.value;
            const postId = getPostIdFromUrl();

            getCommentsFromServer();

            if (commentText.trim() === '') {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            if (isEditing) {
                const commentId =
                    document.getElementById('comment-submit-btn').dataset
                        .commentId;

                try {
                    const response = await fetchAPI(
                        `${BASE_URL}/api/posts/${postId}/comments/${commentId}`,
                        {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                comment_content: commentText,
                            }),
                        },
                    );

                    //if (!response.ok) throw new Error('댓글 수정 에러');

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
                const comment_content = commentText;

                try {
                    await fetchAPI(`${BASE_URL}/api/posts/${postId}/comments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            comment_content,
                        }),
                    });

                    commentInput.value = '';
                    await renderComments();
                } catch (e) {
                    console.error('Comment Create Error:', e);
                }
            }
        });

    const initializeLikeButton = async () => {
        const postId = getPostIdFromUrl();
        const likeStatus = await fetchAPI(
            `${BASE_URL}/api/posts/${postId}/likes/like-status`,
            {
                method: 'GET',
                credentials: 'include',
            },
        );

        const likeButton = document.querySelector('.post-like');
        likeButton.classList.toggle('liked', likeStatus?.liked || false);

        likeButton.addEventListener('click', async () => {
            likeButton.classList.toggle('liked');
            const updatedLikes = await fetchAPI(
                `${BASE_URL}/api/posts/${postId}/likes`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                },
            );
            document.getElementById('post-like-count').innerText =
                updatedLikes?.data || 0;
        });
    };

    const updateViewCount = async () => {
        const postId = getPostIdFromUrl();
        await fetchAPI(`${BASE_URL}/api/posts/${postId}/views`, {
            method: 'POST',
        });
        const views = (await fetchAPI(`${BASE_URL}/api/posts/${postId}/views`))
            ?.data;
        document.getElementById('post-views-count').innerText = views || 0;
    };

    const addCommentsCount = async () => {
        const postId = getPostIdFromUrl();
        try {
            await fetchAPI(`${BASE_URL}/api/posts/${postId}/comments_add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (e) {
            console.error('댓글 수 증가 에러:', e);
        }
    };

    document
        .getElementById('comment-submit-btn')
        .addEventListener('click', () => {
            addCommentsCount();
            getCommentsFromServer();
        });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        getCommentsFromServer();
    });

    await renderUserData();
    await renderPost();
    await renderComments();
    await initializeLikeButton();
    await updateViewCount();
});
