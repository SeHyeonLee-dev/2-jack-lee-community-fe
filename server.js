import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PORT, LOCALHOST } from './public/utils/constant.js';

const app = express();

// Fix __dirname not defined in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get(['/login', '/'], (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});
app.get('/regist', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/regist.html'));
});
app.get('/editPassword', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/editPassword.html'));
});
app.get('/editUserInfo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/editUserInfo.html'));
});
app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/posts.html'));
});
app.get('/viewPost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viewPost.html'));
});
app.get('/editPost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/editPost.html'));
});
app.get('/writePost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/writePost.html'));
});

// JSON 요청 처리
app.use(express.json());

// 이미지 저장 경로 설정
const imageUploadPath = path.join(__dirname, 'public', 'images');

// images 디렉토리 존재 여부 확인 후 생성
if (!fs.existsSync(imageUploadPath)) {
    fs.mkdirSync(imageUploadPath, { recursive: true }); // 디렉토리 생성
}

// multer의 스토리지 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageUploadPath); // 이미지 저장할 경로
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        const fileName = `profile${Date.now()}${fileExtension}`; // 고유한 파일 이름 생성
        cb(null, fileName); // filename 형식
    },
});

const upload = multer({ storage });

// 이미지 업로드 라우트
app.post('/upLoadProfile', upload.single('image'), (req, res) => {
    if (req.file) {
        const imageUrl = `${LOCALHOST}:${PORT}/images/${req.file.filename}`;
        console.log(imageUrl);
        res.json({ imageUrl });
    } else {
        res.status(400).send('파일 업로드 실패');
    }
});

// 이미지 파일 제공
app.use('/images', express.static(imageUploadPath));

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${LOCALHOST}:${PORT} 에서 실행 중입니다.`);
});
