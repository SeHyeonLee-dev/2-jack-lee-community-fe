import { BASE_URL } from '../../global.js';

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
        window.location.href = '/posts';
    });

    // 제목 최대 26자 제한 설정
    titleInput.addEventListener('input', () => {
        if (titleInput.value.length > 26) {
            titleInput.value = titleInput.value.substring(0, 26);
        }
    });

    // 제목과 내용이 모두 입력되면 helper text 숨기기
    const toggleHelperText = () => {
        helperText.style.display =
            titleInput.value.trim() && contentInput.value.trim()
                ? 'none'
                : 'block';
    };

    // 제목과 내용이 모두 입력되면 완료 버튼 활성화
    const toggleCompleteButton = () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        postAddCompleteBtn.disabled = !(title && content);
        postAddCompleteBtn.style.backgroundColor =
            title && content ? '#7F6AEE' : '#ACA0EB';
    };

    titleInput.addEventListener('input', toggleHelperText);
    contentInput.addEventListener('input', toggleHelperText);

    titleInput.addEventListener('input', toggleCompleteButton);
    contentInput.addEventListener('input', toggleCompleteButton);

    // 완료 버튼 클릭 시 검증
    postAddCompleteBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // 폼의 기본 제출 동작 방지

        const post_title = titleInput.value.trim();
        const post_content = contentInput.value.trim();

        try {
            // 게시글 작성 API 요청
            const postResponse = await fetch(`${BASE_URL}/api/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_title, post_content }),
            });

            const result = await postResponse.json();
            const postId = result.data.post_id;

            // 게시글 이미지 업로드 API 요청
            if (imageInput.files.length > 0) {
                const file = imageInput.files[0];
                const formData = new FormData();
                formData.append('post_image', file);
                formData.append('post_image_name', file.name);

                const uploadResponse = await fetch(
                    `${BASE_URL}/api/posts/${postId}/post-image`,
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                const uploadResult = await uploadResponse.json();
                if (!uploadResponse.ok) {
                    console.error(
                        `게시글 이미지 업로드 실패: ${uploadResult.message}`,
                    );
                    return;
                } else {
                    console.log('게시글 이미지 업로드 성공');
                }
            }

            // 게시글 작성 성공 시 게시글 목록 페이지 이동
            if (confirm('게시글을 작성했습니다.')) {
                window.location.href = '/posts';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('게시글 작성 중 문제가 발생했습니다.');
        }
    });
});
