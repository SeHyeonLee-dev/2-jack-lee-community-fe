import { BASE_URL } from '../../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 현재 URL에서 게시글 ID 추출
    const getPostIdFromUrl = () => window.location.pathname.split('/').pop();

    // 공통 fetch 유틸리티 함수: API 호출 후 JSON 데이터 반환
    const fetchJSON = async (url, options = {}) => {
        try {
            const response = await fetch(url, options); // API 호출
            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json(); // JSON 변환 후 반환
        } catch (error) {
            console.error(`Fetch error: ${url}`, error); // 에러 로깅
        }
    };

    // 사용자 정보를 가져오는 함수
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

        // 삭제 버튼 클릭 시 게시글 삭제 처리
        document
            .getElementById('post-delete')
            ?.addEventListener('click', async () => {
                if (confirm('게시글을 삭제하시겠습니까?')) {
                    await fetchJSON(`${BASE_URL}/api/posts/${postId}`, {
                        method: 'DELETE',
                        credentials: 'include', // 세션 정보 포함
                    });
                    window.location.href = '/posts'; // 삭제 후 게시글 목록으로 이동
                }
            });
    };

    // 댓글을 렌더링하는 함수
    const renderComments = async () => {
        const postId = getPostIdFromUrl(); // URL에서 게시글 ID 가져오기
        const commentsData = (
            await fetchJSON(`${BASE_URL}/api/posts/${postId}/comments`)
        )?.data;

        const commentList = document.querySelector('.comment-list');
        commentList.innerHTML = ''; // 기존 댓글 초기화

        if (!commentsData || !commentsData.length) return; // 댓글이 없으면 중단

        const currentUser = await getUserInfo(); // 현재 로그인 사용자 정보 가져오기

        // 댓글 데이터 순회하여 DOM에 추가
        commentsData.forEach((comment) => {
            const isAuthor = currentUser?.id === comment.comment_author.user_id; // 작성자 확인

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

    // 사용자 정보, 게시글, 댓글, 좋아요 상태, 조회수 렌더링
    await renderUserData();
    await renderPost();
    await renderComments();
    await initializeLikeButton();
    await updateViewCount();
});
