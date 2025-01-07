import { BASE_URL } from '../../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 현재 URL에서 post_id 추출
    const getPostIdFromUrl = () => window.location.pathname.split('/').pop();

    // fetch를 통해 API 호출을 처리하는 유틸리티 함수
    const fetchJSON = async (url, options = {}) => {
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
        fetchJSON(`${BASE_URL}/api/auths/profile`, {
            method: 'GET',
            credentials: 'include',
        });

    // 사용자 정보를 렌더링 (프로필 이미지 등)
    const renderUserData = async () => {
        const user = await getUserInfo();
        const profileImage = document.querySelector('.profile');
        // 사용자 정보가 있을 경우 프로필 이미지 표시, 없으면 기본 이미지 사용
        profileImage.src =
            user?.profile_image || 'https://www.gravatar.com/avatar/?d=mp';
    };

    // 게시글 상세 정보를 렌더링
    const renderPost = async () => {
        const postId = getPostIdFromUrl(); // URL에서 게시글 ID 가져오기
        const postData = (await fetchJSON(`${BASE_URL}/api/posts/${postId}`))
            ?.data;

        if (!postData) return; // 데이터가 없으면 렌더링 중단

        // 게시글 정보를 DOM에 업데이트
        document.getElementById('post-title').innerText = postData.post_title;
        document.getElementById('post-profile').src =
            postData.author.profile_image;
        document.getElementById('post-writer').innerText = postData.author.name;
        document.getElementById('post-time').innerText = postData.created_at;

        // 정적 파일에서 게시글 이미지를 가져와 표시
        const postImageName = postData.post_image.split('/').pop();
        document.getElementById('post-image').src =
            `${BASE_URL}/post-images/${postImageName}`;

        document.getElementById('post-text').innerText = postData.post_content;
        document.getElementById('post-like-count').innerText = postData.likes;
        document.getElementById('post-views-count').innerText = postData.views;
        document.getElementById('post-comment-count').innerText =
            postData.comments;

        // 현재 로그인한 사용자가 게시글 작성자인지 확인
        const currentUser = await getUserInfo();
        const isAuthor = currentUser?.id === postData.author.id;

        // 게시글 수정 및 삭제 버튼 표시 여부 결정
        document.querySelector('.post-nav-right').innerHTML = isAuthor
            ? `
                <button id="post-modify">수정</button>
                <button id="post-delete">삭제</button>
              `
            : '';

        // 수정 버튼 클릭 시 수정 페이지로 이동
        document
            .getElementById('post-modify')
            ?.addEventListener('click', () => {
                window.location.href = `/posts/${postId}/edit`;
            });

        // 게시글 삭제 버튼 클릭 시 게시글 삭제
        document.getElementById('post-delete').addEventListener('click', () => {
            const postId = getPostIdFromUrl();
            const deletePostModal = document.getElementById('postDeleteModal');
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
                    const response = await fetch(
                        `${BASE_URL}/api/posts/${postId}`,
                        {
                            method: 'DELETE',
                            credentials: 'include', // 세션이나 JWT를 포함
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
    };

    // 댓글을 JSON 파일에서 가져와 표시하는 함수
    const fetchCommentData = async (postId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/posts/${postId}/comments`,
            );

            const comments = await response.json();
            return comments;
        } catch (e) {
            console.error('comments fetch error:', e);
        }
    };

    const renderComments = async () => {
        const postId = getPostIdFromUrl(); // URL에서 게시글 ID 가져오기
        const comments = await fetchCommentData(postId); // 서버에서 댓글 데이터 가져오기
        const commentsData = comments?.data;

        const commentList = document.querySelector('.comment-list');
        commentList.innerHTML = ''; // 기존 댓글 초기화

        if (!commentsData || commentsData.length === 0) {
            return; // 댓글이 없으면 종료
        }

        const currentUser = await getUserInfo(); // 현재 로그인 사용자 정보 가져오기

        // 댓글 데이터로 DOM 생성
        commentsData.forEach((comment) => {
            const isAuthor = currentUser?.id === comment.comment_author.user_id; // 작성자 여부 확인

            // 댓글 카드 HTML 생성
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

            // 댓글 리스트에 추가
            commentList.insertAdjacentHTML('beforeend', commentCard);
        });
    };

    const initializeCommentEvents = () => {
        const commentList = document.querySelector('.comment-list');
        const deleteModal = document.getElementById('commentDeleteModal');
        const cancelDeleteButton = document.getElementById('cancelDelete');
        const confirmDeleteButton = document.getElementById('confirmDelete');

        let targetCommentCard = null; // 삭제할 댓글 저장 변수

        commentList.addEventListener('click', async (event) => {
            const target = event.target;

            // 댓글 수정 버튼 클릭 시
            if (target.classList.contains('comment-edit-btn')) {
                const commentCard = target.closest('.comment');
                const commentId = commentCard.dataset.commentId;
                const commentText = commentCard.querySelector('.comment-text');
                const commentInput = document.getElementById('comment-input');
                const commentSubmitButton =
                    document.getElementById('comment-submit-btn');

                isEditing = true; // 수정 상태 활성화
                commentSubmitButton.dataset.commentId = commentId; // 댓글 ID 저장
                commentInput.value = commentText.textContent; // 댓글 내용 입력창에 표시
                commentSubmitButton.innerText = '댓글 수정'; // 버튼 텍스트 변경
            }

            // 댓글 삭제 버튼 클릭 시
            if (target.classList.contains('comment-delete-btn')) {
                targetCommentCard = target.closest('.comment');
                deleteModal.style.display = 'flex'; // 삭제 모달창 표시
            }
        });

        // "취소" 버튼 클릭 시 모달창 닫기
        cancelDeleteButton.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            targetCommentCard = null;
        });

        // "확인" 버튼 클릭 시 댓글 삭제 처리
        confirmDeleteButton.addEventListener('click', async () => {
            if (!targetCommentCard) return;

            const commentId = targetCommentCard.dataset.commentId;
            const postId = getPostIdFromUrl();

            try {
                await fetch(
                    `${BASE_URL}/api/posts/${postId}/comments/${commentId}`,
                    {
                        method: 'DELETE',
                    },
                );

                targetCommentCard.remove(); // DOM에서 삭제
            } catch (error) {
                console.error('댓글 삭제 중 에러:', error);
            } finally {
                deleteModal.style.display = 'none'; // 모달창 닫기
                targetCommentCard = null;
            }

            try {
                await fetch(
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

    // 댓글 수 렌더링
    const getCommentsFromServer = async () => {
        const postId = getPostIdFromUrl();
        try {
            const response = await fetch(
                `${BASE_URL}/api/posts/${postId}/comments_count`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            const responseJson = await response.json();

            const comments = await responseJson.data;

            document.getElementById('post-comment-count').textContent =
                comments;
        } catch (e) {
            console.error('error:', e);
        }
    };

    await renderComments(); // 댓글 렌더링
    await getCommentsFromServer(); // 댓글 수 렌더링
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

            // 댓글 수 렌더링
            getCommentsFromServer();

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
                        `${BASE_URL}/api/posts/${postId}/comments/${commentId}`,
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

                try {
                    const response = await fetch(
                        `${BASE_URL}/api/posts/${postId}/comments`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                comment_content,
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

    // 좋아요 버튼 초기화 및 이벤트 처리
    const initializeLikeButton = async () => {
        const postId = getPostIdFromUrl(); // URL에서 게시글 ID 가져오기
        const likeStatus = await fetchJSON(
            `${BASE_URL}/api/posts/${postId}/likes/like-status`,
            {
                method: 'GET',
                credentials: 'include', // 로그인 정보 포함
            },
        );

        const likeButton = document.querySelector('.post-like');
        likeButton.classList.toggle('liked', likeStatus?.liked || false); // 좋아요 상태 반영

        // 좋아요 버튼 클릭 이벤트
        likeButton.addEventListener('click', async () => {
            likeButton.classList.toggle('liked'); // 클릭 시 'liked' 클래스 토글
            const updatedLikes = await fetchJSON(
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

    // 게시글 조회수 증가 및 업데이트
    const updateViewCount = async () => {
        const postId = getPostIdFromUrl();
        // 조회수 증가 요청
        await fetchJSON(`${BASE_URL}/api/posts/${postId}/views`, {
            method: 'POST',
        });
        // 최신 조회수 가져오기
        const views = (await fetchJSON(`${BASE_URL}/api/posts/${postId}/views`))
            ?.data;
        document.getElementById('post-views-count').innerText = views || 0;
    };

    // 댓글 수 증가
    const addCommentsCount = async () => {
        const postId = getPostIdFromUrl();
        try {
            await fetch(`${BASE_URL}/api/posts/${postId}/comments_add`, {
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
