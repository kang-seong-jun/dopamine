# 🚀 NeuroBoost 게임 Vercel 배포 가이드

## 📋 배포 준비사항

### 1. 필요한 계정
- [GitHub](https://github.com) 계정
- [Vercel](https://vercel.com) 계정 (GitHub 연동 권장)

### 2. 프로젝트 구조 확인
```
dopamine/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── game.js            # 게임 로직
├── package.json       # 프로젝트 정보
├── vercel.json        # Vercel 설정
├── README.md          # 프로젝트 설명
├── .gitignore         # Git 무시 파일
└── DEPLOYMENT.md      # 이 파일
```

## 🔧 배포 방법

### 방법 1: GitHub 연동 배포 (권장)

#### 1단계: GitHub 리포지토리 생성
```bash
# 로컬에서 Git 초기화
git init

# 파일들 추가
git add .

# 첫 커밋
git commit -m "🧠 Initial commit: NeuroBoost cognitive game"

# GitHub에서 새 리포지토리 생성 후 연결
git remote add origin https://github.com/your-username/neuroboost-game.git

# 푸시
git push -u origin main
```

#### 2단계: Vercel에서 배포
1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 리포지토리 연결
4. `neuroboost-game` 리포지토리 선택
5. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (기본값)
   - **Build Command**: 비워두기 (정적 사이트)
   - **Output Directory**: `./` (기본값)
6. "Deploy" 클릭

### 방법 2: Vercel CLI 배포

#### 1단계: Vercel CLI 설치
```bash
npm i -g vercel
```

#### 2단계: 로그인 및 배포
```bash
# Vercel 로그인
vercel login

# 프로젝트 폴더에서 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 🔧 배포 설정 상세

### vercel.json 설명
```json
{
  "version": 2,                    // Vercel 버전
  "name": "neuroboost-game",      // 프로젝트 이름
  "builds": [                     // 빌드 설정
    {
      "src": "index.html",
      "use": "@vercel/static"      // 정적 파일 빌더
    }
  ],
  "routes": [                     // 라우팅 설정
    {
      "src": "/(.*)",             // 모든 경로
      "dest": "/index.html"       // index.html로 리다이렉트
    }
  ],
  "headers": [                    // HTTP 헤더 설정
    // 캐시 설정 등
  ]
}
```

## 🌐 도메인 설정

### 1. 기본 도메인
배포 완료 후 자동으로 생성되는 도메인:
- `https://neuroboost-game.vercel.app`
- `https://neuroboost-game-git-main-username.vercel.app`

### 2. 커스텀 도메인 연결
1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Domains" 메뉴
3. 원하는 도메인 입력 및 연결
4. DNS 설정 (도메인 제공업체에서)

## 📊 성능 최적화

### 1. 이미지 최적화
- 웹툰 이미지가 있다면 WebP 형식 사용
- 적절한 크기로 리사이징

### 2. 폰트 최적화
- 현재 사용 중인 외부 폰트:
  - Pretendard (CDN)
  - Orbitron (Google Fonts)

### 3. 캐시 설정
- `vercel.json`에서 캐시 헤더 설정 완료
- 정적 파일: 1년 캐시
- HTML: 캐시 비활성화 (업데이트 반영)

## 🔍 배포 후 확인사항

### 1. 기능 테스트
- [ ] 웹툰 인트로 정상 작동
- [ ] 3가지 게임 모두 플레이 가능
- [ ] 가챠 시스템 작동
- [ ] 컬렉션 저장/불러오기
- [ ] 미션 시스템 작동
- [ ] 랭킹 기능
- [ ] 모바일 반응형 확인

### 2. 성능 확인
- [ ] 로딩 속도 (3초 이내)
- [ ] 모바일 성능
- [ ] 다양한 브라우저 호환성

### 3. SEO 확인
- [ ] 메타 태그 적용 확인
- [ ] 파비콘 표시 확인
- [ ] 소셜 미디어 미리보기

## 🐛 트러블슈팅

### 문제: 게임이 로드되지 않음
**해결책**: 
- 브라우저 콘솔에서 JavaScript 오류 확인
- 파일 경로가 올바른지 확인

### 문제: 폰트가 로드되지 않음
**해결책**:
- CDN 링크 확인
- 네트워크 연결 상태 확인

### 문제: 모바일에서 레이아웃 깨짐
**해결책**:
- `viewport` 메타 태그 확인
- CSS 미디어 쿼리 확인

## 🔄 업데이트 배포

### GitHub 연동 시 (자동 배포)
```bash
git add .
git commit -m "✨ 새로운 기능 추가"
git push origin main
```
푸시하면 자동으로 Vercel에서 새 버전 배포

### CLI 사용 시
```bash
vercel --prod
```

## 📈 분석 및 모니터링

### Vercel Analytics
1. Vercel 대시보드에서 "Analytics" 활성화
2. 방문자 수, 성능 지표 확인

### 추가 분석 도구
- Google Analytics 연동 가능
- 사용자 행동 분석 도구 연동

---

## 🎯 배포 완료 체크리스트

- [ ] GitHub 리포지토리 생성 완료
- [ ] Vercel 프로젝트 생성 완료
- [ ] 도메인 연결 완료
- [ ] 기능 테스트 완료
- [ ] 성능 확인 완료
- [ ] SEO 최적화 완료
- [ ] 모바일 테스트 완료

배포 완료 후 게임 링크를 공유하고 사용자 피드백을 수집하세요! 🎮✨ 