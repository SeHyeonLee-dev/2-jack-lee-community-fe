document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const imageInput = document.getElementById('image');
    const helperText = document.getElementById('helper-text');
    const postAddCompleteBtn = document.getElementById('post-add-complete-btn');
    const backButton = document.querySelector('.back-button');

    // 뒤로가기 버튼 클릭시 게시글 페이지 이동
    backButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = 'post-list.html';
    });

    // 제목 최대 26자 제한 설정
    titleInput.addEventListener('input', () => {
        if (titleInput.value.length > 26) {
            titleInput.value = titleInput.value.substring(0, 26);
        }
    });

    // 완료 버튼 이벤트 처리
    document
        .getElementById('title')
        .addEventListener('input', toggleCompleteButton);
    document
        .getElementById('content')
        .addEventListener('input', toggleCompleteButton);

    function toggleCompleteButton() {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const completeButton = document.getElementById('post-add-complete-btn');

        if (title && content) {
            completeButton.disabled = false;
            completeButton.style.backgroundColor = '#7F6AEE';
        } else {
            completeButton.disabled = true;
            completeButton.style.backgroundColor = '#ACA0EB';
        }
    }

    // 완료 버튼 클릭 시 검증
    postAddCompleteBtn.addEventListener('click', (event) => {
        event.preventDefault(); // 폼의 기본 제출 동작 방지

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        //
        if (title && content) {
            helperText.textContent = '*helper text';
            return;
        }

        // 제목과 내용이 모두 작성되었을 경우 폼 데이터를 처리하는 로직
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        // 서버에 데이터를 전송하는 예시 (백엔드 엔드포인트가 필요)
        fetch('/your-backend-endpoint', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});
