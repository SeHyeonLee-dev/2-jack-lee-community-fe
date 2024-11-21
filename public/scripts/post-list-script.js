const postBox = document.getElementById('post-box');
const writeBtn = document.getElementById('write-btn');

function navigateToPostAdd() {
    window.location.href = 'post-add.html';
}

// 게시글 작성 버튼 클릭 시 작성 페이지 이동
writeBtn.addEventListener('click', () => {
    navigateToPostAdd();
    createPostCard();
});

writeBtn.addEventListener('mouseout', () => {
    writeBtn.style.backgroundColor = '#ACA0EB';
});

writeBtn.addEventListener('mouseover', () => {
    writeBtn.style.backgroundColor = '#7F6AEE';
});

//게시글 카드 생성 함수
function createPostCard() {
    const postCard = document.createElement('div');
    postCard.classList.add('post-card');
    postCard.innerHTML = `
        <div class="post-title">제목 1</div>
        <div class="post-info">
            <div class="post-info-left">
                    <div class="post-info-item">
                    <p>좋아요</p><span>0</span>
                </div>
                <div class="post-info-item">
                    <p>댓글</p><span>0</span>
                </div>
                <div class="post-info-item">
                    <p>조회수</p><span>0</span>
                </div>
            </div>
            <div class="post-info-right">
                <p>2024-10-31 00:00:00</p>
            </div>
        </div>
        <div class="post-info-writer">
            <div class="writer-profile">
                <img class="writer-profile-img" src="../images/징징이커피.JPG" alt="작성자 이미지">
            </div>
            <div class="writer-name">
                <p><b>더미 작성자1</b></p>
            </div>
        </div>
    `;
    postBox.appendChild(postCard);
}
