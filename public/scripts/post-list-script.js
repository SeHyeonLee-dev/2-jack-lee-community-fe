import { BASE_URL } from '../../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    const writeBtn = document.getElementById('write-btn');

    const navigateToPostAdd = () => {
        window.location.href = '/posts/add';
    };

    // 게시글 작성 버튼 클릭 시 작성 페이지 이동
    writeBtn.addEventListener('click', navigateToPostAdd);

    writeBtn.addEventListener('mouseout', () => {
        writeBtn.style.backgroundColor = '#ACA0EB';
    });

    writeBtn.addEventListener('mouseover', () => {
        writeBtn.style.backgroundColor = '#7F6AEE';
    });

    // 게시글 목록을 저장하는 상태 관리 변수
    let nextCursor = null; // 서버에서 반환되는 커서
    let isFetching = false; // 데이터 로딩 중인지 확인
    const limit = 10; // 한 번에 가져올 게시글 수

    // IntersectionObserver를 이용한 무한 스크롤링
    const observer = new IntersectionObserver(
        async (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                await fetchPosts(); // 데이터 로드
            }
        },
        {
            root: null, // 뷰포트 기준
            rootMargin: '0px',
            threshold: 1.0, // 요소가 완전히 보일 때 트리거
        },
    );

    // 데이터 가져오는 함수
    const fetchPosts = async () => {
        if (isFetching) return; // 데이터 로딩 중이면 중단

        try {
            isFetching = true; // 로딩 시작
            console.log('nextCursor:', nextCursor);
            const query = nextCursor
                ? `?cursor=${nextCursor}&limit=${limit}`
                : `?limit=${limit}`;
            console.log('query: ', query);
            const response = await fetch(`${BASE_URL}/api/posts${query}`);

            if (!response.ok) {
                throw new Error('게시글을 불러올 수 없음');
            }

            const { data } = await response.json();

            // 데이터가 더 이상 없으면 로딩 중단
            if (data.posts.length === 0) {
                observer.disconnect(); // 스크롤 이벤트 중단
                return;
            }

            renderPosts(data.posts);
            nextCursor = data.nextCursor; // 다음 커서 업데이트
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            isFetching = false; // 로딩 종료
        }
    };

    // 게시글 생성 함수
    const renderPosts = (posts) => {
        const postList = document.getElementById('post-list');

        for (const post of posts) {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.style.cursor = 'pointer';

            postCard.innerHTML = `
                <div class="post-title">${post.post_title}</div>
                <div class="post-info">
                    <div class="post-info-left">
                        <div class="post-info-item">
                            <p>좋아요</p><span>${post.post_likes}</span>
                        </div>
                        <div class="post-info-item">
                            <p>댓글</p><span>${post.post_comments}</span>
                        </div>
                        <div class="post-info-item">
                            <p>조회수</p><span>${post.post_views}</span>
                        </div>
                    </div>
                    <div class="post-info-right">
                        <p>${post.created_at}</p>
                    </div>
                </div>
                <div class="post-info-writer">
                    <div class="writer-profile">
                        <img class="writer-profile-img" src="${post.author.profile_image ? post.author.profile_image : 'https://www.gravatar.com/avatar/?d=mp'}" alt="작성자 이미지">
                    </div>
                    <div class="writer-name">
                        <p><b>${post.author.username}</b></p>
                    </div>
                </div>
            `;

            // 카드 클릭 시 해당 게시글 상세 페이지 이동
            postCard.addEventListener('click', () => {
                window.location.href = `/posts/${post.post_id}`;
            });

            postList.appendChild(postCard);
        }
    };

    // 무한 스크롤 감시 대상
    const sentinel = document.getElementById('sentinel');
    observer.observe(sentinel);

    // 초기 데이터 로드
    await fetchPosts();

    const profileImage = document.getElementById('profile-image');
    const profileNickname = document.getElementById('profile-nickname');

    profileNickname.addEventListener('click', () => {
        window.location.href = `/users/login`;
    });

    // 로그인 상태에 따라 프로필 업데이트
    try {
        const userData = await fetch(`${BASE_URL}/api/auths/profile`, {
            credentials: 'include',
        });
        const user = await userData.json();

        if (user && user.username) {
            const { username, profile_image_url, user_id } = user;
            if (profile_image_url === null) {
                profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
            } else {
                profileImage.src = profile_image_url;
            }

            profileNickname.textContent = `Hi ${username} 😊😊`;

            // 드롭다운 요소 클릭 시 다른 페이지 이동
            document
                .querySelector('.dropdown-content')
                .addEventListener('click', async (event) => {
                    event.preventDefault();

                    const link = event.target;
                    if (link.tagName !== 'A') return;

                    const linkText = link.textContent.trim();

                    try {
                        switch (linkText) {
                            case '회원정보수정':
                                window.location.href = `/users/${user_id}/edit`;
                                break;
                            case '비밀번호수정':
                                window.location.href = `/users/${user_id}/edit-pw`;
                                break;
                            case '로그아웃':
                                await handleLogout();
                                break;
                            default:
                                console.error('Unknown link:', linkText);
                        }
                    } catch (error) {
                        console.error('Error handling dropdown link:', error);
                    }
                });

            // 로그아웃 처리 함수
            const handleLogout = async () => {
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

                    window.location.href = '/posts';
                    profileNickname.textContent = '로그인 해주세요';
                } catch (error) {
                    console.error('Error during logout:', error);
                    alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
                }
            };
        } else {
            profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
            profileNickname.textContent = '로그인 해주세요';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
        profileNickname.textContent = '로그인 해주세요';
    }

    // 프로필을 클릭했을 때 보이거나 숨기도록 함수
    profileImage.addEventListener('click', () => {
        const dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';

        const hideDropdown = (e) => {
            if (!document.querySelector('.dropdown').contains(e.target)) {
                dropdownContent.style.display = 'none';
                window.removeEventListener('click', hideDropdown);
            }
        };

        window.addEventListener('click', hideDropdown);
    });
});
