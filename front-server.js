import express from 'express';
import path from 'path';

const app = express();
const PORT = 3001;

// 현재 디렉토리 설정
const __dirname = path.resolve();

// 정적 파일 제공을 위한 미들웨어 설정
app.use(express.static(path.join(__dirname, 'public')));

// HTML 파일 처리 (비인증 경로)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/login.html'));
});

app.get('/users/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/signup.html'));
});

app.get('/users/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/login.html'));
});

// HTML 파일 처리 (인증 필요)
app.get('/users/:id/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/user-modify.html'));
});

app.get('/users/:id/edit-pw', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/user-pw-modify.html'));
});

app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/post-list.html'));
});

app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/post-add.html'));
});

app.get('/posts/:post_id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/post-detail.html'));
});

app.get('/posts/:post_id/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html/post-modify.html'));
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`✅ 프론트엔드 서버 실행: http://localhost:${PORT}`);
});
