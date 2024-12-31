import { BASE_URL } from '../../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    const writeBtn = document.getElementById('write-btn');

    function navigateToPostAdd() {
        window.location.href = '/posts/add';
    }

    // 게시글 작성 버튼 클릭 시 작성 페이지 이동
    writeBtn.addEventListener('click', () => {
        navigateToPostAdd();
    });

    writeBtn.addEventListener('mouseout', () => {
        writeBtn.style.backgroundColor = '#ACA0EB';
    });

    writeBtn.addEventListener('mouseover', () => {
        writeBtn.style.backgroundColor = '#7F6AEE';
    });

    // 데이터 가져오는 함수
    async function fetchPosts() {
        try {
            const response = await fetch(`${BASE_URL}/api/posts`);
            if (!response.ok) {
                throw new Error('게시글을 불러올 수 없음');
            }
            const jsonPosts = await response.json();
            const postArray = Object.values(jsonPosts.data); // 객체를 배열로 변환

            renderPosts(postArray);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // 게시글 생성 함수
    async function renderPosts(posts) {
        const postList = document.getElementById('post-list');

        // foreach가 타입 오류때문에 안되서 for문으로 변경
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.style.cursor = 'pointer';
            // 댓글 수 동기화
            if (post.comments_info) {
                post.comments = post.comments_info.length;
            }

            postCard.innerHTML = `
            <div class="post-title">${post.post_title}</div>
            <div class="post-info">
                <div class="post-info-left">
                        <div class="post-info-item">
                        <p>좋아요</p><span>${post.likes}</span>
                    </div>
                    <div class="post-info-item">
                        <p>댓글</p><span>${post.comments}</span>
                    </div>
                    <div class="post-info-item">
                        <p>조회수</p><span>${post.views}</span>
                    </div>
                </div>
                <div class="post-info-right">
                    <p>${post.created_at}</p>
                </div>
            </div>
            <div class="post-info-writer">
                <div class="writer-profile">
                    <img class="writer-profile-img" src="${post.author.profile_image}" alt="작성자 이미지">
                </div>
                <div class="writer-name">
                    <p><b>${post.author.name}</b></p>
                </div>
            </div>
            `;

            // 카드 클릭 시 해당 게시글 상세 페이지 이동
            postCard.addEventListener('click', () => {
                window.location.href = `/posts/${post.post_id}`;
            });

            postList.appendChild(postCard);
        }
    }

    await fetchPosts();

    const profileImage = document.getElementById('profile-image');
    const profileNickname = document.getElementById('profile-nickname');

    document
        .getElementById('profile-nickname')
        .addEventListener('click', () => {
            window.location.href = `/users/login`;
        });

    // 로그인 상태에 따라 프로필 업데이트
    try {
        const response = await fetch(`${BASE_URL}/api/auths/profile`, {
            credentials: 'include',
        });
        const result = await response.json();

        if (result && result.nickname) {
            const { nickname, profile_image } = result;
            profileImage.src = profile_image;
            profileNickname.textContent = 'Hi ' + nickname + '😊😊';
        } else {
            showLoggedOutState();
        }

        const userId = result.id;

        // 드롭다운 요소 클릭 시 다른 페이지 이동
        document
            .querySelector('.dropdown-content')
            .addEventListener('click', async (event) => {
                event.preventDefault(); // 기본 a 태그 동작 방지

                const link = event.target; // 클릭된 요소 가져오기
                if (link.tagName !== 'A') return; // 클릭된 요소가 a 태그가 아닌 경우 무시

                const linkText = link.textContent.trim();

                try {
                    switch (linkText) {
                        case '회원정보수정':
                            window.location.href = `/users/${userId}/edit`;
                            break;
                        case '비밀번호수정':
                            window.location.href = `/users/${userId}/edit-pw`;
                            break;
                        case '로그아웃':
                            await handleLogout(); // 로그아웃 로직
                            break;
                        default:
                            console.error('Unknown link:', linkText);
                    }
                } catch (error) {
                    console.error('Error handling dropdown link:', error);
                }
            });
        // 로그아웃 처리 함수
        async function handleLogout() {
            try {
                const logoutResponse = await fetch(
                    `${BASE_URL}/api/auths/logout`,
                    {
                        method: 'POST',
                        credentials: 'include',
                    },
                );

                if (!logoutResponse.ok) {
                    throw new Error('Failed to log out');
                }

                // 로그아웃 성공 시 메인 페이지로 리다이렉트
                window.location.href = '/posts';

                profileNickname.textContent = '로그인 해주세요';
            } catch (error) {
                console.error('Error during logout:', error);
                alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
            }
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        showLoggedOutState();
    }

    function showLoggedOutState() {
        profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
        profileNickname.textContent = '로그인 해주세요';
    }

    // 프로필을 클릭했을 때 보이거나 숨기도록 함수
    profileImage.addEventListener('click', function () {
        var dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';

        // 클릭한 이벤트가 다른 곳에서 발생하면 드롭다운을 닫는 함수
        window.addEventListener('click', function (e) {
            if (!document.querySelector('.dropdown').contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });
    });
});
