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
            const response = await fetch('http://localhost:3000/api/posts');
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
    function renderPosts(posts) {
        const postList = document.getElementById('post-list');

        // foreach가 타입 오류때문에 안되서 for문으로 변경
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.style.cursor = 'pointer';

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
                    <img class="writer-profile-img" src="../images/징징이커피.JPG" alt="작성자 이미지">
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
});
