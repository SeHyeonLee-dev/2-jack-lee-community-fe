import dotenv from 'dotenv';

// 실행 환경 감지
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// .env 또는 .env.production 파일 로드
dotenv.config({
    path: ENVIRONMENT === 'production' ? '.env.production' : '.env.local',
});

// `process.env`를 직접 export (ESM 환경 대응)
export const NODE_ENV = process.env.NODE_ENV;
export const BASE_URL = process.env.BASE_URL;
export const BASE_PORT = process.env.BASE_PORT;
export const API_BASE_URL = process.env.API_BASE_URL;
export const API_BASE_PORT = process.env.API_BASE_PORT;
