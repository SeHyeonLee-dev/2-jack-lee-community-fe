import { BASE_URL } from '../../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 현재 URL에서 post_id 추출
    const getPostIdFromUrl = () => {
        const pathSegments = window.location.pathname.split('/');
        const postId = pathSegments[pathSegments.length - 1];
        return postId;
    };

    // 로그인 시 세션에서 유저 데이터 가져오는 함수
    async function getUserInfo() {
        try {
            const response = await fetch(`${BASE_URL}/api/auths/profile`, {
                method: 'GET',
                credentials: 'include', // 세션 쿠키 포함
            });

            if (response.ok) {
                const userInfo = await response.json();
                return userInfo; // 사용자 정보 반환
            } else {
                return null; // 로그인되지 않은 상태
            }
        } catch (error) {
            console.error('사용자 정보 가져오기 실패:', error);
            return null;
        }
    }

    // 로그인 상태에서 헤더 유저 정보 렌더링
    const profileImage = document.querySelector('.profile');
    const renderUserData = async () => {
        const user = await getUserInfo();

        if (user) {
            profileImage.src = user.profile_image;
        } else {
            showLoggedOutState();
        }
    };

    function showLoggedOutState() {
        profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
    }

    renderUserData();

    // 게시글 상세 정보 데이터 가져오기
    const fetchPostData = async (postId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/posts/${postId}`);
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
            document.getElementById('post-time').innerText =
                postData.created_at;
            document.getElementById('post-title').innerText =
                postData.post_title;

            // 정적 파일 서빙을 통한 이미지 파일 가져오기
            const postImage = postData.post_image.split('/');
            const lastPostImage = postImage[postImage.length - 1];
            document.getElementById('post-image').src =
                `${BASE_URL}/post-images/${lastPostImage}`;

            document.getElementById('post-text').innerText =
                postData.post_content;
            document.getElementById('post-like-count').innerText =
                postData.likes;
            document.getElementById('post-views-count').innerText =
                postData.views;
            document.getElementById('post-comment-count').innerText =
                postData.comments;
        }

        // 로그인 조건부로 게시글 수정, 삭제 버튼을 렌더링(게시글 주인만 수정, 삭제 가능)
        const currentUser = await getUserInfo();

        const postNavRight = document.querySelector('.post-nav-right');
        const isAuthor = currentUser && currentUser.id === postData.author.id;

        const postHTML = `
        ${
            isAuthor
                ? `
            <button id="post-modify">수정</button>
            <button id="post-delete">삭제</button>
            `
                : ''
        }
        `;

        postNavRight.innerHTML = postHTML;

        // 게시글 수정 버튼 클릭 시 수정 페이지 이동
        document.getElementById('post-modify').addEventListener('click', () => {
            const postId = getPostIdFromUrl();
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

    renderPost();

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
        const postId = await getPostIdFromUrl();
        const comments = await fetchCommentData(postId);
        const commentsData = comments.data;

        const commentList = document.querySelector('.comment-list');
        commentList.innerHTML = ''; // 댓글 초기화

        if (!commentsData || commentsData.length === 0) {
            return;
        }

        const currentUser = await getUserInfo();
        // 댓글 렌더링
        commentsData.forEach((comment) => {
            const commentCard = document.createElement('div');
            commentCard.className = 'comment';
            commentCard.dataset.commentId = comment.comment_id; // 댓글 ID 저장
            commentCard.innerHTML = `
                <img src="${comment.comment_author.profile_image}" alt="프로필 사진">
                <div class="comment-content">
                    <div class="comment-header">
                        <h4>${comment.comment_author.nickname}</h4>
                        <small>${comment.comment_created_at}</small>
                    </div>
                    <div class="comment-text">${comment.comment_content}</div>
                </div>
            `;

            // 수정, 삭제 버튼을 작성자인 경우에만 추가

            const isAuthor =
                currentUser &&
                currentUser.id === comment.comment_author.user_id;

            if (isAuthor) {
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'comment-actions';

                actionsContainer.innerHTML = `
                <button class="comment-edit-btn" data-comment-id="${comment.comment_id}">수정</button>
                <button class="comment-delete-btn" data-comment-id="${comment.comment_id}">삭제</button>
            `;

                commentCard
                    .querySelector('.comment-content')
                    .appendChild(actionsContainer);
            }

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
                    `${BASE_URL}/api/posts/${postId}/comments/${commentId}`,
                    { method: 'DELETE' },
                );

                await fetch(
                    `${BASE_URL}/api/posts/${postId}/comments_decrease`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    },
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

    // 좋아요 버튼 초기화
    const initializeLikeButton = async () => {
        const postId = getPostIdFromUrl();

        try {
            // 좋아요 상태 가져오기(좋아요 했으면 true, 아니면 false)
            const response = await fetch(
                `${BASE_URL}/api/posts/${postId}/likes/like-status`,
                {
                    method: 'GET',
                    credentials: 'include', // 로그인 정보 포함
                },
            );
            console.log(response);
            const { success, liked } = await response.json();

            if (success) {
                const likeButton = document.querySelector('.post-like');
                if (liked) {
                    likeButton.classList.add('liked'); // liked 클래스 추가
                } else {
                    likeButton.classList.remove('liked'); // liked 클래스 제거
                }
            }
        } catch (error) {
            console.error('Error initializing like button:', error);
        }
    };

    // 호출
    initializeLikeButton();

    // 좋아요 클릭 이벤트
    document.querySelector('.post-like').addEventListener('click', async () => {
        document.querySelector('.post-like').classList.toggle('liked'); // 클릭 시 'liked' 클래스 추가/제거

        const postId = getPostIdFromUrl();
        try {
            const response = await fetch(
                `${BASE_URL}/api/posts/${postId}/likes`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            const responseJson = await response.json();

            if (responseJson) {
                // 좋아요 수 업데이트
                document.getElementById('post-like-count').innerText =
                    responseJson.data;
            } else {
                console.error('좋아요 처리 실패:', responseJson.message);
            }
        } catch (e) {
            console.error('좋아요 처리 중 에러:', e);
        }
    });

    // 조회 수 렌더링
    const getViewsFromServer = async () => {
        const postId = getPostIdFromUrl();
        try {
            await fetch(`${BASE_URL}/api/posts/${postId}/views`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await fetch(
                `${BASE_URL}/api/posts/${postId}/views`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            const responseJson = await response.json();

            const views = await responseJson.data;

            document.getElementById('post-views-count').innerText = views;
        } catch (e) {
            console.error('조회 수 증가 에러:', e);
        }
    };
    getViewsFromServer();

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
});
