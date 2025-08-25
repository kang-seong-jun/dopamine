// 게임 상태 관리
class GameState {
    constructor() {
        this.currentScreen = 'webtoon-intro';
        this.currentGame = null;
        this.score = 0;
        this.level = 1;
        this.streak = 0;
        this.totalScore = parseInt(localStorage.getItem('totalScore') || '0');
        this.combo = 1;
        this.gameTimer = null;
        this.timeLeft = 30;
        
        // 도파민 보상 시스템
        this.lastPlayTime = localStorage.getItem('lastPlayTime') || 0;
        this.dailyChallengeProgress = parseInt(localStorage.getItem('dailyChallengeProgress') || '0');
        this.achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
        
        // 가챠 시스템
        this.neuralCrystals = parseInt(localStorage.getItem('neuralCrystals') || '100');
        this.gold = parseInt(localStorage.getItem('gold') || '0');
        this.collection = JSON.parse(localStorage.getItem('collection') || '{}');
        
        // 웹툰 인트로 (항상 표시)
        this.hasSeenIntro = false; // 항상 false로 설정하여 매번 인트로 표시
        this.currentPanel = 1;
        
        // 새로운 시스템들
        this.bestScores = JSON.parse(localStorage.getItem('bestScores') || '{"color-match": 0, "sequence-memory": 0, "reaction-time": 0}');
        this.missions = this.initMissions();
        this.currentTab = 'games';
        
        this.init();
    }
    
    init() {
        if (this.hasSeenIntro) {
            this.loadingAnimation();
        } else {
            this.initWebtoonIntro();
        }
        this.bindEvents();
        this.updateUI();
        this.initGachaSystem();
        this.initCollectionSystem();
        this.initMissionSystem();
        this.initRankingSystem();
        this.checkDailyRewards();
    }
    
    // 웹툰 인트로 초기화
    initWebtoonIntro() {
        // 대사 데이터
        this.dialogues = [
            "인류의 인지능력이 급격히 저하되고 있다...<br>이대로라면 문명이 붕괴할지도 모른다.",
            "과거로 돌아가 인지훈련 시스템을<br>배포해야 한다! 인류를 구하기 위해!",
            "NeuroBoost 시스템 배포 시작!<br>즐겁게 뇌를 훈련하며 미래를 구하자!"
        ];
        
        this.autoProgressIntro();
    }
    
    // 웹툰 자동 진행
    autoProgressIntro() {
        setTimeout(() => {
            if (this.currentPanel < 3) {
                this.nextPanel();
                this.autoProgressIntro();
            } else {
                // 마지막 패널 후 2초 대기 후 자동으로 메인화면으로 이동
                setTimeout(() => {
                    this.skipIntro();
                }, 2000);
            }
        }, 4000);
    }
    
    // 다음 패널로
    nextPanel() {
        if (this.currentPanel < 3) {
            document.querySelector('.panel-' + this.currentPanel).classList.add('hidden');
            document.querySelector('.dot[data-panel="' + this.currentPanel + '"]').classList.remove('active');
            
            this.currentPanel++;
            
            setTimeout(() => {
                document.querySelector('.panel-' + this.currentPanel).classList.remove('hidden');
                document.querySelector('.dot[data-panel="' + this.currentPanel + '"]').classList.add('active');
                
                // 대사 업데이트
                this.updateDialogue();
            }, 300);
        }
    }
    
    // 대사 업데이트
    updateDialogue() {
        const dialogueText = document.getElementById('dialogue-text');
        if (dialogueText && this.dialogues && this.dialogues[this.currentPanel - 1]) {
            // 페이드아웃 효과
            dialogueText.style.opacity = '0';
            dialogueText.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                dialogueText.innerHTML = this.dialogues[this.currentPanel - 1];
                // 페이드인 효과
                dialogueText.style.opacity = '1';
                dialogueText.style.transform = 'translateY(0)';
            }, 300);
        }
    }
    
    // 수동으로 다음 패널로
    manualNextPanel() {
        if (this.currentPanel < 3) {
            this.nextPanel();
        } else {
            // 마지막 패널에서 클릭하면 바로 메인화면으로
            this.skipIntro();
        }
    }
    
    // 특정 패널로 이동
    goToPanel(targetPanel) {
        if (targetPanel < 1 || targetPanel > 3 || targetPanel === this.currentPanel) return;
        
        // 현재 패널 숨기기
        document.querySelector('.panel-' + this.currentPanel).classList.add('hidden');
        document.querySelector('.dot[data-panel="' + this.currentPanel + '"]').classList.remove('active');
        
        // 목표 패널 보이기
        this.currentPanel = targetPanel;
        
        setTimeout(() => {
            document.querySelector('.panel-' + this.currentPanel).classList.remove('hidden');
            document.querySelector('.dot[data-panel="' + this.currentPanel + '"]').classList.add('active');
            
            // 대사 업데이트
            this.updateDialogue();
        }, 300);
    }
    
    // 인트로 건너뛰기
    skipIntro() {
        // hasSeenIntro를 저장하지 않아서 매번 인트로가 보이도록 함
        this.switchScreen('loading-screen');
        this.loadingAnimation();
    }
    
    // 로딩 애니메이션
    loadingAnimation() {
        setTimeout(() => {
            this.switchScreen('main-menu');
        }, 3000);
    }
    
    // 화면 전환
    switchScreen(screenId) {
        document.querySelector('.screen.active').classList.remove('active');
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }
    
    // 이벤트 바인딩
    bindEvents() {
        // 웹툰 인트로 이벤트
        document.getElementById('skip-intro')?.addEventListener('click', () => {
            this.skipIntro();
        });
        
        // 상단 skip 버튼 이벤트
        document.getElementById('top-skip-intro')?.addEventListener('click', () => {
            this.skipIntro();
        });
        
        // 패널 클릭으로 다음 패널로 넘어가기
        document.querySelectorAll('.webtoon-panel').forEach(panel => {
            panel.addEventListener('click', () => {
                if (this.currentScreen === 'webtoon-intro') {
                    this.manualNextPanel();
                }
            });
        });
        
        // 진행점 클릭으로 해당 패널로 이동
        document.querySelectorAll('.progress-dots .dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const targetPanel = parseInt(dot.dataset.panel);
                if (targetPanel !== this.currentPanel) {
                    this.goToPanel(targetPanel);
                }
            });
        });
        
        // 게임 카드 클릭
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.dataset.game;
                this.startGame(gameType);
            });
        });
        
        // 뒤로가기 버튼
        document.getElementById('back-btn').addEventListener('click', () => {
            this.endGame();
            this.switchScreen('main-menu');
        });
        
        // 결과 화면 버튼들
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startGame(this.currentGame);
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.switchScreen('main-menu');
        });
        
        // 보상 팝업
        document.getElementById('claim-reward-btn').addEventListener('click', () => {
            this.claimReward();
        });
        
        // 탭 네비게이션 이벤트
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // 랭킹 필터 이벤트
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const period = btn.dataset.period;
                this.switchRankingPeriod(period);
            });
        });
        
        // 가챠 이벤트
        document.getElementById('gacha-pull')?.addEventListener('click', () => {
            this.performGacha(1);
        });
        
        document.getElementById('gacha-10pull')?.addEventListener('click', () => {
            this.performGacha(10);
        });
        
        document.getElementById('gacha-result-close')?.addEventListener('click', () => {
            document.getElementById('gacha-result-popup').classList.remove('show');
        });
    }
    
    // 게임 시작
    startGame(gameType) {
        this.currentGame = gameType;
        this.score = 0;
        this.combo = 1;
        this.timeLeft = 30;
        
        // 게임 타이틀 업데이트
        const gameTitles = {
            'color-match': '색깔 매칭',
            'sequence-memory': '순서 기억',
            'reaction-time': '반응속도'
        };
        
        document.getElementById('current-game-title').textContent = gameTitles[gameType];
        document.getElementById('current-score').textContent = '0';
        
        this.switchScreen('game-screen');
        this.startTimer();
        
        // 게임별 초기화
        switch(gameType) {
            case 'color-match':
                new ColorMatchGame(this);
                break;
            case 'sequence-memory':
                new SequenceMemoryGame(this);
                break;
            case 'reaction-time':
                new ReactionTimeGame(this);
                break;
        }
    }
    
    // 타이머 시작
    startTimer() {
        const timerElement = document.getElementById('timer');
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            
            // 시간이 10초 이하일 때 경고 효과
            if (this.timeLeft <= 10) {
                timerElement.style.color = '#FF6B9D';
                timerElement.style.animation = 'pulse 0.5s ease-in-out infinite';
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    // 게임 종료
    endGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        // 100점 만점으로 점수 정규화
        const normalizedScore = Math.min(Math.round((this.score / 1000) * 100), 100);
        const finalScore = normalizedScore;
        
        // 점수에 비례한 보상 계산
        const goldReward = Math.floor(finalScore * 10); // 점수 * 10 골드
        const crystalReward = Math.floor(finalScore * 2); // 점수 * 2 크리스탈
        
        this.totalScore += finalScore;
        this.gold += goldReward;
        this.neuralCrystals += crystalReward;
        
        // 최고 점수 업데이트
        if (finalScore > this.bestScores[this.currentGame]) {
            this.bestScores[this.currentGame] = finalScore;
            this.showReward('🏆 신기록!', `${finalScore}점으로 새로운 최고 기록을 달성했습니다!`);
        }
        
        // 레벨업 체크
        this.checkLevelUp();
        
        // 성취도 체크
        this.checkAchievements(finalScore);
        
        // 미션 진행도 체크
        this.updateMissionProgress(this.currentGame, finalScore);
        
        // 랭킹 업데이트
        this.updateRanking(finalScore);
        
        // 예기치 못한 보상 체크
        this.checkSurpriseReward();
        
        // 데이터 저장
        this.saveData();
        
        // 결과 화면 표시
        this.showResults(finalScore, goldReward, crystalReward);
    }
    
    // 점수 추가 및 콤보 시스템
    addScore(points) {
        const bonusPoints = points * this.combo;
        this.score += bonusPoints;
        document.getElementById('current-score').textContent = this.score;
        
        // 뉴럴 크리스탈 획득 (점수의 10%)
        const crystalsEarned = Math.floor(bonusPoints * 0.1);
        this.neuralCrystals += crystalsEarned;
        this.updateGachaUI();
        
        // 콤보 증가
        this.combo = Math.min(this.combo + 0.1, 5); // 최대 5배
        
        // 콤보 표시
        this.showCombo();
        
        // 도파민 효과 (점수가 높을수록 더 화려한 효과)
        if (bonusPoints > 100) {
            this.triggerSpecialEffect();
        }
    }
    
    // 콤보 표시
    showCombo() {
        const comboIndicator = document.getElementById('combo-indicator');
        const comboCount = document.getElementById('combo-count');
        
        comboCount.textContent = Math.floor(this.combo * 10) / 10;
        
        comboIndicator.classList.add('show');
        setTimeout(() => {
            comboIndicator.classList.remove('show');
        }, 1000);
    }
    
    // 특수 효과
    triggerSpecialEffect() {
        // 화면 전체에 반짝이는 효과
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,107,157,0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 999;
            animation: flash 0.5s ease-out;
        `;
        
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 500);
        
        // CSS 애니메이션 추가
        if (!document.getElementById('flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
            style.textContent = `
                @keyframes flash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 레벨업 체크
    checkLevelUp() {
        const newLevel = Math.floor(this.totalScore / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showReward('🏆 레벨업!', `레벨 ${this.level}에 도달했습니다!`);
        }
    }
    
    // 성취도 체크
    checkAchievements(score) {
        const achievements = [
            { id: 'first_game', name: '첫 게임', condition: () => this.totalScore > 0 },
            { id: 'score_1000', name: '점수 마스터', condition: () => score >= 1000 },
            { id: 'combo_master', name: '콤보 마스터', condition: () => this.combo >= 3 },
            { id: 'speed_demon', name: '속도의 악마', condition: () => this.currentGame === 'reaction-time' && score >= 500 }
        ];
        
        achievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showReward('🏅 성취 달성!', achievement.name);
            }
        });
    }
    
    // 일일 챌린지 업데이트
    updateDailyChallenge() {
        const today = new Date().toDateString();
        const lastPlayDate = localStorage.getItem('lastPlayDate');
        
        if (lastPlayDate !== today) {
            this.dailyChallengeProgress = 0;
            localStorage.setItem('lastPlayDate', today);
        }
        
        this.dailyChallengeProgress++;
        
        if (this.dailyChallengeProgress >= 3) {
            this.showReward('🎯 일일 챌린지 완료!', '보너스 점수 500점을 획득했습니다!');
            this.totalScore += 500;
        }
        
        this.updateDailyChallengeUI();
    }
    
    // 예기치 못한 보상
    checkSurpriseReward() {
        const surpriseChance = Math.random();
        
        // 10% 확률로 서프라이즈 보상
        if (surpriseChance < 0.1) {
            const rewards = [
                { icon: '💎', title: '다이아몬드 보너스!', desc: '보너스 점수 300점!', value: 300 },
                { icon: '⭐', title: '별똥별 보너스!', desc: '보너스 점수 200점!', value: 200 },
                { icon: '🍀', title: '행운의 클로버!', desc: '보너스 점수 150점!', value: 150 }
            ];
            
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            this.totalScore += reward.value;
            
            setTimeout(() => {
                this.showReward(reward.title, reward.desc, reward.icon);
            }, 1000);
        }
    }
    
    // 보상 팝업 표시
    showReward(title, description, icon = '🎉') {
        document.getElementById('reward-title').textContent = title;
        document.getElementById('reward-description').textContent = description;
        document.querySelector('.reward-icon').textContent = icon;
        document.getElementById('reward-popup').classList.add('show');
    }
    
    // 보상 수령
    claimReward() {
        document.getElementById('reward-popup').classList.remove('show');
        this.updateUI();
    }
    
    // 일일 보상 체크
    checkDailyRewards() {
        const today = new Date().toDateString();
        const lastRewardDate = localStorage.getItem('lastRewardDate');
        
        if (lastRewardDate !== today) {
            setTimeout(() => {
                this.showReward('🌅 일일 보상!', '매일 로그인 보너스 100점!');
                this.totalScore += 100;
                localStorage.setItem('lastRewardDate', today);
                this.saveData();
            }, 4000);
        }
    }
    
    // 결과 화면 표시
    showResults(finalScore) {
        document.getElementById('final-score').textContent = finalScore;
        
        // 성과에 따른 메시지
        let title = '게임 완료!';
        if (finalScore >= 1000) title = '환상적입니다! 🎉';
        else if (finalScore >= 500) title = '훌륭해요! 👏';
        else if (finalScore >= 200) title = '좋습니다! 😊';
        
        document.getElementById('result-title').textContent = title;
        
        this.switchScreen('result-screen');
    }
    
    // 탭 전환
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 네비게이션 버튼 업데이트
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 탭 콘텐츠 업데이트
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`.${tabName}-tab`).classList.add('active');
        
        // 탭별 데이터 업데이트
        switch(tabName) {
            case 'collection':
                this.updateCollectionUI();
                break;
            case 'mission':
                this.updateMissionUI();
                break;
            case 'ranking':
                this.updateRankingUI();
                break;
        }
    }
    
    // UI 업데이트
    updateUI() {
        document.getElementById('total-score').textContent = this.totalScore;
        document.getElementById('level').textContent = this.level;
        document.getElementById('gold').textContent = this.gold;
        document.getElementById('crystals').textContent = this.neuralCrystals;
        
        // 최고 점수 업데이트
        document.getElementById('color-best').textContent = this.bestScores['color-match'];
        document.getElementById('sequence-best').textContent = this.bestScores['sequence-memory'];
        document.getElementById('reaction-best').textContent = this.bestScores['reaction-time'];
    }
    
    // 일일 챌린지 UI 업데이트
    updateDailyChallengeUI() {
        const progress = Math.min(this.dailyChallengeProgress, 3);
        const percentage = (progress / 3) * 100;
        
        document.querySelector('.progress-fill').style.width = `${percentage}%`;
        document.querySelector('.progress-text').textContent = `${progress}/3`;
    }
    
    // 가챠 시스템 초기화
    initGachaSystem() {
        this.updateGachaUI();
        
        // 가챠 아이템 데이터베이스
        this.gachaItems = {
            legendary: [
                { id: 'quantum_brain', name: '양자 뇌파', icon: '🌟', rarity: 'legendary', crystals: 500 },
                { id: 'time_crystal', name: '시공 크리스탈', icon: '💎', rarity: 'legendary', crystals: 400 },
                { id: 'neural_crown', name: '뉴럴 크라운', icon: '👑', rarity: 'legendary', crystals: 600 }
            ],
            epic: [
                { id: 'synapse_booster', name: '시냅스 부스터', icon: '💜', rarity: 'epic', crystals: 200 },
                { id: 'memory_chip', name: '메모리 칩', icon: '🔮', rarity: 'epic', crystals: 180 },
                { id: 'focus_lens', name: '집중 렌즈', icon: '🔍', rarity: 'epic', crystals: 220 }
            ],
            rare: [
                { id: 'brain_juice', name: '브레인 주스', icon: '💙', rarity: 'rare', crystals: 80 },
                { id: 'neural_patch', name: '뉴럴 패치', icon: '🧩', rarity: 'rare', crystals: 70 },
                { id: 'mind_gem', name: '마인드 젬', icon: '💎', rarity: 'rare', crystals: 90 }
            ],
            common: [
                { id: 'brain_food', name: '브레인 푸드', icon: '🤍', rarity: 'common', crystals: 20 },
                { id: 'energy_pill', name: '에너지 알약', icon: '⚪', rarity: 'common', crystals: 15 },
                { id: 'focus_candy', name: '집중 캔디', icon: '🍬', rarity: 'common', crystals: 25 }
            ]
        };
    }
    
    // 가챠 UI 업데이트
    updateGachaUI() {
        document.getElementById('neural-crystals').textContent = this.neuralCrystals;
        
        const gachaPull = document.getElementById('gacha-pull');
        const gacha10Pull = document.getElementById('gacha-10pull');
        
        gachaPull.disabled = this.neuralCrystals < 100;
        gacha10Pull.disabled = this.neuralCrystals < 900;
    }
    
    // 가챠 실행
    performGacha(count) {
        const cost = count === 1 ? 100 : 900;
        
        if (this.neuralCrystals < cost) {
            this.showReward('💎 크리스탈 부족!', '뉴럴 크리스탈이 부족합니다. 게임을 플레이해서 더 얻어보세요!');
            return;
        }
        
        this.neuralCrystals -= cost;
        const results = [];
        let totalCrystalsEarned = 0;
        
        for (let i = 0; i < count; i++) {
            const item = this.rollGacha();
            results.push(item);
            totalCrystalsEarned += item.crystals;
            
            // 컬렉션에 추가
            if (!this.collection[item.id]) {
                this.collection[item.id] = 0;
            }
            this.collection[item.id]++;
        }
        
        this.neuralCrystals += totalCrystalsEarned;
        this.updateGachaUI();
        this.showGachaResults(results, totalCrystalsEarned);
        this.saveData();
        
        // 도파민 폭발 효과!
        this.triggerGachaEffect(results);
    }
    
    // 가챠 확률 계산
    rollGacha() {
        const random = Math.random() * 100;
        
        if (random < 1) {
            // 1% 전설
            const items = this.gachaItems.legendary;
            return items[Math.floor(Math.random() * items.length)];
        } else if (random < 6) {
            // 5% 영웅
            const items = this.gachaItems.epic;
            return items[Math.floor(Math.random() * items.length)];
        } else if (random < 26) {
            // 20% 희귀
            const items = this.gachaItems.rare;
            return items[Math.floor(Math.random() * items.length)];
        } else {
            // 74% 일반
            const items = this.gachaItems.common;
            return items[Math.floor(Math.random() * items.length)];
        }
    }
    
    // 가챠 결과 표시
    showGachaResults(results, crystalsEarned) {
        const resultsGrid = document.getElementById('gacha-results-grid');
        resultsGrid.innerHTML = '';
        
        results.forEach((item, index) => {
            setTimeout(() => {
                const resultElement = document.createElement('div');
                resultElement.className = `gacha-result-item ${item.rarity}`;
                resultElement.innerHTML = `
                    <div class="gacha-result-item-icon">${item.icon}</div>
                    <div class="gacha-result-item-name">${item.name}</div>
                    <div class="gacha-result-item-rarity">${this.getRarityText(item.rarity)}</div>
                `;
                resultsGrid.appendChild(resultElement);
                
                // 전설 아이템 특수 효과
                if (item.rarity === 'legendary') {
                    this.triggerLegendaryEffect();
                }
            }, index * 200);
        });
        
        document.getElementById('crystals-earned').textContent = crystalsEarned;
        
        setTimeout(() => {
            document.getElementById('gacha-result-popup').classList.add('show');
        }, results.length * 200 + 500);
    }
    
    // 등급 텍스트 변환
    getRarityText(rarity) {
        const rarityTexts = {
            legendary: '전설',
            epic: '영웅', 
            rare: '희귀',
            common: '일반'
        };
        return rarityTexts[rarity] || '일반';
    }
    
    // 가챠 특수 효과
    triggerGachaEffect(results) {
        // 전설 아이템이 나왔을 때 화면 전체 골드 효과
        const hasLegendary = results.some(item => item.rarity === 'legendary');
        if (hasLegendary) {
            this.triggerLegendaryEffect();
        }
        
        // 연속 희귀 이상 효과
        const rareOrBetter = results.filter(item => ['rare', 'epic', 'legendary'].includes(item.rarity));
        if (rareOrBetter.length >= 3) {
            this.triggerMultiRareEffect();
        }
    }
    
    // 전설급 효과
    triggerLegendaryEffect() {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%);
            pointer-events: none;
            z-index: 999;
            animation: legendaryFlash 2s ease-out;
        `;
        
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 2000);
        
        // 전설 사운드 효과 (시각적 표현)
        this.showReward('🌟 전설급 발견!', '놀라운 전설급 아이템을 획득했습니다!', '🌟');
    }
    
    // 다중 희귀 효과
    triggerMultiRareEffect() {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: conic-gradient(from 0deg, rgba(255,107,157,0.3), rgba(78,205,196,0.3), rgba(255,230,109,0.3), rgba(255,138,91,0.3));
            pointer-events: none;
            z-index: 999;
            animation: rainbowSpin 3s ease-out;
        `;
        
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 3000);
    }
    
    // 컬렉션 시스템 초기화
    initCollectionSystem() {
        this.updateCollectionUI();
    }
    
    // 미션 시스템 초기화
    initMissionSystem() {
        this.updateMissionUI();
    }
    
    // 미션 데이터 초기화
    initMissions() {
        return [
            {
                id: 'first_100_score',
                title: '첫 만점 도전',
                description: '어떤 게임에서든 100점을 달성하세요',
                target: 100,
                current: 0,
                type: 'score',
                reward: { gold: 500, crystals: 100 },
                completed: false
            },
            {
                id: 'total_games_10',
                title: '기초 훈련 완료',
                description: '총 10게임을 플레이하세요',
                target: 10,
                current: 0,
                type: 'games_played',
                reward: { gold: 200, crystals: 50 },
                completed: false
            },
            {
                id: 'collect_legendary',
                title: '전설의 시작',
                description: '전설급 아이템 1개를 수집하세요',
                target: 1,
                current: 0,
                type: 'legendary_items',
                reward: { gold: 1000, crystals: 200 },
                completed: false
            }
        ];
    }
    
    // 랭킹 시스템 초기화
    initRankingSystem() {
        this.rankings = {
            daily: JSON.parse(localStorage.getItem('dailyRanking') || '[]'),
            weekly: JSON.parse(localStorage.getItem('weeklyRanking') || '[]'),
            monthly: JSON.parse(localStorage.getItem('monthlyRanking') || '[]')
        };
        this.updateRankingUI();
    }
    
    // 컬렉션 UI 업데이트
    updateCollectionUI() {
        const collectionGrid = document.getElementById('collection-grid');
        const allItems = [...this.gachaItems.legendary, ...this.gachaItems.epic, ...this.gachaItems.rare, ...this.gachaItems.common];
        
        let collectedCount = 0;
        let totalBrainPower = 0;
        
        collectionGrid.innerHTML = '';
        
        allItems.forEach(item => {
            const count = this.collection[item.id] || 0;
            const isOwned = count > 0;
            
            if (isOwned) {
                collectedCount++;
                totalBrainPower += item.crystals * count;
            }
            
            const itemElement = document.createElement('div');
            itemElement.className = `collection-item ${isOwned ? 'owned' : 'locked'} ${item.rarity}`;
            itemElement.innerHTML = `
                <div class="collection-item-icon">${isOwned ? item.icon : '?'}</div>
                <div class="collection-item-name">${isOwned ? item.name : '???'}</div>
                <div class="collection-item-count">보유: ${count}개</div>
                <div class="collection-item-power">뇌력: ${isOwned ? item.crystals : '???'}</div>
            `;
            
            collectionGrid.appendChild(itemElement);
        });
        
        document.getElementById('collected-count').textContent = collectedCount;
        document.getElementById('total-items').textContent = allItems.length;
        document.getElementById('total-brain-power').textContent = totalBrainPower;
    }
    
    // 미션 UI 업데이트
    updateMissionUI() {
        const missionList = document.getElementById('mission-list');
        missionList.innerHTML = '';
        
        this.missions.forEach(mission => {
            const missionElement = document.createElement('div');
            missionElement.className = `mission-item ${mission.completed ? 'completed' : ''}`;
            missionElement.innerHTML = `
                <div class="mission-title">${mission.title}</div>
                <div class="mission-desc">${mission.description}</div>
                <div class="mission-progress">${mission.current}/${mission.target}</div>
                <div class="mission-reward">보상: ${mission.reward.gold}골드, ${mission.reward.crystals}크리스탈</div>
            `;
            
            missionList.appendChild(missionElement);
        });
        
        // 전체 미션 진행도 계산
        const completedMissions = this.missions.filter(m => m.completed).length;
        const totalMissions = this.missions.length;
        const progressPercent = Math.floor((completedMissions / totalMissions) * 100);
        
        document.getElementById('mission-progress-percent').textContent = progressPercent;
        
        // 원형 진행바 업데이트
        const circle = document.getElementById('progress-circle');
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (progressPercent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    // 랭킹 UI 업데이트
    updateRankingUI() {
        const period = document.querySelector('.filter-btn.active').dataset.period;
        this.switchRankingPeriod(period);
    }
    
    // 랭킹 기간 전환
    switchRankingPeriod(period) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        const rankingList = document.getElementById('ranking-list');
        const rankings = this.rankings[period] || [];
        
        rankingList.innerHTML = '';
        
        if (rankings.length === 0) {
            rankingList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">아직 랭킹 데이터가 없습니다.</p>';
            return;
        }
        
        rankings.slice(0, 10).forEach((entry, index) => {
            const rankingElement = document.createElement('div');
            rankingElement.className = `ranking-item ${index < 3 ? 'top-3' : ''}`;
            rankingElement.innerHTML = `
                <div class="ranking-left">
                    <div class="ranking-position">${index + 1}</div>
                    <div class="ranking-name">${entry.name}</div>
                </div>
                <div class="ranking-score">${entry.score}점</div>
            `;
            
            rankingList.appendChild(rankingElement);
        });
    }
    
    // 미션 진행도 업데이트
    updateMissionProgress(gameType, score) {
        this.missions.forEach(mission => {
            if (mission.completed) return;
            
            switch(mission.type) {
                case 'score':
                    if (score >= mission.target) {
                        mission.current = mission.target;
                        this.completeMission(mission);
                    }
                    break;
                case 'games_played':
                    mission.current = Math.min(mission.current + 1, mission.target);
                    if (mission.current >= mission.target) {
                        this.completeMission(mission);
                    }
                    break;
                case 'legendary_items':
                    const legendaryCount = Object.keys(this.collection).filter(id => 
                        this.gachaItems.legendary.some(item => item.id === id) && this.collection[id] > 0
                    ).length;
                    mission.current = legendaryCount;
                    if (mission.current >= mission.target) {
                        this.completeMission(mission);
                    }
                    break;
            }
        });
    }
    
    // 미션 완료
    completeMission(mission) {
        mission.completed = true;
        this.gold += mission.reward.gold;
        this.neuralCrystals += mission.reward.crystals;
        
        this.showReward(
            '🎯 미션 완료!', 
            `${mission.title}을 완료했습니다! ${mission.reward.gold}골드와 ${mission.reward.crystals}크리스탈을 획득했습니다!`
        );
    }
    
    // 랭킹 업데이트
    updateRanking(score) {
        const playerName = '플레이어'; // 실제로는 사용자 이름을 받아야 함
        const entry = { name: playerName, score: score, timestamp: Date.now() };
        
        // 일일 랭킹 업데이트
        this.rankings.daily.push(entry);
        this.rankings.daily.sort((a, b) => b.score - a.score);
        this.rankings.daily = this.rankings.daily.slice(0, 100); // 상위 100명만 보관
        
        // 주간, 월간 랭킹도 동일하게 처리 (실제로는 날짜 체크 필요)
        this.rankings.weekly.push(entry);
        this.rankings.weekly.sort((a, b) => b.score - a.score);
        this.rankings.weekly = this.rankings.weekly.slice(0, 100);
        
        this.rankings.monthly.push(entry);
        this.rankings.monthly.sort((a, b) => b.score - a.score);
        this.rankings.monthly = this.rankings.monthly.slice(0, 100);
    }
    
    // 결과 화면 표시 (수정)
    showResults(finalScore, goldReward, crystalReward) {
        document.getElementById('final-score').textContent = finalScore;
        
        // 성과에 따른 메시지
        let title = '게임 완료!';
        if (finalScore >= 90) title = '완벽합니다! 🎉';
        else if (finalScore >= 80) title = '훌륭해요! 👏';
        else if (finalScore >= 70) title = '좋습니다! 😊';
        else if (finalScore >= 60) title = '괜찮아요! 👍';
        
        document.getElementById('result-title').textContent = title;
        
        // 보상 정보 표시
        const rewardsDiv = document.getElementById('rewards');
        rewardsDiv.innerHTML = `
            <div class="reward-summary">
                <h4>획득한 보상</h4>
                <div class="reward-items">
                    <span class="reward-item">💰 ${goldReward} 골드</span>
                    <span class="reward-item">💎 ${crystalReward} 크리스탈</span>
                </div>
            </div>
        `;
        
        this.switchScreen('result-screen');
    }
    
    // 데이터 저장
    saveData() {
        localStorage.setItem('totalScore', this.totalScore.toString());
        localStorage.setItem('level', this.level.toString());
        localStorage.setItem('gold', this.gold.toString());
        localStorage.setItem('dailyChallengeProgress', this.dailyChallengeProgress.toString());
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
        localStorage.setItem('lastPlayTime', Date.now().toString());
        localStorage.setItem('neuralCrystals', this.neuralCrystals.toString());
        localStorage.setItem('collection', JSON.stringify(this.collection));
        localStorage.setItem('bestScores', JSON.stringify(this.bestScores));
        localStorage.setItem('dailyRanking', JSON.stringify(this.rankings.daily));
        localStorage.setItem('weeklyRanking', JSON.stringify(this.rankings.weekly));
        localStorage.setItem('monthlyRanking', JSON.stringify(this.rankings.monthly));
    }
}

// 색깔 매칭 게임
class ColorMatchGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8A5B', '#8B5FBF', '#45B7D1'];
        this.currentTarget = null;
        this.init();
    }
    
    init() {
        this.createGameBoard();
        this.nextRound();
    }
    
    createGameBoard() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="color-match-container">
                <div class="target-color-section">
                    <h3>찾아야 할 색깔:</h3>
                    <div class="target-color" id="target-color"></div>
                </div>
                <div class="color-grid" id="color-grid">
                    <!-- 색깔 버튼들이 여기에 생성됩니다 -->
                </div>
            </div>
        `;
        
        // CSS 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .color-match-container {
                text-align: center;
                width: 100%;
            }
            .target-color-section {
                margin-bottom: 30px;
            }
            .target-color {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin: 15px auto;
                border: 3px solid white;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            .color-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                max-width: 300px;
                margin: 0 auto;
            }
            .color-option {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 3px solid white;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            .color-option:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    nextRound() {
        // 타겟 색깔 설정
        this.currentTarget = this.colors[Math.floor(Math.random() * this.colors.length)];
        document.getElementById('target-color').style.backgroundColor = this.currentTarget;
        
        // 색깔 옵션들 생성 (정답 + 5개 오답)
        const options = [this.currentTarget];
        while (options.length < 6) {
            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            if (!options.includes(randomColor)) {
                options.push(randomColor);
            }
        }
        
        // 셔플
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // 색깔 버튼들 생성
        const colorGrid = document.getElementById('color-grid');
        colorGrid.innerHTML = '';
        
        options.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.addEventListener('click', () => this.selectColor(color));
            colorGrid.appendChild(colorOption);
        });
    }
    
    selectColor(selectedColor) {
        if (selectedColor === this.currentTarget) {
            // 정답!
            this.gameState.addScore(50 + Math.floor(Math.random() * 50)); // 50-100점 랜덤
            this.nextRound();
        } else {
            // 오답 - 콤보 리셋
            this.gameState.combo = 1;
        }
    }
}

// 순서 기억 게임
class SequenceMemoryGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.sequence = [];
        this.playerInput = [];
        this.isPlaying = false;
        this.init();
    }
    
    init() {
        this.createGameBoard();
        this.startRound();
    }
    
    createGameBoard() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="sequence-container">
                <div class="sequence-info">
                    <h3 id="sequence-instruction">패턴을 기억하세요!</h3>
                    <div class="sequence-level">레벨: <span id="sequence-level">1</span></div>
                </div>
                <div class="sequence-grid" id="sequence-grid">
                    <!-- 버튼들이 여기에 생성됩니다 -->
                </div>
            </div>
        `;
        
        // CSS 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .sequence-container {
                text-align: center;
                width: 100%;
            }
            .sequence-info {
                margin-bottom: 30px;
            }
            .sequence-level {
                font-size: 1.2rem;
                color: #FFE66D;
                margin-top: 10px;
            }
            .sequence-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                max-width: 200px;
                margin: 0 auto;
            }
            .sequence-button {
                width: 80px;
                height: 80px;
                border-radius: 15px;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                font-size: 2rem;
            }
            .sequence-button:hover {
                transform: scale(1.05);
            }
            .sequence-button.active {
                transform: scale(1.1);
                box-shadow: 0 0 20px rgba(255,255,255,0.8);
            }
        `;
        document.head.appendChild(style);
        
        // 4개의 버튼 생성
        const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8A5B'];
        const emojis = ['🔥', '💎', '⭐', '🌟'];
        const grid = document.getElementById('sequence-grid');
        
        for (let i = 0; i < 4; i++) {
            const button = document.createElement('button');
            button.className = 'sequence-button';
            button.style.backgroundColor = colors[i];
            button.textContent = emojis[i];
            button.dataset.index = i;
            button.addEventListener('click', () => this.buttonClick(i));
            grid.appendChild(button);
        }
    }
    
    startRound() {
        this.playerInput = [];
        this.sequence.push(Math.floor(Math.random() * 4));
        document.getElementById('sequence-level').textContent = this.sequence.length;
        document.getElementById('sequence-instruction').textContent = '패턴을 기억하세요!';
        
        this.playSequence();
    }
    
    playSequence() {
        this.isPlaying = true;
        let index = 0;
        
        const playNext = () => {
            if (index < this.sequence.length) {
                this.highlightButton(this.sequence[index]);
                index++;
                setTimeout(playNext, 800);
            } else {
                this.isPlaying = false;
                document.getElementById('sequence-instruction').textContent = '패턴을 따라해보세요!';
            }
        };
        
        setTimeout(playNext, 1000);
    }
    
    highlightButton(index) {
        const button = document.querySelector(`[data-index="${index}"]`);
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 400);
    }
    
    buttonClick(index) {
        if (this.isPlaying) return;
        
        this.highlightButton(index);
        this.playerInput.push(index);
        
        // 현재까지의 입력이 올바른지 체크
        const currentIndex = this.playerInput.length - 1;
        if (this.playerInput[currentIndex] !== this.sequence[currentIndex]) {
            // 틀렸을 때
            document.getElementById('sequence-instruction').textContent = '틀렸습니다! 다시 시도하세요.';
            this.gameState.combo = 1;
            setTimeout(() => this.startRound(), 1500);
            return;
        }
        
        // 전체 시퀀스를 완료했는지 체크
        if (this.playerInput.length === this.sequence.length) {
            // 성공!
            const points = this.sequence.length * 30; // 길이에 따라 점수 증가
            this.gameState.addScore(points);
            document.getElementById('sequence-instruction').textContent = '성공! 다음 레벨...';
            setTimeout(() => this.startRound(), 1000);
        }
    }
}

// 반응속도 게임
class ReactionTimeGame {
    constructor(gameState) {
        this.gameState = gameState;
        this.isWaiting = false;
        this.startTime = 0;
        this.init();
    }
    
    init() {
        this.createGameBoard();
        this.startRound();
    }
    
    createGameBoard() {
        const gameArea = document.getElementById('game-area');
        gameArea.innerHTML = `
            <div class="reaction-container">
                <div class="reaction-instruction" id="reaction-instruction">
                    화면이 초록색으로 바뀌면 클릭하세요!
                </div>
                <div class="reaction-area" id="reaction-area">
                    클릭 대기 중...
                </div>
                <div class="reaction-stats">
                    <div class="best-time">최고 기록: <span id="best-time">-</span>ms</div>
                    <div class="average-time">평균: <span id="average-time">-</span>ms</div>
                </div>
            </div>
        `;
        
        // CSS 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .reaction-container {
                text-align: center;
                width: 100%;
            }
            .reaction-instruction {
                font-size: 1.3rem;
                margin-bottom: 30px;
                color: #FFE66D;
            }
            .reaction-area {
                width: 300px;
                height: 300px;
                border-radius: 20px;
                background: #FF6B9D;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                user-select: none;
            }
            .reaction-area:hover {
                transform: scale(1.02);
            }
            .reaction-area.ready {
                background: #4ECDC4;
                box-shadow: 0 0 30px rgba(78, 205, 196, 0.8);
            }
            .reaction-area.too-early {
                background: #FF8A5B;
                animation: shake 0.5s ease-in-out;
            }
            .reaction-stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
            }
            .reaction-stats > div {
                font-size: 1.1rem;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
        
        document.getElementById('reaction-area').addEventListener('click', () => this.handleClick());
    }
    
    startRound() {
        const reactionArea = document.getElementById('reaction-area');
        const instruction = document.getElementById('reaction-instruction');
        
        reactionArea.className = 'reaction-area';
        reactionArea.textContent = '대기 중...';
        instruction.textContent = '빨간색일 때는 클릭하지 마세요!';
        
        this.isWaiting = true;
        
        // 2-5초 후 초록색으로 변경
        const delay = 2000 + Math.random() * 3000;
        setTimeout(() => {
            if (this.isWaiting) {
                reactionArea.classList.add('ready');
                reactionArea.textContent = '지금 클릭!';
                instruction.textContent = '지금 클릭하세요!';
                this.startTime = Date.now();
            }
        }, delay);
    }
    
    handleClick() {
        const reactionArea = document.getElementById('reaction-area');
        const instruction = document.getElementById('reaction-instruction');
        
        if (!this.isWaiting) {
            return;
        }
        
        if (!reactionArea.classList.contains('ready')) {
            // 너무 빨리 클릭함
            reactionArea.classList.add('too-early');
            instruction.textContent = '너무 빨라요! 초록색이 될 때까지 기다리세요.';
            this.gameState.combo = 1;
            
            setTimeout(() => {
                reactionArea.classList.remove('too-early');
                this.startRound();
            }, 1500);
            return;
        }
        
        // 반응시간 계산
        const reactionTime = Date.now() - this.startTime;
        this.isWaiting = false;
        
        // 점수 계산 (빠를수록 높은 점수)
        let points = Math.max(500 - reactionTime, 50);
        this.gameState.addScore(points);
        
        // 기록 업데이트
        this.updateStats(reactionTime);
        
        // 결과 표시
        reactionArea.textContent = `${reactionTime}ms`;
        instruction.textContent = `반응시간: ${reactionTime}ms`;
        
        // 다음 라운드
        setTimeout(() => this.startRound(), 1500);
    }
    
    updateStats(reactionTime) {
        // 최고 기록 업데이트
        const bestTime = localStorage.getItem('bestReactionTime');
        if (!bestTime || reactionTime < parseInt(bestTime)) {
            localStorage.setItem('bestReactionTime', reactionTime.toString());
            document.getElementById('best-time').textContent = reactionTime;
        } else {
            document.getElementById('best-time').textContent = bestTime;
        }
        
        // 평균 시간 계산
        const reactionTimes = JSON.parse(localStorage.getItem('reactionTimes') || '[]');
        reactionTimes.push(reactionTime);
        if (reactionTimes.length > 10) reactionTimes.shift(); // 최근 10개만 보관
        
        const average = Math.round(reactionTimes.reduce((a, b) => a + b) / reactionTimes.length);
        document.getElementById('average-time').textContent = average;
        
        localStorage.setItem('reactionTimes', JSON.stringify(reactionTimes));
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    new GameState();
}); 