
        // Firebase 配置
        const firebaseConfig = {
            apiKey: "AIzaSyDk3ZOVIX-D1KoE1EoW0veXYnr_P4115FU",
            authDomain: "qiuhaiweb.firebaseapp.com",
            projectId: "qiuhaiweb",
            storageBucket: "qiuhaiweb.firebasestorage.app",
            messagingSenderId: "412193723528",
            appId: "1:412193723528:web:51c5a6c81cfcee0e3d3b3d",
            measurementId: "G-3V9NXVK3XD"
        };

        let firebaseEnabled = false;
        let db = null;

        function initFirebaseForLeaderboard() {
            try {
                if (window.firebase) {
                    firebase.initializeApp(firebaseConfig);
                    db = firebase.firestore();
                    firebaseEnabled = true;
                    console.log('Firebase 已初始化（排行榜远程存储）');
                    // 测试Firebase连接
                    db.collection('scores_snake').limit(1).get()
                        .then(() => console.log('Firebase连接成功'))
                        .catch(err => {
                            console.warn('Firebase连接测试失败：', err);
                            // 即使测试失败，也保留firebaseEnabled为true，让实际请求时处理错误
                        });
                }
            } catch (e) {
                console.warn('Firebase 初始化失败：', e);
                firebaseEnabled = false;
            }
        }

        async function saveScoreRemote(gameType, record) {
            if (!firebaseEnabled || !db) return false;
            try {
                await db.collection('scores_' + gameType).add(Object.assign({}, record, {
                    date: firebase.firestore.Timestamp.fromDate(new Date(record.date))
                }));
                return true;
            } catch (e) {
                console.error('saveScoreRemote 错误', e);
                return false;
            }
        }

        async function loadLeaderboardRemote(gameType, limit = 50) {
            if (!firebaseEnabled || !db) return [];
            try {
                console.log(`开始从Firebase加载${gameType}游戏的排行榜数据`);
                const collectionName = 'scores_' + gameType;
                console.log(`Firebase集合名称: ${collectionName}`);
                
                // 直接获取所有用户的记录，不进行任何过滤
                const snap = await db.collection(collectionName)
                    .orderBy('score', 'desc')
                    .limit(limit)
                    .get();
                
                console.log(`Firebase查询结果: ${snap.size}条记录`);
                
                const result = snap.docs.map(d => {
                    const data = d.data();
                    console.log(`处理记录: ${JSON.stringify(data)}`);
                    return {
                        id: d.id,
                        name: data.name || '未知用户',
                        score: data.score || 0,
                        level: data.level || 1,
                        stage: data.stage || 1,
                        date: data.date && data.date.toDate ? data.date.toDate().toISOString() : new Date().toISOString()
                    };
                });
                
                console.log(`返回的排行榜数据: ${JSON.stringify(result)}`);
                return result;
            } catch (e) {
                console.error('loadLeaderboardRemote 错误', e);
                return [];
            }
        }

        // 初始化 Firebase
        initFirebaseForLeaderboard();

        // 创建星空背景
        function createStars() {
            const starsContainer = document.getElementById('stars');
            const starCount = 150;
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.classList.add('star');
                
                // 随机位置和大小
                const size = Math.random() * 3 + 1;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const delay = Math.random() * 5;
                
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.left = `${x}%`;
                star.style.top = `${y}%`;
                star.style.animationDelay = `${delay}s`;
                
                starsContainer.appendChild(star);
            }
        }
        
        // 创建悬浮粒子效果
        function createFloatingParticles() {
            const particleCount = 20;
            
            for (let i = 0; i < particleCount; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.classList.add('floating-particle');
                    
                    // 随机位置
                    const x = Math.random() * 100;
                    const y = Math.random() * 100;
                    
                    // 随机颜色
                    const colors = [
                        'rgba(255, 0, 100, 0.7)',
                        'rgba(74, 0, 255, 0.7)',
                        'rgba(0, 217, 255, 0.7)',
                        'rgba(255, 204, 0, 0.7)'
                    ];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    // 随机大小
                    const size = Math.random() * 3 + 2;
                    
                    particle.style.left = `${x}%`;
                    particle.style.top = `${y}%`;
                    particle.style.backgroundColor = color;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.animation = `float ${Math.random() * 10 + 10}s infinite ease-in-out`;
                    particle.style.animationDelay = `${Math.random() * 5}s`;
                    
                    document.body.appendChild(particle);
                }, i * 100);
            }
        }
        
        // 添加地球的鼠标交互效果
        function addEarthInteraction() {
            const earths = document.querySelectorAll('.earth');
            
            earths.forEach(earth => {
                earth.addEventListener('mouseenter', () => {
                    if (currentGame) return; // 如果正在游戏中，不触发交互
                    
                    // 加速地球旋转
                    earth.style.animationDuration = '20s';
                    
                    // 增强光效
                    const sphere = earth.querySelector('.earth-sphere');
                    if (sphere) {
                        sphere.style.boxShadow = 
                            'inset -40px -40px 80px rgba(0, 0, 0, 0.8), ' +
                            'inset 40px 40px 80px rgba(255, 255, 255, 0.15), ' +
                            '0 0 150px rgba(0, 217, 255, 0.6)';
                    }
                    
                    // 创建环绕粒子
                    createOrbitingParticles(earth);
                });
                
                earth.addEventListener('mouseleave', () => {
                    if (currentGame) return;
                    
                    // 恢复地球旋转速度
                    earth.style.animationDuration = '40s';
                    
                    // 恢复光效
                    const sphere = earth.querySelector('.earth-sphere');
                    if (sphere) {
                        sphere.style.boxShadow = 
                            'inset -30px -30px 60px rgba(0, 0, 0, 0.7), ' +
                            'inset 30px 30px 60px rgba(255, 255, 255, 0.1), ' +
                            '0 0 100px rgba(0, 217, 255, 0.4)';
                    }
                });
                
                earth.addEventListener('click', () => {
                    if (currentGame) return;
                    
                    // 点击地球播放特殊音效
                    createEarthClickSound();
                    
                    // 创建点击特效
                    createEarthExplosion(earth);
                });
            });
        }

        // 创建环绕地球的粒子
        function createOrbitingParticles(earth) {
            const particleCount = 8;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('orbit-particle');
                
                // 设置粒子样式
                particle.style.position = 'absolute';
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.backgroundColor = '#00d9ff';
                particle.style.borderRadius = '50%';
                particle.style.boxShadow = '0 0 20px #00d9ff';
                
                // 计算轨道位置
                const angle = (Math.PI * 2 / particleCount) * i;
                const orbitRadius = 150;
                
                // 设置动画
                particle.style.animation = `orbitParticle ${5 + Math.random() * 3}s linear infinite`;
                particle.style.animationDelay = `${Math.random() * 2}s`;
                
                earth.querySelector('.earth-orbit').appendChild(particle);
                
                // 3秒后移除粒子
                setTimeout(() => {
                    particle.style.opacity = '0';
                    particle.style.transition = 'opacity 0.5s';
                    
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.remove();
                        }
                    }, 500);
                }, 3000);
            }
        }

        // 创建地球点击音效
        function createEarthClickSound() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建主增益节点
            const masterGain = audioContext.createGain();
            masterGain.gain.value = 0.3;
            masterGain.connect(audioContext.destination);
            
            // 创建太空音效
            const oscillator1 = audioContext.createOscillator();
            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(329.63, audioContext.currentTime); // E4
            
            const gainNode1 = audioContext.createGain();
            gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode1.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
            gainNode1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
            
            oscillator1.connect(gainNode1);
            gainNode1.connect(masterGain);
            
            // 添加和声
            const oscillator2 = audioContext.createOscillator();
            oscillator2.type = 'triangle';
            oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
            
            const gainNode2 = audioContext.createGain();
            gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
            gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(masterGain);
            
            oscillator1.start();
            oscillator1.stop(audioContext.currentTime + 1);
            
            oscillator2.start();
            oscillator2.stop(audioContext.currentTime + 0.8);
        }

        // 创建地球点击爆炸特效
        function createEarthExplosion(earth) {
            const explosionCount = 20;
            
            for (let i = 0; i < explosionCount; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.classList.add('earth-explosion-particle');
                    
                    // 随机位置和方向
                    const angle = (Math.PI * 2 / explosionCount) * i + Math.random() * 0.5;
                    const distance = 150 + Math.random() * 80;
                    const size = 8 + Math.random() * 15;
                    
                    // 随机颜色（蓝绿色系）
                    const colors = ['#00d9ff', '#00ffcc', '#00bfff', '#0080ff'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    // 设置粒子样式
                    particle.style.position = 'absolute';
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.backgroundColor = color;
                    particle.style.borderRadius = '50%';
                    particle.style.boxShadow = `0 0 30px ${color}`;
                    particle.style.left = '50%';
                    particle.style.top = '50%';
                    particle.style.transform = 'translate(-50%, -50%)';
                    
                    earth.appendChild(particle);
                    
                    // 动画
                    setTimeout(() => {
                        particle.style.left = `${50 + Math.cos(angle) * distance}%`;
                        particle.style.top = `${50 + Math.sin(angle) * distance}%`;
                        particle.style.opacity = '0';
                        particle.style.transform = 'translate(-50%, -50%) scale(0.5)';
                        particle.style.transition = 'all 1s ease-out';
                    }, 10);
                    
                    // 移除粒子
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.remove();
                        }
                    }, 1100);
                }, i * 50);
            }
        }
        
        // 创建点击音效（循环四种音色）
        function createWowSound() {
            if (typeof window._clickSoundIndex === 'undefined') window._clickSoundIndex = 0;
            const idx = window._clickSoundIndex % 4;
            window._clickSoundIndex++;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const masterGain = audioContext.createGain();
            masterGain.gain.value = 0.45;
            masterGain.connect(audioContext.destination);

            const now = audioContext.currentTime;

            if (idx === 0) {
                // 1: 原始 wow（上降频 + 2 个正弦和少量混响）
                const oscA = audioContext.createOscillator();
                oscA.type = 'sine';
                oscA.frequency.setValueAtTime(880, now);
                oscA.frequency.exponentialRampToValueAtTime(440, now + 0.32);

                const gA = audioContext.createGain();
                gA.gain.setValueAtTime(0, now);
                gA.gain.linearRampToValueAtTime(0.8, now + 0.04);
                gA.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

                const oscB = audioContext.createOscillator();
                oscB.type = 'sine';
                oscB.frequency.setValueAtTime(660, now);
                oscB.frequency.exponentialRampToValueAtTime(330, now + 0.42);

                const gB = audioContext.createGain();
                gB.gain.setValueAtTime(0, now);
                gB.gain.linearRampToValueAtTime(0.45, now + 0.06);
                gB.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

                const convolver = audioContext.createConvolver();
                // 简单脉冲响应
                const sampleRate = audioContext.sampleRate;
                const len = Math.floor(sampleRate * 0.25);
                const buf = audioContext.createBuffer(2, len, sampleRate);
                for (let c = 0; c < 2; c++) {
                    const data = buf.getChannelData(c);
                    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
                }
                convolver.buffer = buf;

                oscA.connect(gA); gA.connect(masterGain);
                oscB.connect(gB); gB.connect(masterGain);
                oscA.connect(convolver); oscB.connect(convolver);
                convolver.connect(masterGain);

                oscA.start(); oscA.stop(now + 0.7);
                oscB.start(); oscB.stop(now + 0.75);
            } else if (idx === 1) {
                // 2: 短促点击（方波 + 快速包络）
                const osc = audioContext.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(1200, now);

                const g = audioContext.createGain();
                g.gain.setValueAtTime(0, now);
                g.gain.linearRampToValueAtTime(0.9, now + 0.005);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc.connect(g); g.connect(masterGain);
                osc.start(); osc.stop(now + 0.14);
            } else if (idx === 2) {
                // 3: 下行三音（三连音短旋律）
                const freqs = [880, 660, 440];
                freqs.forEach((f, i) => {
                    const o = audioContext.createOscillator();
                    o.type = 'triangle';
                    o.frequency.setValueAtTime(f, now + i * 0.06);
                    const gg = audioContext.createGain();
                    gg.gain.setValueAtTime(0, now + i * 0.06);
                    gg.gain.linearRampToValueAtTime(0.6, now + i * 0.06 + 0.02);
                    gg.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);
                    o.connect(gg); gg.connect(masterGain);
                    o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.36);
                });
            } else {
                // 4: 柔和铃声（小号音色模拟）
                const carrier = audioContext.createOscillator();
                carrier.type = 'sine';
                carrier.frequency.setValueAtTime(1046.5, now); // C6

                const mod = audioContext.createOscillator();
                mod.type = 'sine';
                mod.frequency.setValueAtTime(8, now);

                const modGain = audioContext.createGain();
                modGain.gain.setValueAtTime(30, now);

                mod.connect(modGain);
                modGain.connect(carrier.frequency);

                const gC = audioContext.createGain();
                gC.gain.setValueAtTime(0, now);
                gC.gain.linearRampToValueAtTime(0.7, now + 0.06);
                gC.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

                carrier.connect(gC); gC.connect(masterGain);
                carrier.start(now); carrier.stop(now + 1.0);
                mod.start(now); mod.stop(now + 1.0);
            }
        }
        
        // 随机颜色生成函数
        function getRandomColor() {
            const colors = [
                '#ff0064', // 主色调
                '#4a00ff', // 蓝色
                '#00d9ff', // 青色
                '#ff00ff', // 洋红色
                '#ffff00', // 黄色
                '#ff9900'  // 橙色
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        // 检查是否在游戏容器内
        function isInGameContainer(element) {
            // 检查元素是否在游戏容器内
            if (!element) return false;
            
            // 检查元素本身是否是游戏容器
            if (element.classList && element.classList.contains('game-container')) {
                return true;
            }
            
            // 检查元素的父元素是否在游戏容器内
            const snakeContainer = document.getElementById('snakeGameContainer');
            const tetrisContainer = document.getElementById('tetrisGameContainer');
            const danmakuContainer = document.getElementById('danmakuGameContainer');
            
            // 如果游戏容器当前是显示的（通过检查display样式）
            const snakeDisplay = snakeContainer.style.display;
            const tetrisDisplay = tetrisContainer.style.display;
            const danmakuDisplay = danmakuContainer.style.display;
            
            // 如果贪吃蛇游戏容器是显示的，检查元素是否在其中
            if (snakeDisplay === 'flex' && snakeContainer.contains(element)) {
                return true;
            }
            
            // 如果俄罗斯方块游戏容器是显示的，检查元素是否在其中
            if (tetrisDisplay === 'flex' && tetrisContainer.contains(element)) {
                return true;
            }
            
            // 如果弹幕游戏容器是显示的，检查元素是否在其中
            if (danmakuDisplay === 'flex' && danmakuContainer.contains(element)) {
                return true;
            }
            
            return false;
        }
        
        // 创建华丽的Game Over效果 - 修复重叠问题
        function createGameOverEffect(gameType, score) {
            const containerId = gameType === 'snake' ? 'snakeGameOverEffect' : 
                              gameType === 'tetris' ? 'tetrisGameOverEffect' : 
                              gameType === 'danmaku' ? 'danmakuGameOverEffect' :
                              'twentyFortyEightGameOverEffect';
            const container = document.getElementById(containerId);
            
            // 清空容器
            container.innerHTML = '';
            
            // 创建GAME OVER文本
            const gameOverText = document.createElement('div');
            gameOverText.className = 'game-over-text game-over-main';
            gameOverText.textContent = 'GAME OVER';
            
            // 创建"菜"文本
            const caiText = document.createElement('div');
            caiText.className = 'game-over-text game-over-cai';
            caiText.textContent = '菜';
            
            // 创建得分文本
            const scoreText = document.createElement('div');
            scoreText.className = 'game-over-text game-over-score';
            scoreText.textContent = `得分: ${score}`;
            
            // 创建重新开始提示
            const restartText = document.createElement('div');
            restartText.className = 'game-over-text game-over-restart';
            restartText.textContent = '点击屏幕重新开始';
            
            // 添加文本到容器
            container.appendChild(gameOverText);
            container.appendChild(caiText);
            container.appendChild(scoreText);
            container.appendChild(restartText);
            
            // 创建爆炸粒子效果
            createExplosionParticles(container, 30);
            
            // 显示效果
            container.style.opacity = '1';
            
            // 添加点击重新开始事件
            const canvas = gameType === 'snake' ? document.getElementById('snakeCanvas') : 
                          gameType === 'tetris' ? document.getElementById('tetrisCanvas') : 
                          gameType === 'danmaku' ? document.getElementById('danmakuCanvas') :
                          document.getElementById('twentyFortyEightCanvas');
            const game = gameType === 'snake' ? (window.snakeGame || undefined) : 
                         gameType === 'tetris' ? (window.tetrisGame || undefined) : 
                         (window.danmakuGame || undefined);
            
            const restartHandler = function() {
                const liveGame = gameType === 'snake' ? window.snakeGame :
                                 gameType === 'tetris' ? window.tetrisGame :
                                 gameType === 'danmaku' ? window.danmakuGame :
                                 window.twentyFortyEightGame;

                if (!liveGame) {
                    // 没有活动的游戏实例，直接返回（避免控制台报错）
                    return;
                }

                // 检查游戏是否结束（2048使用isGameOver）
                const isGameOver = gameType === 'twentyFortyEight' ? liveGame.isGameOver : liveGame.gameOver;
                
                if (isGameOver) {
                    // 重新开始游戏（2048使用newGame）
                    if (gameType === 'twentyFortyEight') {
                        liveGame.newGame();
                    } else {
                        liveGame.restart();
                    }
                    container.style.opacity = '0';
                    setTimeout(() => {
                        container.innerHTML = '';
                    }, 500);
                    canvas.removeEventListener('click', restartHandler);
                }
            };
            
            setTimeout(() => {
                canvas.addEventListener('click', restartHandler);
            }, 500);
        }
        
        // 创建爆炸粒子效果
        function createExplosionParticles(container, count) {
            const colors = ['#ff0064', '#4a00ff', '#00d9ff', '#ffcc00', '#ff00ff'];
            
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.classList.add('game-over-particle');
                    
                    // 随机位置（从中心爆炸）
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 200 + 50;
                    
                    // 随机颜色
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    // 随机大小
                    const size = Math.random() * 15 + 5;
                    
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.backgroundColor = color;
                    particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
                    particle.style.left = '50%';
                    particle.style.top = '50%';
                    particle.style.transform = 'translate(-50%, -50%)';
                    particle.style.animation = `explode ${Math.random() * 1 + 1}s forwards`;
                    
                    container.appendChild(particle);
                    
                    setTimeout(() => {
                        particle.style.left = `${50 + Math.cos(angle) * distance}%`;
                        particle.style.top = `${50 + Math.sin(angle) * distance}%`;
                    }, 10);
                    
                    // 移除粒子
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.remove();
                        }
                    }, 1500);
                }, i * 50);
            }
        }
                // 添加点击特效和音效
        document.addEventListener('click', function(e) {
            // 检查点击的是否在游戏容器内
            const snakeContainer = document.getElementById('snakeGameContainer');
            const tetrisContainer = document.getElementById('tetrisGameContainer');
            const danmakuContainer = document.getElementById('danmakuGameContainer');
            const twentyFortyEightContainer = document.getElementById('twentyFortyEightGameContainer');
            
            // 如果任何一个游戏容器是显示的，则不播放音效
            const isSnakeOpen = snakeContainer.style.display === 'flex';
            const isTetrisOpen = tetrisContainer.style.display === 'flex';
            const isDanmakuOpen = danmakuContainer.style.display === 'flex';
            const isTwentyFortyEightOpen = twentyFortyEightContainer.style.display === 'flex';
            
            if (isSnakeOpen || isTetrisOpen || isDanmakuOpen || isTwentyFortyEightOpen) {
                // 在游戏界面内点击，不播放音效
                return;
            }
            
            // 检查点击的是否是控制按钮（包括游戏选择按钮）
            const isControlBtn = e.target.closest('.control-btn') || 
                                 e.target.closest('.game-btn') || 
                                 e.target.closest('.close-game') ||
                                 e.target.closest('.pause-btn');
            
            // 如果是控制按钮，不播放音效
            if (isControlBtn) {
                return;
            }
            
            // 检查点击的是否是地球
            const isEarth = e.target.closest('.earth');
            
            // 如果是地球，地球的交互已经处理过，不播放主音效
            if (isEarth) {
                return;
            }
            
            // 否则，播放音效和特效
            // 创建点击视觉特效
            const ripple = document.createElement('div');
            ripple.classList.add('circle');
            ripple.style.position = 'fixed';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            ripple.style.zIndex = '1000';
            ripple.style.animation = 'pulse 0.8s forwards';
            ripple.style.backgroundColor = getRandomColor();
            
            document.body.appendChild(ripple);
            
            // 播放"wow"音效
            createWowSound();
            
            // 添加标题放大特效
            const title = document.querySelector('.main-title');
            if (title) {
                title.style.transform = 'scale(1.05)';
                title.style.transition = 'transform 0.3s ease';
                
                setTimeout(() => {
                    title.style.transform = 'scale(1)';
                }, 300);
            }
            
            // 创建额外的粒子效果
            createClickParticles(e.clientX, e.clientY);
            
            // 移除特效元素
            setTimeout(() => {
                ripple.remove();
            }, 1000);
            
            // 移除音效提示（只在第一次点击后）
            const soundHint = document.getElementById('soundHint');
            if (soundHint) {
                soundHint.style.opacity = '0';
                soundHint.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    soundHint.style.display = 'none';
                }, 500);
            }
        });
        
        // 创建点击粒子效果
        function createClickParticles(x, y) {
            const particleCount = 10;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('floating-particle');
                
                // 随机方向
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 50 + 20;
                
                // 随机颜色
                const color = getRandomColor();
                
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.backgroundColor = color;
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.boxShadow = `0 0 10px ${color}`;
                
                // 动画
                particle.style.animation = `none`;
                particle.style.transition = `all 0.8s ease-out`;
                
                document.body.appendChild(particle);
                
                // 触发动画
                setTimeout(() => {
                    particle.style.left = `${x + Math.cos(angle) * distance}px`;
                    particle.style.top = `${y + Math.sin(angle) * distance}px`;
                    particle.style.opacity = '0';
                }, 10);
                
                // 移除粒子
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, 1000);
            }
        }
        
        // 游戏管理
        let currentGame = null;
        let gameInterval = null;
        let tetrisAnimationFrame = null;
        let danmakuAnimationFrame = null;
        let lastTetrisUpdate = 0;
        
        // 添加全局按键状态跟踪 - 修复按键冲突
        const activeKeyListeners = new Set();
        
        // 辅助函数：激活指定游戏的按键监听器
        function enableGameKeyListeners(gameType) {
            // 清除所有活动监听器
            activeKeyListeners.clear();
            
            // 根据游戏类型添加对应的监听器
            if (gameType === 'snake') {
                activeKeyListeners.add('snake');
            } else if (gameType === 'tetris') {
                activeKeyListeners.add('tetris');
            } else if (gameType === 'danmaku') {
                activeKeyListeners.add('danmaku');
            }
        }
        
        // 贪吃蛇游戏
        class SnakeGame {
            constructor() {
                this.canvas = document.getElementById('snakeCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.scoreElement = document.getElementById('snakeScore');
                this.score = 0;
                this.gameOver = false;
                this.paused = false;
                
                // 游戏参数
                this.gridSize = 20;
                this.snake = [{x: 10, y: 10}];
                this.food = this.generateFood();
                this.direction = 'right';
                this.nextDirection = 'right';
                this.lastUpdate = 0;
                this.updateInterval = 150; // 毫秒
                
                // 绑定控制按钮事件
                this.bindControls();
                
                // 绘制初始游戏状态
                this.draw();
            }
            
            generateFood() {
                let food;
                let foodOnSnake;
                
                do {
                    foodOnSnake = false;
                    food = {
                        x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                        y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
                    };
                    
                    // 检查食物是否在蛇身上
                    for (let segment of this.snake) {
                        if (segment.x === food.x && segment.y === food.y) {
                            foodOnSnake = true;
                            break;
                        }
                    }
                } while (foodOnSnake);
                
                return food;
            }
            
            draw() {
                // 清空画布
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 绘制网格
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 0.5;
                
                for (let x = 0; x < this.canvas.width; x += this.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                
                for (let y = 0; y < this.canvas.height; y += this.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }
                
                // 绘制蛇
                this.snake.forEach((segment, index) => {
                    if (index === 0) {
                        // 蛇头
                        this.ctx.fillStyle = '#ff0064';
                        this.ctx.fillRect(
                            segment.x * this.gridSize, 
                            segment.y * this.gridSize, 
                            this.gridSize, 
                            this.gridSize
                        );
                        
                        // 蛇头眼睛
                        this.ctx.fillStyle = 'white';
                        const eyeSize = this.gridSize / 5;
                        
                        // 根据方向确定眼睛位置
                        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                        
                        if (this.direction === 'right') {
                            leftEyeX = segment.x * this.gridSize + this.gridSize - eyeSize * 2;
                            leftEyeY = segment.y * this.gridSize + eyeSize * 2;
                            rightEyeX = segment.x * this.gridSize + this.gridSize - eyeSize * 2;
                            rightEyeY = segment.y * this.gridSize + this.gridSize - eyeSize * 3;
                        } else if (this.direction === 'left') {
                            leftEyeX = segment.x * this.gridSize + eyeSize;
                            leftEyeY = segment.y * this.gridSize + eyeSize * 2;
                            rightEyeX = segment.x * this.gridSize + eyeSize;
                            rightEyeY = segment.y * this.gridSize + this.gridSize - eyeSize * 3;
                        } else if (this.direction === 'up') {
                            leftEyeX = segment.x * this.gridSize + eyeSize * 2;
                            leftEyeY = segment.y * this.gridSize + eyeSize;
                            rightEyeX = segment.x * this.gridSize + this.gridSize - eyeSize * 3;
                            rightEyeY = segment.y * this.gridSize + eyeSize;
                        } else { // down
                            leftEyeX = segment.x * this.gridSize + eyeSize * 2;
                            leftEyeY = segment.y * this.gridSize + this.gridSize - eyeSize * 2;
                            rightEyeX = segment.x * this.gridSize + this.gridSize - eyeSize * 3;
                            rightEyeY = segment.y * this.gridSize + this.gridSize - eyeSize * 2;
                        }
                        
                        this.ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
                        this.ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
                    } else {
                        // 蛇身
                        this.ctx.fillStyle = '#00d9ff';
                        this.ctx.fillRect(
                            segment.x * this.gridSize, 
                            segment.y * this.gridSize, 
                            this.gridSize, 
                            this.gridSize
                        );
                        
                        // 蛇身内部装饰
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        this.ctx.fillRect(
                            segment.x * this.gridSize + this.gridSize/4, 
                            segment.y * this.gridSize + this.gridSize/4, 
                            this.gridSize/2, 
                            this.gridSize/2
                        );
                    }
                });
                
                // 绘制食物
                this.ctx.fillStyle = '#ffcc00';
                this.ctx.beginPath();
                this.ctx.arc(
                    this.food.x * this.gridSize + this.gridSize/2,
                    this.food.y * this.gridSize + this.gridSize/2,
                    this.gridSize/2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                
                // 绘制食物内部
                this.ctx.fillStyle = '#ff9900';
                this.ctx.beginPath();
                this.ctx.arc(
                    this.food.x * this.gridSize + this.gridSize/2,
                    this.food.y * this.gridSize + this.gridSize/2,
                    this.gridSize/4,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
            
            update() {
                if (this.gameOver || this.paused) return;
                
                // 更新方向
                this.direction = this.nextDirection;
                
                // 移动蛇
                const head = {...this.snake[0]};
                
                switch(this.direction) {
                    case 'up': head.y--; break;
                    case 'down': head.y++; break;
                    case 'left': head.x--; break;
                    case 'right': head.x++; break;
                }
                
                // 检查是否撞墙
                if (
                    head.x < 0 || 
                    head.y < 0 || 
                    head.x >= this.canvas.width / this.gridSize || 
                    head.y >= this.canvas.height / this.gridSize
                ) {
                    this.gameOver = true;
                    // 设置当前游戏得分，用于排行榜
                    if (window.leaderboardSystem) {
                        window.leaderboardSystem.setCurrentScore('snake', this.score);
                    }
                    createGameOverEffect('snake', this.score);
                    return;
                }
                
                // 检查是否撞到自己
                for (let segment of this.snake) {
                    if (head.x === segment.x && head.y === segment.y) {
                        this.gameOver = true;
                        createGameOverEffect('snake', this.score);
                        return;
                    }
                }
                
                // 添加新头部
                this.snake.unshift(head);
                
                // 检查是否吃到食物
                if (head.x === this.food.x && head.y === this.food.y) {
                    this.score += 10;
                    this.scoreElement.textContent = `得分: ${this.score}`;
                    this.food = this.generateFood();
                } else {
                    // 如果没有吃到食物，移除尾部
                    this.snake.pop();
                }
                
                this.draw();
            }
            
            bindControls() {
                // 绑定键盘控制 - 添加WASD支持
                document.addEventListener('keydown', (e) => {
                    // 检查是否贪吃蛇游戏是当前激活的游戏
                    if (!activeKeyListeners.has('snake')) return;
                    
                    const key = e.key.toLowerCase();
                    switch(key) {
                        case 'arrowup':
                        case 'w':
                            if (this.direction !== 'down') this.nextDirection = 'up';
                            e.preventDefault();
                            break;
                        case 'arrowdown':
                        case 's':
                            if (this.direction !== 'up') this.nextDirection = 'down';
                            e.preventDefault();
                            break;
                        case 'arrowleft':
                        case 'a':
                            if (this.direction !== 'right') this.nextDirection = 'left';
                            e.preventDefault();
                            break;
                        case 'arrowright':
                        case 'd':
                            if (this.direction !== 'left') this.nextDirection = 'right';
                            e.preventDefault();
                            break;
                        case ' ':
                            this.togglePause();
                            e.preventDefault();
                            break;
                        case 'r':
                            if (this.gameOver) this.restart();
                            e.preventDefault();
                            break;
                    }
                });
                
                // 绑定屏幕控制按钮
                document.getElementById('snakeUp').addEventListener('click', () => {
                    if (this.direction !== 'down') this.nextDirection = 'up';
                });
                
                document.getElementById('snakeDown').addEventListener('click', () => {
                    if (this.direction !== 'up') this.nextDirection = 'down';
                });
                
                document.getElementById('snakeLeft').addEventListener('click', () => {
                    if (this.direction !== 'right') this.nextDirection = 'left';
                });
                
                document.getElementById('snakeRight').addEventListener('click', () => {
                    if (this.direction !== 'left') this.nextDirection = 'right';
                });
                
                document.getElementById('snakePause').addEventListener('click', () => {
                    this.togglePause();
                });
                
                // 点击画布重新开始游戏（如果游戏结束）
                this.canvas.addEventListener('click', () => {
                    if (this.gameOver) {
                        this.restart();
                        document.getElementById('snakeGameOverEffect').style.opacity = '0';
                        setTimeout(() => {
                            document.getElementById('snakeGameOverEffect').innerHTML = '';
                        }, 500);
                    }
                });
            }
            
            togglePause() {
                this.paused = !this.paused;
                this.draw();
                
                // 绘制暂停文字
                if (this.paused) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.ctx.fillStyle = '#4a00ff';
                    this.ctx.font = 'bold 40px "Microsoft YaHei"';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2);
                    
                    // 添加继续提示
                    this.ctx.fillStyle = '#00d9ff';
                    this.ctx.font = 'bold 20px "Microsoft YaHei"';
                    this.ctx.fillText('按空格键或点击暂停按钮继续', this.canvas.width/2, this.canvas.height/2 + 50);
                }
            }
            
            restart() {
                this.snake = [{x: 10, y: 10}];
                this.food = this.generateFood();
                this.direction = 'right';
                this.nextDirection = 'right';
                this.score = 0;
                this.scoreElement.textContent = `得分: ${this.score}`;
                this.gameOver = false;
                this.paused = false;
                this.draw();
            }
            
            start() {
                if (gameInterval) clearInterval(gameInterval);
                this.lastUpdate = Date.now();
                gameInterval = setInterval(() => this.update(), this.updateInterval);
            }
            
            stop() {
                if (gameInterval) {
                    clearInterval(gameInterval);
                    gameInterval = null;
                }
            }
        }
                // 俄罗斯方块游戏 - 优化版
        class TetrisGame {
            constructor() {
                this.canvas = document.getElementById('tetrisCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.scoreElement = document.getElementById('tetrisScore');
                this.score = 0;
                this.gameOver = false;
                this.paused = false;
                
                // 游戏参数
                this.gridSize = 30;
                this.cols = 10;
                this.rows = 20;
                this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
                
                // 方块形状
                this.shapes = [
                    [[1,1,1,1]], // I
                    [[1,1],[1,1]], // O
                    [[0,1,0],[1,1,1]], // T
                    [[1,0,0],[1,1,1]], // J
                    [[0,0,1],[1,1,1]], // L
                    [[0,1,1],[1,1,0]], // S
                    [[1,1,0],[0,1,1]]  // Z
                ];
                
                this.colors = [
                    '#00d9ff', // I - 青色
                    '#ffcc00', // O - 黄色
                    '#ff00ff', // T - 紫色
                    '#4a00ff', // J - 蓝色
                    '#ff9900', // L - 橙色
                    '#00ff00', // S - 绿色
                    '#ff0064'  // Z - 红色
                ];
                
                // 当前方块
                this.currentPiece = this.newPiece();
                
                // 游戏计时
                this.lastUpdate = 0;
                this.updateInterval = 500; // 初始下落间隔(毫秒)
                this.dropSpeed = 500; // 当前下落速度
                this.level = 1;
                
                // 性能优化
                this.needsRedraw = true;
                this.lastDraw = 0;
                this.drawInterval = 1000 / 60; // 60 FPS
                
                // 绑定控制按钮事件
                this.bindControls();
                
                // 绘制初始游戏状态
                this.draw();
            }
            
            newPiece() {
                const shapeIndex = Math.floor(Math.random() * this.shapes.length);
                return {
                    shape: this.shapes[shapeIndex],
                    color: this.colors[shapeIndex],
                    x: Math.floor(this.cols / 2) - Math.floor(this.shapes[shapeIndex][0].length / 2),
                    y: 0
                };
            }
            
            draw() {
                const now = Date.now();
                if (now - this.lastDraw < this.drawInterval && !this.needsRedraw) {
                    return;
                }
                
                this.lastDraw = now;
                this.needsRedraw = false;
                
                // 清空画布
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 绘制网格 - 只在游戏区域绘制
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 0.5;
                
                // 绘制列线
                for (let x = 0; x <= this.canvas.width; x += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                
                // 绘制行线
                for (let y = 0; y <= this.canvas.height; y += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }
                
                // 绘制已落下的方块
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.cols; col++) {
                        if (this.board[row][col]) {
                            this.ctx.fillStyle = this.board[row][col];
                            this.ctx.fillRect(
                                col * this.gridSize, 
                                row * this.gridSize, 
                                this.gridSize, 
                                this.gridSize
                            );
                            
                            // 方块边框
                            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                            this.ctx.lineWidth = 1;
                            this.ctx.strokeRect(
                                col * this.gridSize, 
                                row * this.gridSize, 
                                this.gridSize, 
                                this.gridSize
                            );
                            
                            // 方块内部高光
                            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                            this.ctx.fillRect(
                                col * this.gridSize + 2, 
                                row * this.gridSize + 2, 
                                this.gridSize - 4, 
                                this.gridSize - 4
                            );
                        }
                    }
                }
                
                // 绘制当前方块
                for (let row = 0; row < this.currentPiece.shape.length; row++) {
                    for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                        if (this.currentPiece.shape[row][col]) {
                            this.ctx.fillStyle = this.currentPiece.color;
                            this.ctx.fillRect(
                                (this.currentPiece.x + col) * this.gridSize, 
                                (this.currentPiece.y + row) * this.gridSize, 
                                this.gridSize, 
                                this.gridSize
                            );
                            
                            // 方块边框
                            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                            this.ctx.lineWidth = 1;
                            this.ctx.strokeRect(
                                (this.currentPiece.x + col) * this.gridSize, 
                                (this.currentPiece.y + row) * this.gridSize, 
                                this.gridSize, 
                                this.gridSize
                            );
                            
                            // 方块内部高光
                            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                            this.ctx.fillRect(
                                (this.currentPiece.x + col) * this.gridSize + 2, 
                                (this.currentPiece.y + row) * this.gridSize + 2, 
                                this.gridSize - 4, 
                                this.gridSize - 4
                            );
                        }
                    }
                }
            }
            
            // 检查碰撞
            collisionCheck(piece, xOffset = 0, yOffset = 0) {
                for (let row = 0; row < piece.shape.length; row++) {
                    for (let col = 0; col < piece.shape[row].length; col++) {
                        if (piece.shape[row][col]) {
                            const newX = piece.x + col + xOffset;
                            const newY = piece.y + row + yOffset;
                            
                            // 检查边界
                            if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                                return true;
                            }
                            
                            // 检查与已落下方块的碰撞
                            if (newY >= 0 && this.board[newY][newX]) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            
            // 旋转方块 - 顺时针
            rotatePiece(clockwise = true) {
                const originalShape = this.currentPiece.shape;
                const rows = originalShape.length;
                const cols = originalShape[0].length;
                
                // 创建旋转后的形状
                const rotatedShape = [];
                if (clockwise) {
                    // 顺时针旋转
                    for (let col = 0; col < cols; col++) {
                        rotatedShape[col] = [];
                        for (let row = 0; row < rows; row++) {
                            rotatedShape[col][row] = originalShape[rows - 1 - row][col];
                        }
                    }
                } else {
                    // 逆时针旋转
                    for (let col = 0; col < cols; col++) {
                        rotatedShape[col] = [];
                        for (let row = 0; row < rows; row++) {
                            rotatedShape[col][row] = originalShape[row][cols - 1 - col];
                        }
                    }
                }
                
                // 临时使用旋转后的形状检查碰撞
                const tempPiece = {
                    shape: rotatedShape,
                    color: this.currentPiece.color,
                    x: this.currentPiece.x,
                    y: this.currentPiece.y
                };
                
                // 如果没有碰撞，应用旋转
                if (!this.collisionCheck(tempPiece)) {
                    this.currentPiece.shape = rotatedShape;
                    this.needsRedraw = true;
                    this.draw();
                }
            }
            
            // 移动方块
            movePiece(xOffset, yOffset) {
                if (!this.collisionCheck(this.currentPiece, xOffset, yOffset)) {
                    this.currentPiece.x += xOffset;
                    this.currentPiece.y += yOffset;
                    this.needsRedraw = true;
                    this.draw();
                    return true;
                }
                return false;
            }
            
            // 硬降落（直接落到底部）
            hardDrop() {
                let dropCount = 0;
                while(this.movePiece(0, 1)) {
                    dropCount++;
                }
                // 硬降落奖励分数
                this.score += dropCount * 2;
                this.updateScoreDisplay();
                this.lockPiece();
            }
            
            // 固定方块到游戏板
            lockPiece() {
                for (let row = 0; row < this.currentPiece.shape.length; row++) {
                    for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                        if (this.currentPiece.shape[row][col]) {
                            const boardY = this.currentPiece.y + row;
                            const boardX = this.currentPiece.x + col;
                            
                            // 如果方块超出顶部，游戏结束
                            if (boardY < 0) {
                                this.gameOver = true;
                            this.needsRedraw = true;
                            this.draw();
                            // 设置当前游戏得分，用于排行榜
                            if (window.leaderboardSystem) {
                                window.leaderboardSystem.setCurrentScore('tetris', this.score, this.level);
                            }
                            createGameOverEffect('tetris', this.score);
                            return;
                            }
                            
                            this.board[boardY][boardX] = this.currentPiece.color;
                        }
                    }
                }
                
                // 检查并清除完整的行
                this.clearLines();
                
                // 生成新方块
                this.currentPiece = this.newPiece();
                
                // 检查新方块是否可以放置
                if (this.collisionCheck(this.currentPiece)) {
                    this.gameOver = true;
                    this.needsRedraw = true;
                    this.draw();
                    // 设置当前游戏得分，用于排行榜
                    if (window.leaderboardSystem) {
                        window.leaderboardSystem.setCurrentScore('tetris', this.score, this.level);
                    }
                    createGameOverEffect('tetris', this.score);
                }
                
                this.needsRedraw = true;
            }
            
            // 清除完整的行
            clearLines() {
                let linesCleared = 0;
                
                for (let row = this.rows - 1; row >= 0; row--) {
                    if (this.board[row].every(cell => cell !== 0)) {
                        // 移除该行
                        this.board.splice(row, 1);
                        // 在顶部添加新行
                        this.board.unshift(Array(this.cols).fill(0));
                        row++; // 重新检查同一行（因为所有行都下移了）
                        linesCleared++;
                    }
                }
                
                // 更新分数和速度
                if (linesCleared > 0) {
                    // 计算得分
                    const points = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行
                    this.score += points[linesCleared] * this.level;
                    
                    // 更新等级和速度
                    this.level = Math.floor(this.score / 1000) + 1;
                    this.dropSpeed = Math.max(100, 500 - (this.level - 1) * 50);
                    
                    this.updateScoreDisplay();
                    this.needsRedraw = true;
                }
            }
            
            // 更新分数显示
            updateScoreDisplay() {
                this.scoreElement.textContent = `得分: ${this.score} | 等级: ${this.level}`;
            }
            
            update(timestamp) {
                if (this.gameOver || this.paused) {
                    if (this.needsRedraw) {
                        this.draw();
                    }
                    if (!this.gameOver) {
                        tetrisAnimationFrame = requestAnimationFrame((ts) => this.update(ts));
                    }
                    return;
                }
                
                // 计算时间差
                if (!this.lastUpdate) this.lastUpdate = timestamp;
                const deltaTime = timestamp - this.lastUpdate;
                
                // 自动下落
                if (deltaTime > this.dropSpeed) {
                    // 移动方块向下
                    if (!this.movePiece(0, 1)) {
                        // 如果不能向下移动，则固定方块
                        this.lockPiece();
                    }
                    this.lastUpdate = timestamp;
                }
                
                // 如果需要重绘，则绘制
                if (this.needsRedraw) {
                    this.draw();
                }
                
                // 继续游戏循环
                tetrisAnimationFrame = requestAnimationFrame((ts) => this.update(ts));
            }
            
            bindControls() {
                // 绑定键盘控制 - 添加WASD和Q/E支持
                document.addEventListener('keydown', (e) => {
                    // 检查是否俄罗斯方块游戏是当前激活的游戏 - 修复按键冲突
                    if (!activeKeyListeners.has('tetris')) return;
                    
                    const key = e.key.toLowerCase();
                    switch(key) {
                        case 'arrowup':
                        case 'w':
                            this.rotatePiece(true);
                            e.preventDefault();
                            break;
                        case 'arrowdown':
                        case 's':
                            if (this.movePiece(0, 1)) {
                                // 快速下落奖励分数
                                this.score += 1;
                                this.updateScoreDisplay();
                            }
                            e.preventDefault();
                            break;
                        case 'arrowleft':
                        case 'a':
                            this.movePiece(-1, 0);
                            e.preventDefault();
                            break;
                        case 'arrowright':
                        case 'd':
                            this.movePiece(1, 0);
                            e.preventDefault();
                            break;
                        case 'q':
                        case 'z':
                            this.rotatePiece(false);
                            e.preventDefault();
                            break;
                        case 'e':
                        case 'x':
                            this.rotatePiece(true);
                            e.preventDefault();
                            break;
                        case ' ':
                            // 硬降落（直接落到底部）
                            this.hardDrop();
                            e.preventDefault();
                            break;
                        case 'p':
                            this.togglePause();
                            e.preventDefault();
                            break;
                        case 'r':
                            if (this.gameOver) this.restart();
                            e.preventDefault();
                            break;
                    }
                });
                
                // 绑定屏幕控制按钮
                document.getElementById('tetrisRotate').addEventListener('click', () => {
                    this.rotatePiece(true);
                });
                
                document.getElementById('tetrisRotateLeft').addEventListener('click', () => {
                    this.rotatePiece(false);
                });
                
                document.getElementById('tetrisRotateRight').addEventListener('click', () => {
                    this.rotatePiece(true);
                });
                
                document.getElementById('tetrisDown').addEventListener('click', () => {
                    if (this.movePiece(0, 1)) {
                        this.score += 1;
                        this.updateScoreDisplay();
                    }
                });
                
                document.getElementById('tetrisLeft').addEventListener('click', () => {
                    this.movePiece(-1, 0);
                });
                
                document.getElementById('tetrisRight').addEventListener('click', () => {
                    this.movePiece(1, 0);
                });
                
                document.getElementById('tetrisHardDrop').addEventListener('click', () => {
                    this.hardDrop();
                });
                
                document.getElementById('tetrisPause').addEventListener('click', () => {
                    this.togglePause();
                });
                
                // 点击画布重新开始游戏（如果游戏结束）
                this.canvas.addEventListener('click', () => {
                    if (this.gameOver) {
                        this.restart();
                        document.getElementById('tetrisGameOverEffect').style.opacity = '0';
                        setTimeout(() => {
                            document.getElementById('tetrisGameOverEffect').innerHTML = '';
                        }, 500);
                    }
                });
            }
            
            togglePause() {
                this.paused = !this.paused;
                this.needsRedraw = true;
                this.draw();
                
                // 绘制暂停文字
                if (this.paused) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.ctx.fillStyle = '#4a00ff';
                    this.ctx.font = 'bold 40px "Microsoft YaHei"';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2);
                    
                    // 添加继续提示
                    this.ctx.fillStyle = '#00d9ff';
                    this.ctx.font = 'bold 20px "Microsoft YaHei"';
                    this.ctx.fillText('按P键或点击暂停按钮继续', this.canvas.width/2, this.canvas.height/2 + 50);
                }
            }
            
            restart() {
                this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
                this.currentPiece = this.newPiece();
                this.score = 0;
                this.level = 1;
                this.dropSpeed = 500;
                this.updateScoreDisplay();
                this.gameOver = false;
                this.paused = false;
                this.needsRedraw = true;
                this.draw();
            }
            
            start() {
                if (tetrisAnimationFrame) {
                    cancelAnimationFrame(tetrisAnimationFrame);
                }
                this.lastUpdate = 0;
                tetrisAnimationFrame = requestAnimationFrame((ts) => this.update(ts));
            }
            
            stop() {
                if (tetrisAnimationFrame) {
                    cancelAnimationFrame(tetrisAnimationFrame);
                    tetrisAnimationFrame = null;
                }
            }
        }
                // 弹幕射击游戏
        class DanmakuGame {
            constructor() {
                this.canvas = document.getElementById('danmakuCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.scoreElement = document.getElementById('danmakuScore');
                this.livesElement = document.getElementById('danmakuLives');
                this.powerElement = document.getElementById('danmakuPower');
                this.bombsElement = document.getElementById('danmakuBombs');
                this.stageElement = document.getElementById('danmakuStage');
                this.bossHealthBar = document.getElementById('bossHealthBar');
                this.bossHealthFill = document.getElementById('bossHealthFill');
                this.bossHealthText = document.getElementById('bossHealthText');
                
                // 游戏状态
                this.score = 0;
                this.lives = 3;
                this.power = 1;
                this.bombs = 3;
                this.stage = 1;
                this.gameOver = false;
                this.paused = false;
                this.bossActive = false;
                this.bossHealth = 0;
                this.bossMaxHealth = 0;
                this.gameMode = 'endless'; // 游戏模式：endless（无尽模式）或 classic（经典模式）
                this.missionComplete = false;
                this.allLevelsComplete = false;
                this.missionCompleteTimer = 0;
                
                // 玩家属性
                this.player = {
                    x: this.canvas.width / 2,
                    y: this.canvas.height - 100,
                    width: 40,
                    height: 60,
                    speed: 5,
                    slowSpeed: 2.5,
                    isSlow: false,
                    invincible: false,
                    invincibleTimer: 0,
                    shootTimer: 0,
                    shootDelay: 10, // 射击间隔（帧数）
                    bombTimer: 0
                };
                
                // 游戏对象数组
                this.bullets = []; // 玩家子弹
                this.enemies = []; // 敌人
                this.enemyBullets = []; // 敌人子弹
                this.powerUps = []; // 道具
                this.effects = []; // 特效

                // 对象池与性能参数（用于优化，减少 GC 与频繁分配）
                this.pools = {
                    bullets: [],
                    enemyBullets: [],
                    enemies: [],
                    powerUps: [],
                    effects: []
                };
                this.maxEnemies = 30; // 最大同时存在的敌人数量
                this.maxBullets = 200; // 玩家子弹上限
                this.maxEnemyBullets = 200; // 敌人子弹上限
                this.gridCellSize = 120; // 空间分区单元格尺寸
                this.spatialGrid = {}; // 每帧构建的网格缓存
                this.usePooling = true;

                // 游戏计时
                this.frameCount = 0;
                this.enemySpawnTimer = 0;
                this.enemySpawnDelay = 60; // 敌人生成间隔（帧数）
                this.bossSpawnTimer = 0;
                this.bossSpawnDelay = 600; // BOSS生成间隔（帧数）
                
                // 控制状态
                this.keys = {
                    up: false,
                    down: false,
                    left: false,
                    right: false,
                    shoot: false,
                    bomb: false,
                    slow: false
                };
                
                // 性能优化
                this.needsRedraw = true;
                this.lastDraw = 0;
                this.drawInterval = 1000 / 60; // 60 FPS
                
                // 音乐相关
                this.audioContext = null;
                this.musicOscillators = [];
                this.musicGain = null;
                this.musicPlaying = false;
                
                // 绑定控制按钮事件
                this.bindControls();
                
                // 绘制初始游戏状态
                this.draw();
                
                // 更新显示
                this.updateDisplay();
            }
            
            draw() {
                const now = Date.now();
                if (now - this.lastDraw < this.drawInterval && !this.needsRedraw) {
                    return;
                }
                
                this.lastDraw = now;
                this.needsRedraw = false;
                
                // 清空画布
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 绘制背景网格
                this.drawBackground();
                
                // 绘制特效
                this.drawEffects();
                
                // 绘制道具
                this.drawPowerUps();
                
                // 绘制敌人子弹
                this.drawEnemyBullets();
                
                // 绘制敌人
                this.drawEnemies();
                
                // 绘制玩家子弹
                this.drawBullets();
                
                // 绘制玩家
                this.drawPlayer();
                
                // 绘制BOSS血条
                if (this.bossActive) {
                    this.drawBossHealth();
                }
            }
            
            drawBackground() {
                // 绘制星空背景
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                for (let i = 0; i < 50; i++) {
                    const x = (this.frameCount + i * 50) % this.canvas.width;
                    const y = (i * 20 + this.frameCount / 2) % this.canvas.height;
                    const size = Math.sin(this.frameCount / 20 + i) * 1 + 1.5;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // 绘制网格线
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 0.5;
                
                // 绘制列线
                for (let x = 0; x <= this.canvas.width; x += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                
                // 绘制行线
                for (let y = 0; y <= this.canvas.height; y += 50) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }
            }
            
            // 构建简单网格（空间分区），将对象放入相应单元以加速碰撞检测
            buildSpatialGrid() {
                this.spatialGrid = {};
                const cs = this.gridCellSize;

                const put = (obj, kind) => {
                    const gx = Math.floor((obj.x || 0) / cs);
                    const gy = Math.floor((obj.y || 0) / cs);
                    const key = `${gx},${gy}`;
                    if (!this.spatialGrid[key]) this.spatialGrid[key] = { enemies: [], bullets: [], enemyBullets: [], powerUps: [] };
                    this.spatialGrid[key][kind].push(obj);
                };

                for (let e of this.enemies) put(e, 'enemies');
                for (let b of this.bullets) put(b, 'bullets');
                for (let eb of this.enemyBullets) put(eb, 'enemyBullets');
                for (let p of this.powerUps) put(p, 'powerUps');
            }

            drawPlayer() {
                const player = this.player;
                
                // 如果无敌状态，闪烁效果
                if (player.invincible && Math.floor(this.frameCount / 5) % 2 === 0) {
                    return;
                }
                
                // 绘制玩家飞机主体
                this.ctx.fillStyle = '#00d9ff';
                this.ctx.beginPath();
                this.ctx.moveTo(player.x, player.y - player.height / 2); // 顶部
                this.ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2); // 左下
                this.ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2); // 右下
                this.ctx.closePath();
                this.ctx.fill();
                
                // 绘制飞机装饰
                this.ctx.fillStyle = '#ff0064';
                this.ctx.fillRect(player.x - 10, player.y - 10, 20, 10);
                
                // 绘制飞机翼
                this.ctx.fillStyle = '#4a00ff';
                this.ctx.fillRect(player.x - 25, player.y, 10, 5);
                this.ctx.fillRect(player.x + 15, player.y, 10, 5);
                
                // 绘制低速移动时的焦点圈
                if (player.isSlow) {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(player.x, player.y, 30, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // 绘制射击特效
                if (this.keys.shoot && this.frameCount % 2 === 0) {
                    this.ctx.fillStyle = '#ffcc00';
                    this.ctx.fillRect(player.x - 2, player.y - 30, 4, 15);
                }
                
                // 绘制碰撞检测区域（调试用，正式发布时可注释掉）
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(this.player.x, this.player.y, 10, 0, Math.PI * 2); // 10像素半径
                this.ctx.stroke();
            }
            
            drawBullets() {
                for (const bullet of this.bullets) {
                    this.ctx.fillStyle = bullet.color;
                    this.ctx.beginPath();
                    this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // 子弹发光效果
                    this.ctx.shadowColor = bullet.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.arc(bullet.x, bullet.y, bullet.radius / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
            
            drawEnemies() {
                for (const enemy of this.enemies) {
                    // 绘制敌机主体
                    this.ctx.fillStyle = enemy.color;
                    
                    if (enemy.type === 'small') {
                        // 小型敌机
                        this.ctx.beginPath();
                        this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else if (enemy.type === 'medium') {
                        // 中型敌机
                        this.ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
                    } else if (enemy.type === 'boss') {
                        // BOSS
                        this.ctx.fillStyle = '#ff0000';
                        this.ctx.beginPath();
                        this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // BOSS装饰
                        this.ctx.fillStyle = '#ff9900';
                        for (let i = 0; i < 8; i++) {
                            const angle = (Math.PI * 2 / 8) * i + this.frameCount / 20;
                            const px = enemy.x + Math.cos(angle) * enemy.radius * 0.7;
                            const py = enemy.y + Math.sin(angle) * enemy.radius * 0.7;
                            this.ctx.beginPath();
                            this.ctx.arc(px, py, enemy.radius / 4, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                    }
                    
                    // 绘制敌机生命值（仅限BOSS和中型敌机）
                    if (enemy.type === 'boss' || enemy.type === 'medium') {
                        const healthWidth = 40;
                        const healthHeight = 5;
                        const healthX = enemy.x - healthWidth / 2;
                        const healthY = enemy.y - enemy.radius - 10;
                        
                        // 背景
                        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        this.ctx.fillRect(healthX, healthY, healthWidth, healthHeight);
                        
                        // 生命值
                        this.ctx.fillStyle = enemy.type === 'boss' ? '#ff0000' : '#ff9900';
                        const currentHealthWidth = (enemy.health / enemy.maxHealth) * healthWidth;
                        this.ctx.fillRect(healthX, healthY, currentHealthWidth, healthHeight);
                    }
                }
            }
            
            drawEnemyBullets() {
                for (const bullet of this.enemyBullets) {
                    this.ctx.fillStyle = bullet.color;
                    
                    // 不同子弹类型不同绘制方式
                    if (bullet.type === 'normal') {
                        this.ctx.beginPath();
                        this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else if (bullet.type === 'laser') {
                        this.ctx.fillRect(bullet.x - 2, bullet.y - 10, 4, 20);
                    } else if (bullet.type === 'ring') {
                        this.ctx.beginPath();
                        this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
                        this.ctx.strokeStyle = bullet.color;
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();
                    }
                    
                    // 子弹发光效果
                    this.ctx.shadowColor = bullet.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.arc(bullet.x, bullet.y, bullet.radius / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
            
            drawPowerUps() {
                for (const powerUp of this.powerUps) {
                    // 绘制道具
                    this.ctx.fillStyle = powerUp.color;
                    
                    if (powerUp.type === 'power') {
                        // 火力升级道具
                        this.ctx.beginPath();
                        this.ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // 内部装饰
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.beginPath();
                        this.ctx.arc(powerUp.x, powerUp.y, powerUp.radius / 2, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else if (powerUp.type === 'life') {
                        // 生命值道具
                        this.ctx.fillStyle = '#ff0064';
                        this.ctx.beginPath();
                        this.ctx.moveTo(powerUp.x, powerUp.y - powerUp.radius); // 顶部
                        this.ctx.lineTo(powerUp.x - powerUp.radius, powerUp.y + powerUp.radius); // 左下
                        this.ctx.lineTo(powerUp.x + powerUp.radius, powerUp.y + powerUp.radius); // 右下
                        this.ctx.closePath();
                        this.ctx.fill();
                    } else if (powerUp.type === 'bomb') {
                        // 炸弹道具
                        this.ctx.fillStyle = '#ff9900';
                        this.ctx.beginPath();
                        this.ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
                        this.ctx.fill();
                        
                        // 炸弹内部
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.fillRect(powerUp.x - 3, powerUp.y - 3, 6, 6);
                    }
                    
                    // 浮动动画
                    powerUp.y += Math.sin(this.frameCount / 10 + powerUp.id) * 0.5;
                }
            }
            
            drawEffects() {
                for (const effect of this.effects) {
                    if (effect.type === 'explosion') {
                        // 爆炸特效
                        const progress = (this.frameCount - effect.startFrame) / effect.duration;
                        if (progress > 1) continue;
                        
                        const radius = effect.radius * progress;
                        const alpha = 1 - progress;
                        
                        this.ctx.fillStyle = `rgba(255, ${100 + 155 * progress}, 0, ${alpha})`;
                        this.ctx.beginPath();
                        this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else if (effect.type === 'hit') {
                        // 击中特效
                        const progress = (this.frameCount - effect.startFrame) / effect.duration;
                        if (progress > 1) continue;
                        
                        const radius = effect.radius * (1 - progress);
                        const alpha = 1 - progress;
                        
                        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                        this.ctx.beginPath();
                        this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }
            
            drawBossHealth() {
                // 更新BOSS血条显示
                const healthPercent = (this.bossHealth / this.bossMaxHealth) * 100;
                if (this.bossHealthFill) {
                    this.bossHealthFill.style.width = `${healthPercent}%`;
                }
                if (this.bossHealthText) {
                    this.bossHealthText.textContent = `BOSS: ${Math.round(healthPercent)}%`;
                }
            }
            
            update() {
                if (this.gameOver || this.paused) {
                    if (this.needsRedraw) {
                        this.draw();
                    }
                    return;
                }
                
                // 检查任务完成状态
                if (this.missionComplete) {
                    this.missionCompleteTimer++;
                    
                    // 显示任务完成界面
                    const missionCompleteElem = document.getElementById('danmakuMissionComplete');
                    const allLevelsCompleteElem = document.getElementById('danmakuAllLevelsComplete');
                    
                    if (this.allLevelsComplete) {
                        // 全部关卡完成
                        allLevelsCompleteElem.style.display = 'block';
                        document.getElementById('danmakuFinalScore').textContent = this.score;
                        
                        // 播放通关音效
                        this.playCompletionSound();
                        
                        // 5秒后自动返回主页
                        if (this.missionCompleteTimer > 300) {
                            this.allLevelsComplete = false;
                            this.missionComplete = false;
                            this.missionCompleteTimer = 0;
                            allLevelsCompleteElem.style.display = 'none';
                            document.getElementById('danmakuGameContainer').style.display = 'none';
                            document.body.style.overflow = 'auto';
                            this.stop();
                        }
                    } else {
                        // 单关卡完成
                        missionCompleteElem.style.display = 'block';
                        
                        // 播放通关音效
                        this.playCompletionSound();
                        
                        // 3秒后自动进入下一关
                        if (this.missionCompleteTimer > 180) {
                            this.missionComplete = false;
                            this.missionCompleteTimer = 0;
                            missionCompleteElem.style.display = 'none';
                            
                            // 检查是否达到最高关卡（经典模式10关）
                            if (this.stage > 10) {
                                this.allLevelsComplete = true;
                                this.missionComplete = true;
                                this.missionCompleteTimer = 0;
                                
                                // 调用游戏结束效果，弹出保存分数提示
                                setTimeout(() => {
                                    createGameOverEffect('danmaku', this.score);
                                }, 2000);
                            } else {
                                // 继续游戏
                                this.needsRedraw = true;
                                this.draw();
                            }
                        }
                    }
                    
                    return;
                }
                
                this.frameCount++;
                // 每帧更新空间分区索引，用于优化后续碰撞检测
                if (this.usePooling) {
                    this.buildSpatialGrid();
                }
                
                // 更新玩家状态
                this.updatePlayer();
                
                // 更新子弹
                this.updateBullets();
                
                // 更新敌人
                this.updateEnemies();
                
                // 更新敌人子弹
                this.updateEnemyBullets();
                
                // 更新道具
                this.updatePowerUps();
                
                // 更新特效
                this.updateEffects();
                
                // 生成敌人
                this.spawnEnemies();
                
                // 生成BOSS
                this.spawnBoss();
                
                // 碰撞检测 - 使用缩小后的受击判定
                this.checkCollisions();
                
                // 清理过期对象
                this.cleanupObjects();
                
                // 更新显示
                this.updateDisplay();
                
                // 绘制
                this.needsRedraw = true;
                this.draw();
            }
            
            updatePlayer() {
                const player = this.player;
                
                // 更新无敌计时器
                if (player.invincible) {
                    player.invincibleTimer--;
                    if (player.invincibleTimer <= 0) {
                        player.invincible = false;
                    }
                }
                
                // 更新射击计时器
                if (player.shootTimer > 0) {
                    player.shootTimer--;
                }
                
                // 更新炸弹计时器
                if (player.bombTimer > 0) {
                    player.bombTimer--;
                }
                
                // 处理玩家移动
                const speed = player.isSlow ? player.slowSpeed : player.speed;
                
                if (this.keys.up && player.y > player.height / 2) {
                    player.y -= speed;
                }
                if (this.keys.down && player.y < this.canvas.height - player.height / 2) {
                    player.y += speed;
                }
                if (this.keys.left && player.x > player.width / 2) {
                    player.x -= speed;
                }
                if (this.keys.right && player.x < this.canvas.width - player.width / 2) {
                    player.x += speed;
                }
                
                // 处理射击
                if (this.keys.shoot && player.shootTimer <= 0) {
                    this.shoot();
                    player.shootTimer = player.shootDelay;
                }
                
                // 处理炸弹
                if (this.keys.bomb && this.bombs > 0 && player.bombTimer <= 0) {
                    this.useBomb();
                    player.bombTimer = 60; // 炸弹使用间隔
                }
                
                // 处理低速移动
                player.isSlow = this.keys.slow;
            }
            
            shoot() {
                const player = this.player;
                
                // 播放射击音效
                this.playShootSound();
                
                // 根据火力等级发射子弹
                if (this.power === 1) {
                    // 单发子弹
                    this.bullets.push({
                        x: player.x,
                        y: player.y - player.height / 2,
                        vx: 0,
                        vy: -10,
                        radius: 3,
                        damage: 1,
                        color: '#00d9ff'
                    });
                } else if (this.power === 2) {
                    // 双发子弹
                    this.bullets.push({
                        x: player.x - 10,
                        y: player.y - player.height / 2,
                        vx: -0.5,
                        vy: -10,
                        radius: 3,
                        damage: 1,
                        color: '#00d9ff'
                    });
                    this.bullets.push({
                        x: player.x + 10,
                        y: player.y - player.height / 2,
                        vx: 0.5,
                        vy: -10,
                        radius: 3,
                        damage: 1,
                        color: '#00d9ff'
                    });
                } else if (this.power >= 3) {
                    // 三发子弹
                    this.bullets.push({
                        x: player.x,
                        y: player.y - player.height / 2,
                        vx: 0,
                        vy: -10,
                        radius: 4,
                        damage: 1,
                        color: '#ffcc00'
                    });
                    this.bullets.push({
                        x: player.x - 15,
                        y: player.y - player.height / 2 + 10,
                        vx: -1,
                        vy: -9,
                        radius: 3,
                        damage: 1,
                        color: '#00d9ff'
                    });
                    this.bullets.push({
                        x: player.x + 15,
                        y: player.y - player.height / 2 + 10,
                        vx: 1,
                        vy: -9,
                        radius: 3,
                        damage: 1,
                        color: '#00d9ff'
                    });
                }
                
                // 如果火力等级更高，增加额外子弹
                if (this.power >= 4) {
                    this.bullets.push({
                        x: player.x - 25,
                        y: player.y - player.height / 2 + 20,
                        vx: -2,
                        vy: -8,
                        radius: 3,
                        damage: 1,
                        color: '#ff0064'
                    });
                    this.bullets.push({
                        x: player.x + 25,
                        y: player.y - player.height / 2 + 20,
                        vx: 2,
                        vy: -8,
                        radius: 3,
                        damage: 1,
                        color: '#ff0064'
                    });
                }
            }
            
            useBomb() {
                if (this.bombs <= 0) return;
                
                // 播放炸弹爆炸音效
                this.playBombSound();
                
                this.bombs--;
                this.updateDisplay();
                
                // 清除所有敌人子弹
                this.enemyBullets = [];
                
                // 对屏幕上的所有敌人造成伤害
                for (const enemy of this.enemies) {
                    if (enemy.type === 'small') {
                        this.score += 100;
                        this.createExplosion(enemy.x, enemy.y, 20);
                        this.playEnemyDeathSound();
                        enemy.health = 0; // 立即消灭小型敌机
                    } else {
                        // 对中型敌机和BOSS造成大量伤害
                        enemy.health -= 50;
                        if (enemy.type === 'boss') {
                            this.bossHealth = enemy.health;
                            if (this.bossHealthFill) {
                                const pct = Math.max(0, Math.min(1, this.bossHealth / (enemy.maxHealth || this.bossMaxHealth)));
                                this.bossHealthFill.style.width = `${Math.round(pct * 100)}%`;
                            }
                            if (this.bossHealthText) {
                                this.bossHealthText.textContent = `BOSS: ${Math.max(0, Math.round(this.bossHealth))}`;
                            }
                        }
                        this.createExplosion(enemy.x, enemy.y, 30);
                        
                        if (enemy.health <= 0) {
                            if (enemy.type === 'medium') {
                                this.score += 500;
                                this.playMediumEnemyDeathSound();
                            } else if (enemy.type === 'boss') {
                                this.score += 5000;
                                this.bossActive = false;
                                if (this.bossHealthBar) {
                                    this.bossHealthBar.style.display = 'none';
                                }
                                this.playBossDeathSound();
                            }
                        }
                    }
                }
                
                // 创建全屏爆炸特效
                for (let i = 0; i < 20; i++) {
                    this.createExplosion(
                        Math.random() * this.canvas.width,
                        Math.random() * this.canvas.height,
                        30
                    );
                }
            }
            
            updateBullets() {
                for (let i = this.bullets.length - 1; i >= 0; i--) {
                    const bullet = this.bullets[i];
                    
                    // 移动子弹
                    bullet.x += bullet.vx;
                    bullet.y += bullet.vy;
                    
                    // 移除超出屏幕的子弹
                    if (bullet.y < -10 || bullet.y > this.canvas.height + 10 ||
                        bullet.x < -10 || bullet.x > this.canvas.width + 10) {
                        const removed = this.bullets.splice(i, 1)[0];
                        if (this.usePooling) {
                            if (this.pools.bullets.length < this.maxBullets) this.pools.bullets.push(removed);
                        }
                    }
                }
            }
            
            updateEnemies() {
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    
                    // 移动敌人
                    enemy.x += enemy.vx;
                    enemy.y += enemy.vy;
                    
                    // 敌人AI
                    if (enemy.type === 'small') {
                        // 小型敌机简单移动
                        if (enemy.y > this.canvas.height + 50) {
                            this.enemies.splice(i, 1);
                            continue;
                        }
                        
                        // 随机射击
                        if (Math.random() < 0.01) {
                            this.enemyShoot(enemy);
                        }
                    } else if (enemy.type === 'medium') {
                        // 中型敌机移动模式
                        enemy.vy = Math.sin(this.frameCount / 30 + enemy.id) * 1;
                        
                        if (enemy.y > this.canvas.height + 100) {
                            this.enemies.splice(i, 1);
                            continue;
                        }
                        
                        // 更频繁射击
                        if (Math.random() < 0.02) {
                            this.enemyShoot(enemy);
                        }
                    } else if (enemy.type === 'boss') {
                        // BOSS移动模式
                        enemy.vx = Math.sin(this.frameCount / 60) * 2;
                        
                        // BOSS射击模式
                        if (this.frameCount % 30 === 0) {
                            this.bossShoot(enemy);
                        }
                        
                        // BOSS特殊攻击
                        if (this.frameCount % 120 === 0) {
                            this.bossSpecialAttack(enemy);
                        }
                        // 限制BOSS位置：保持在画布上半部分并避免飞出侧边/顶部
                        const r = enemy.radius || 60;
                        // 水平夹住
                        if (enemy.x < r) enemy.x = r;
                        if (enemy.x > this.canvas.width - r) enemy.x = this.canvas.width - r;
                        // 限制垂直范围到画布上半部分（留一点下边距）
                        const maxY = Math.max(r, Math.floor(this.canvas.height * 0.45));
                        if (enemy.y > maxY) {
                            enemy.y = maxY;
                            // 避免继续向下移动
                            if (enemy.vy > 0) enemy.vy = 0;
                        }
                        // 不允许过度飞出顶部
                        const minY = -r * 2;
                        if (enemy.y < minY) {
                            enemy.y = minY;
                            enemy.vy = Math.abs(enemy.vy) || 1;
                        }
                    }
                    
                    // 检查敌人是否死亡
                    if (enemy.health <= 0) {
                        this.createExplosion(enemy.x, enemy.y, enemy.type === 'boss' ? 50 : 20);
                        
                        // 掉落道具
                        this.dropPowerUp(enemy);
                        
                        // 从数组中移除
                        this.enemies.splice(i, 1);
                        
                        // 如果是BOSS，更新游戏状态
                        if (enemy.type === 'boss') {
                            this.bossActive = false;
                            if (this.bossHealthBar) {
                                this.bossHealthBar.style.display = 'none';
                            }
                            
                            // 无论什么模式，击败BOSS后都增加关卡数
                            this.stage++;
                            
                            // 经典模式下触发任务完成
                            if (this.gameMode === 'classic') {
                                this.missionComplete = true;
                                this.missionCompleteTimer = 0;
                            }
                            
                            this.updateDisplay();
                        }
                    }
                }
            }
            
            enemyShoot(enemy) {
                // 敌人射击
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                const speed = 3;
                
                // 使用对象池复用敌人子弹，且限制最大数量
                let eb;
                if (this.usePooling && this.pools.enemyBullets.length) {
                    eb = this.pools.enemyBullets.pop();
                    eb.x = enemy.x;
                    eb.y = enemy.y + enemy.radius;
                    eb.vx = Math.cos(angle) * speed;
                    eb.vy = Math.sin(angle) * speed;
                    eb.radius = 3;
                    eb.damage = 1;
                    eb.color = '#ff0064';
                    eb.type = 'normal';
                } else {
                    eb = {
                        x: enemy.x,
                        y: enemy.y + enemy.radius,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: 3,
                        damage: 1,
                        color: '#ff0064',
                        type: 'normal'
                    };
                }
                if (this.enemyBullets.length < this.maxEnemyBullets) this.enemyBullets.push(eb);
            }
            
            bossShoot(boss) {
                // BOSS射击 - 环形弹幕
                const bulletCount = 12 + this.stage * 2;
                
                for (let i = 0; i < bulletCount; i++) {
                    const angle = (Math.PI * 2 / bulletCount) * i + this.frameCount / 30;
                    const speed = 2;
                    
                    this.enemyBullets.push({
                        x: boss.x,
                        y: boss.y + boss.radius,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: 4,
                        damage: 2,
                        color: '#ff0000',
                        type: 'ring'
                    });
                }
            }
            
            bossSpecialAttack(boss) {
                // BOSS特殊攻击 - 激光
                for (let i = 0; i < 3; i++) {
                    const offset = (i - 1) * 100;
                    
                    this.enemyBullets.push({
                        x: boss.x + offset,
                        y: boss.y + boss.radius,
                        vx: 0,
                        vy: 5,
                        radius: 5,
                        damage: 3,
                        color: '#ff9900',
                        type: 'laser'
                    });
                }
            }
            
            updateEnemyBullets() {
                for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                    const bullet = this.enemyBullets[i];
                    
                    // 移动子弹
                    bullet.x += bullet.vx;
                    bullet.y += bullet.vy;
                    
                    // 移除超出屏幕的子弹
                    if (bullet.y > this.canvas.height + 50 ||
                        bullet.x < -50 || bullet.x > this.canvas.width + 50) {
                        const removed = this.enemyBullets.splice(i, 1)[0];
                        if (this.usePooling) {
                            if (this.pools.enemyBullets.length < this.maxEnemyBullets) this.pools.enemyBullets.push(removed);
                        }
                    }
                }
            }
            
            updatePowerUps() {
                for (let i = this.powerUps.length - 1; i >= 0; i--) {
                    const powerUp = this.powerUps[i];
                    
                    // 移动道具
                    powerUp.y += powerUp.vy;
                    
                    // 移除超出屏幕的道具
                    if (powerUp.y > this.canvas.height + 20) {
                        this.powerUps.splice(i, 1);
                    }
                }
            }
            
            updateEffects() {
                // 清理过期特效
                for (let i = this.effects.length - 1; i >= 0; i--) {
                    const effect = this.effects[i];
                    if (this.frameCount - effect.startFrame > effect.duration) {
                        this.effects.splice(i, 1);
                    }
                }
            }
            
            spawnEnemies() {
                // 敌人生成逻辑
                this.enemySpawnTimer++;
                if (this.enemySpawnTimer >= this.enemySpawnDelay && !this.bossActive) {
                    this.enemySpawnTimer = 0;
                    
                    // 根据关卡调整敌人生成难度，且限制最大敌人数量
                    const enemyCount = Math.min(3 + Math.floor(this.stage / 2), 8);
                    const allowed = Math.max(0, this.maxEnemies - this.enemies.length);
                    const spawnCount = Math.min(enemyCount, allowed);

                    for (let i = 0; i < spawnCount; i++) {
                        const type = Math.random() < 0.7 ? 'small' : 'medium';
                        let en;
                        if (this.usePooling && this.pools.enemies.length) {
                            en = this.pools.enemies.pop();
                        } else {
                            en = {};
                        }

                        if (type === 'small') {
                            // 小型敌机
                            Object.assign(en, {
                                id: this.frameCount + i,
                                x: Math.random() * (this.canvas.width - 100) + 50,
                                y: -50,
                                vx: (Math.random() - 0.5) * 2,
                                vy: 1 + Math.random() * 1,
                                radius: 15,
                                health: 1,
                                maxHealth: 1,
                                type: 'small',
                                color: '#ff00ff'
                            });
                        } else {
                            // 中型敌机
                            Object.assign(en, {
                                id: this.frameCount + i,
                                x: Math.random() * (this.canvas.width - 100) + 50,
                                y: -100,
                                vx: (Math.random() - 0.5) * 1,
                                vy: 0.5 + Math.random() * 0.5,
                                width: 40,
                                height: 40,
                                radius: 20,
                                health: 5 + this.stage,
                                maxHealth: 5 + this.stage,
                                type: 'medium',
                                color: '#ff9900'
                            });
                        }

                        this.enemies.push(en);
                    }
                }
            }
            
            spawnBoss() {
                // BOSS生成逻辑
                if (!this.bossActive && this.frameCount - this.bossSpawnTimer > this.bossSpawnDelay) {
                    this.bossSpawnTimer = this.frameCount;
                    this.bossActive = true;
                    
                    // 显示BOSS血条
                    if (this.bossHealthBar) {
                        this.bossHealthBar.style.display = 'block';
                    }
                    
                    // 创建BOSS
                    this.bossMaxHealth = 100 + this.stage * 50;
                    this.bossHealth = this.bossMaxHealth;
                    // 同步血条显示
                    if (this.bossHealthFill) {
                        this.bossHealthFill.style.width = '100%';
                    }
                    if (this.bossHealthText) {
                        this.bossHealthText.textContent = `BOSS: ${this.bossHealth}`;
                    }
                    
                    this.enemies.push({
                        id: this.frameCount,
                        x: this.canvas.width / 2,
                        y: -100,
                        vx: 0,
                        vy: 1,
                        radius: 60,
                        health: this.bossHealth,
                        maxHealth: this.bossMaxHealth,
                        type: 'boss',
                        color: '#ff0000'
                    });
                }
            }
            
            checkCollisions() {
                // 玩家子弹与敌人碰撞检测
                for (let i = this.bullets.length - 1; i >= 0; i--) {
                    const bullet = this.bullets[i];
                    
                    for (let j = this.enemies.length - 1; j >= 0; j--) {
                        const enemy = this.enemies[j];
                        
                        // 计算距离
                        let distance;
                        if (enemy.type === 'small' || enemy.type === 'boss') {
                            // 圆形敌人
                            distance = Math.sqrt(
                                Math.pow(bullet.x - enemy.x, 2) + 
                                Math.pow(bullet.y - enemy.y, 2)
                            );
                        } else {
                            // 矩形敌人
                            const dx = Math.abs(bullet.x - enemy.x);
                            const dy = Math.abs(bullet.y - enemy.y);
                            
                            if (dx > enemy.width/2 || dy > enemy.height/2) {
                                continue;
                            }
                            distance = Math.sqrt(dx*dx + dy*dy);
                        }
                        
                        // 检查碰撞
                        let collisionDistance;
                        if (enemy.type === 'small') {
                            collisionDistance = enemy.radius + bullet.radius;
                        } else if (enemy.type === 'medium') {
                            collisionDistance = Math.min(enemy.width, enemy.height)/2 + bullet.radius;
                        } else {
                            collisionDistance = enemy.radius + bullet.radius;
                        }
                        
                        if (distance < collisionDistance) {
                            // 造成伤害
                            enemy.health -= bullet.damage;
                            // 如果是BOSS，更新全局BOSS血条显示
                            if (enemy.type === 'boss') {
                                this.bossHealth = enemy.health;
                                if (this.bossHealthFill) {
                                    const pct = Math.max(0, Math.min(1, this.bossHealth / (enemy.maxHealth || this.bossMaxHealth)));
                                    this.bossHealthFill.style.width = `${Math.round(pct * 100)}%`;
                                }
                                if (this.bossHealthText) {
                                    this.bossHealthText.textContent = `BOSS: ${Math.max(0, Math.round(this.bossHealth))}`;
                                }
                            }

                            // 创建击中特效
                            this.createHitEffect(bullet.x, bullet.y);
                            
                            // 移除子弹
                            this.bullets.splice(i, 1);
                            
                            // 如果敌人死亡
                            if (enemy.health <= 0) {
                                // 增加得分
                                if (enemy.type === 'small') {
                                    this.score += 100;
                                    this.playEnemyDeathSound();
                                } else if (enemy.type === 'medium') {
                                    this.score += 500;
                                    this.playMediumEnemyDeathSound();
                                } else if (enemy.type === 'boss') {
                                    this.score += 5000;
                                    this.bossActive = false;
                                    if (this.bossHealthBar) {
                                        this.bossHealthBar.style.display = 'none';
                                    }
                                    this.stage++;
                                    this.playBossDeathSound();
                                }
                                
                                // 创建爆炸特效
                                this.createExplosion(enemy.x, enemy.y, enemy.type === 'boss' ? 50 : 20);
                                
                                // 掉落道具
                                this.dropPowerUp(enemy);
                                
                                // 移除敌人
                                this.enemies.splice(j, 1);
                            }
                            
                            break;
                        }
                    }
                }
                
                // 敌人子弹与玩家碰撞检测
                if (!this.player.invincible) {
                    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                        const bullet = this.enemyBullets[i];
                        const distance = Math.sqrt(
                            Math.pow(bullet.x - this.player.x, 2) + 
                            Math.pow(bullet.y - this.player.y, 2)
                        );
                        
                        if (distance < 15) { // 玩家碰撞半径15
                            // 玩家受伤
                            this.playerHit();
                            
                            // 移除子弹
                            this.enemyBullets.splice(i, 1);
                            
                            // 创建击中特效
                            this.createHitEffect(bullet.x, bullet.y);
                        }
                    }
                    
                    // 敌人与玩家碰撞检测
                    for (let i = this.enemies.length - 1; i >= 0; i--) {
                        const enemy = this.enemies[i];
                        const distance = Math.sqrt(
                            Math.pow(enemy.x - this.player.x, 2) + 
                            Math.pow(enemy.y - this.player.y, 2)
                        );
                        
                        let collisionDistance;
                        if (enemy.type === 'small') {
                            collisionDistance = enemy.radius + 15;
                        } else if (enemy.type === 'medium') {
                            collisionDistance = Math.min(enemy.width, enemy.height)/2 + 15;
                        } else {
                            collisionDistance = enemy.radius + 15;
                        }
                        
                        if (distance < collisionDistance) {
                            // 玩家受伤
                            this.playerHit();
                            
                            // 敌人也受伤
                            enemy.health -= 5;
                            if (enemy.type === 'boss') {
                                this.bossHealth = enemy.health;
                                if (this.bossHealthFill) {
                                    const pct = Math.max(0, Math.min(1, this.bossHealth / (enemy.maxHealth || this.bossMaxHealth)));
                                    this.bossHealthFill.style.width = `${Math.round(pct * 100)}%`;
                                }
                                if (this.bossHealthText) {
                                    this.bossHealthText.textContent = `BOSS: ${Math.max(0, Math.round(this.bossHealth))}`;
                                }
                            }
                            
                            if (enemy.health <= 0) {
                                this.createExplosion(enemy.x, enemy.y, 20);
                                // 播放敌人死亡音效
                                if (enemy.type === 'small') {
                                    this.playEnemyDeathSound();
                                } else if (enemy.type === 'medium') {
                                    this.playMediumEnemyDeathSound();
                                } else if (enemy.type === 'boss') {
                                    this.playBossDeathSound();
                                }
                                this.enemies.splice(i, 1);
                            }
                        }
                    }
                }
                
                // 道具与玩家碰撞检测
                for (let i = this.powerUps.length - 1; i >= 0; i--) {
                    const powerUp = this.powerUps[i];
                    const distance = Math.sqrt(
                        Math.pow(powerUp.x - this.player.x, 2) + 
                        Math.pow(powerUp.y - this.player.y, 2)
                    );
                    
                    if (distance < powerUp.radius + 15) {
                        // 获得道具
                        this.collectPowerUp(powerUp);
                        this.powerUps.splice(i, 1);
                    }
                }
            }
            
            playerHit() {
                if (this.player.invincible) return;
                
                this.lives--;
                this.updateDisplay();
                
                // 无敌状态
                this.player.invincible = true;
                this.player.invincibleTimer = 120; // 2秒无敌
                
                // 创建爆炸特效
                this.createExplosion(this.player.x, this.player.y, 20);
                
                // 检查游戏是否结束
                if (this.lives <= 0) {
                    this.gameOver = true;
                    
                    // 停止音乐并播放游戏失败音效
                    this.stopMusic();
                    this.playGameOverSound();
                    
                    // 设置当前游戏得分，包含游戏模式
                    if (window.leaderboardSystem) {
                        window.leaderboardSystem.setCurrentScore('danmaku', this.score, 1, this.stage, this.gameMode);
                    }
                    
                    createGameOverEffect('danmaku', this.score);
                }
            }
            
            collectPowerUp(powerUp) {
                if (powerUp.type === 'power') {
                    // 增加火力
                    this.power = Math.min(this.power + 1, 5);
                    this.updateDisplay();
                } else if (powerUp.type === 'life') {
                    // 增加生命
                    this.lives = Math.min(this.lives + 1, 5);
                    this.updateDisplay();
                } else if (powerUp.type === 'bomb') {
                    // 增加炸弹
                    this.bombs = Math.min(this.bombs + 1, 5);
                    this.updateDisplay();
                }
            }
            
            dropPowerUp(enemy) {
                // 随机掉落道具
                const dropChance = Math.random();
                
                if (dropChance < 0.3) {
                    // 30%几率掉落火力道具
                    const powerUpTypes = ['power', 'life', 'bomb'];
                    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                    const colors = {
                        'power': '#00d9ff',
                        'life': '#ff0064',
                        'bomb': '#ff9900'
                    };
                    
                    this.powerUps.push({
                        id: this.frameCount,
                        x: enemy.x,
                        y: enemy.y,
                        vy: 2,
                        radius: 10,
                        type: type,
                        color: colors[type]
                    });
                }
            }
            
            createExplosion(x, y, radius) {
                this.effects.push({
                    type: 'explosion',
                    x: x,
                    y: y,
                    radius: radius,
                    startFrame: this.frameCount,
                    duration: 30
                });
            }
            
            createHitEffect(x, y) {
                this.effects.push({
                    type: 'hit',
                    x: x,
                    y: y,
                    radius: 5,
                    startFrame: this.frameCount,
                    duration: 10
                });
            }
            
            cleanupObjects() {
                // 清理超出屏幕的子弹
                this.bullets = this.bullets.filter(bullet => 
                    bullet.y > -20 && bullet.y < this.canvas.height + 20 &&
                    bullet.x > -20 && bullet.x < this.canvas.width + 20
                );
                
                this.enemyBullets = this.enemyBullets.filter(bullet => 
                    bullet.y > -50 && bullet.y < this.canvas.height + 50 &&
                    bullet.x > -50 && bullet.x < this.canvas.width + 50
                );
            }
            
            // 播放通关音效
            playCompletionSound() {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const masterGain = audioContext.createGain();
                masterGain.gain.value = 0.2;
                masterGain.connect(audioContext.destination);
                
                // 通关音效：更柔和的上升音阶，使用更低的频率
                const frequencies = [392.00, 493.88, 587.33, 698.46, 880.00, 1046.50, 1318.51];
                
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        
                        const gainNode = audioContext.createGain();
                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(masterGain);
                        
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.4);
                    }, index * 100);
                });
            }
            
            // 播放小型敌机死亡音效
            playEnemyDeathSound() {
                try {
                    const audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // 设置小型敌机死亡音效的音色和频率
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
                    oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.1); // A3
                    
                    // 设置音量包络
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                } catch (error) {
                    console.error('无法播放小型敌机死亡音效:', error);
                }
            }
            
            // 播放中型敌机死亡音效
            playMediumEnemyDeathSound() {
                try {
                    const audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // 设置中型敌机死亡音效的音色和频率
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(330, audioContext.currentTime); // E4
                    oscillator.frequency.exponentialRampToValueAtTime(165, audioContext.currentTime + 0.15); // E3
                    
                    // 设置音量包络
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                } catch (error) {
                    console.error('无法播放中型敌机死亡音效:', error);
                }
            }
            
            // 播放BOSS死亡音效
            playBossDeathSound() {
                try {
                    const audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
                    const masterGain = audioContext.createGain();
                    masterGain.gain.value = 0.5;
                    masterGain.connect(audioContext.destination);
                    
                    // BOSS死亡音效：爆炸音效 + 结束音效
                    
                    // 爆炸音效（低频）
                    const explosionOsc = audioContext.createOscillator();
                    const explosionGain = audioContext.createGain();
                    explosionOsc.connect(explosionGain);
                    explosionGain.connect(masterGain);
                    
                    explosionOsc.type = 'sawtooth';
                    explosionOsc.frequency.setValueAtTime(110, audioContext.currentTime); // A2
                    explosionOsc.frequency.exponentialRampToValueAtTime(55, audioContext.currentTime + 0.5); // A1
                    
                    explosionGain.gain.setValueAtTime(0, audioContext.currentTime);
                    explosionGain.gain.linearRampToValueAtTime(0.8, audioContext.currentTime + 0.1);
                    explosionGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
                    
                    explosionOsc.start(audioContext.currentTime);
                    explosionOsc.stop(audioContext.currentTime + 0.6);
                    
                    // 结束音效（胜利旋律）
                    setTimeout(() => {
                        const victoryOsc = audioContext.createOscillator();
                        const victoryGain = audioContext.createGain();
                        victoryOsc.connect(victoryGain);
                        victoryGain.connect(masterGain);
                        
                        victoryOsc.type = 'sine';
                        victoryOsc.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
                        victoryOsc.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.3); // E4
                        victoryOsc.frequency.setValueAtTime(392.00, audioContext.currentTime + 0.6); // G4
                        victoryOsc.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.9); // C5
                        
                        victoryGain.gain.setValueAtTime(0, audioContext.currentTime);
                        victoryGain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
                        victoryGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
                        
                        victoryOsc.start(audioContext.currentTime);
                        victoryOsc.stop(audioContext.currentTime + 1.5);
                    }, 200);
                } catch (error) {
                    console.error('无法播放BOSS死亡音效:', error);
                }
            }
            

            saveCompletionRecord() {
                // 使用现有的排行榜系统保存记录
                if (window.leaderboardSystem) {
                    // 调用setCurrentScore并传递completed参数
                    window.leaderboardSystem.setCurrentScore('danmaku', this.score, 1, this.stage, this.gameMode, true);
                    
                    // 创建记录对象
                    const playerName = localStorage.getItem('playerName') || '玩家';
                    const record = {
                        id: Date.now(),
                        name: playerName,
                        game: 'danmaku',
                        score: this.score,
                        level: 1,
                        stage: this.stage,
                        date: new Date().toISOString(),
                        mode: this.gameMode,
                        completed: true // 直接标记为通关
                    };
                    
                    // 保存到本地存储
                    const leaderboardData = JSON.parse(localStorage.getItem('danmakuLeaderboard') || '[]');
                    leaderboardData.push(record);
                    localStorage.setItem('danmakuLeaderboard', JSON.stringify(leaderboardData));
                }
            }
            
            updateDisplay() {
                // 无敌时间显示（秒）
                const invincibleTime = Math.ceil(this.player.invincibleTimer / 60);
                const invincibleText = this.player.invincible ? `无敌: ${invincibleTime}s` : '';
                
                this.scoreElement.textContent = `得分: ${this.score} | 等级: ${this.stage}`;
                this.livesElement.textContent = `生命: ${this.lives}`;
                this.powerElement.textContent = `火力: ${this.power}`;
                this.bombsElement.textContent = `炸弹: ${this.bombs}`;
                this.stageElement.textContent = `关卡: ${this.stage}`;
                
                // 如果无敌状态，添加无敌时间显示
                if (this.player.invincible) {
                    // 可以在玩家周围添加无敌时间显示
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`无敌: ${invincibleTime}s`, this.player.x, this.player.y + this.player.height + 20);
                }
            }
            
            bindControls() {
                // 绑定键盘控制
                document.addEventListener('keydown', (e) => {
                    // 检查是否弹幕游戏是当前激活的游戏
                    if (!activeKeyListeners.has('danmaku')) return;
                    
                    const key = e.key.toLowerCase();
                    switch(key) {
                        case 'arrowup':
                        case 'w':
                            this.keys.up = true;
                            e.preventDefault();
                            break;
                        case 'arrowdown':
                        case 's':
                            this.keys.down = true;
                            e.preventDefault();
                            break;
                        case 'arrowleft':
                        case 'a':
                            this.keys.left = true;
                            e.preventDefault();
                            break;
                        case 'arrowright':
                        case 'd':
                            this.keys.right = true;
                            e.preventDefault();
                            break;
                        case 'z':
                        case ' ':
                            this.keys.shoot = true;
                            e.preventDefault();
                            break;
                        case 'x':
                            this.keys.bomb = true;
                            e.preventDefault();
                            break;
                        case 'shift':
                            this.keys.slow = true;
                            e.preventDefault();
                            break;
                        case 'p':
                            this.togglePause();
                            e.preventDefault();
                            break;
                        case 'r':
                            if (this.gameOver) this.restart();
                            e.preventDefault();
                            break;
                        case 'g':
                            // 隐藏功能：获得999个炸弹
                            this.bombs = 999;
                            this.updateDisplay();
                            e.preventDefault();
                            break;
                        case 'k':
                            // 隐藏功能：血量变为999
                            this.lives = 999;
                            this.updateDisplay();
                            e.preventDefault();
                            break;
                    }
                });
                
                document.addEventListener('keyup', (e) => {
                    const key = e.key.toLowerCase();
                    switch(key) {
                        case 'arrowup':
                        case 'w':
                            this.keys.up = false;
                            break;
                        case 'arrowdown':
                        case 's':
                            this.keys.down = false;
                            break;
                        case 'arrowleft':
                        case 'a':
                            this.keys.left = false;
                            break;
                        case 'arrowright':
                        case 'd':
                            this.keys.right = false;
                            break;
                        case 'z':
                        case ' ':
                            this.keys.shoot = false;
                            break;
                        case 'x':
                            this.keys.bomb = false;
                            break;
                        case 'shift':
                            this.keys.slow = false;
                            break;
                    }
                });
                
                // 绑定屏幕控制按钮
                const setupButton = (id, key) => {
                    const btn = document.getElementById(id);
                    if (!btn) return;
                    
                    btn.addEventListener('mousedown', () => { this.keys[key] = true; });
                    btn.addEventListener('touchstart', (e) => {
                        this.keys[key] = true;
                        e.preventDefault();
                    });
                    
                    btn.addEventListener('mouseup', () => { this.keys[key] = false; });
                    btn.addEventListener('mouseleave', () => { this.keys[key] = false; });
                    btn.addEventListener('touchend', (e) => {
                        this.keys[key] = false;
                        e.preventDefault();
                    });
                };
                
                setupButton('danmakuUp', 'up');
                setupButton('danmakuDown', 'down');
                setupButton('danmakuLeft', 'left');
                setupButton('danmakuRight', 'right');
                setupButton('danmakuShoot', 'shoot');
                setupButton('danmakuBomb', 'bomb');
                
                // 低速按钮特殊处理
                const slowBtn = document.getElementById('danmakuSlow');
                if (slowBtn) {
                    slowBtn.addEventListener('mousedown', () => { this.keys.slow = true; });
                    slowBtn.addEventListener('touchstart', (e) => {
                        this.keys.slow = true;
                        e.preventDefault();
                    });
                    
                    slowBtn.addEventListener('mouseup', () => { this.keys.slow = false; });
                    slowBtn.addEventListener('mouseleave', () => { this.keys.slow = false; });
                    slowBtn.addEventListener('touchend', (e) => {
                        this.keys.slow = false;
                        e.preventDefault();
                    });
                }
                
                document.getElementById('danmakuPause').addEventListener('click', () => {
                    this.togglePause();
                });
                
                // 点击画布重新开始游戏（如果游戏结束）
                this.canvas.addEventListener('click', () => {
                    if (this.gameOver) {
                        this.restart();
                        document.getElementById('danmakuGameOverEffect').style.opacity = '0';
                        setTimeout(() => {
                            document.getElementById('danmakuGameOverEffect').innerHTML = '';
                        }, 500);
                    }
                });
            }
            
            togglePause() {
                this.paused = !this.paused;
                this.needsRedraw = true;
                this.draw();
                
                // 暂停或恢复音乐
                if (this.paused) {
                    this.pauseMusic();
                } else {
                    this.resumeMusic();
                }
                
                // 绘制暂停文字
                if (this.paused) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    
                    this.ctx.fillStyle = '#4a00ff';
                    this.ctx.font = 'bold 40px "Microsoft YaHei"';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2);
                    
                    // 添加继续提示
                    this.ctx.fillStyle = '#00d9ff';
                    this.ctx.font = 'bold 20px "Microsoft YaHei"';
                    this.ctx.fillText('按P键或点击暂停按钮继续', this.canvas.width/2, this.canvas.height/2 + 50);
                }
            }
            
            restart() {
                this.score = 0;
                this.lives = 3;
                this.power = 1;
                this.bombs = 3;
                this.stage = 1;
                this.gameOver = false;
                this.paused = false;
                this.bossActive = false;
                this.missionComplete = false;
                this.allLevelsComplete = false;
                
                this.player.x = this.canvas.width / 2;
                this.player.y = this.canvas.height - 100;
                this.player.invincible = false;
                this.player.invincibleTimer = 0;
                
                this.bullets = [];
                this.enemies = [];
                this.enemyBullets = [];
                this.powerUps = [];
                this.effects = [];
                
                this.frameCount = 0;
                this.enemySpawnTimer = 0;
                this.bossSpawnTimer = 0;
                
                if (this.bossHealthBar) {
                    this.bossHealthBar.style.display = 'none';
                }
                
                // 确保游戏模式选择界面隐藏，游戏画布显示
                const gameModeSelect = document.getElementById('danmakuGameModeSelect');
                const gameCanvasContainer = document.getElementById('danmakuGameCanvasContainer');
                if (gameModeSelect) {
                    gameModeSelect.style.display = 'none';
                }
                if (gameCanvasContainer) {
                    gameCanvasContainer.style.display = 'block';
                }
                
                // 隐藏任务完成和全部关卡完成界面
                const missionCompleteElem = document.getElementById('danmakuMissionComplete');
                const allLevelsCompleteElem = document.getElementById('danmakuAllLevelsComplete');
                if (missionCompleteElem) {
                    missionCompleteElem.style.display = 'none';
                }
                if (allLevelsCompleteElem) {
                    allLevelsCompleteElem.style.display = 'none';
                }
                
                this.updateDisplay();
                this.needsRedraw = true;
                this.draw();
                
                // 重新启动游戏循环
                this.start();
            }
            
            start() {
                if (danmakuAnimationFrame) {
                    cancelAnimationFrame(danmakuAnimationFrame);
                }
                
                // 开始播放音乐
                this.playMusic();
                
                this.lastUpdate = 0;
                const gameLoop = (timestamp) => {
                    if (!this.lastUpdate) this.lastUpdate = timestamp;
                    const deltaTime = timestamp - this.lastUpdate;
                    
                    if (deltaTime > 16) { // 大约60FPS
                        this.update();
                        this.lastUpdate = timestamp;
                    }
                    
                    if (!this.gameOver) {
                        danmakuAnimationFrame = requestAnimationFrame(gameLoop);
                    }
                };
                danmakuAnimationFrame = requestAnimationFrame(gameLoop);
            }
            
            // 播放射击音效
            playShootSound() {
                try {
                    const audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    // 设置射击音效的音色和频率
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
                    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1); // A4
                    
                    // 设置音量包络
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    
                    // 播放音效
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                } catch (error) {
                    console.error('无法播放射击音效:', error);
                }
            }
            
            // 播放炸弹爆炸音效
            playBombSound() {
                try {
                    const audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
                    
                    // 主爆炸音效：低频冲击
                    const mainOsc = audioContext.createOscillator();
                    const mainGain = audioContext.createGain();
                    mainOsc.connect(mainGain);
                    mainGain.connect(audioContext.destination);
                    
                    mainOsc.type = 'sawtooth';
                    mainOsc.frequency.setValueAtTime(150, audioContext.currentTime);
                    mainOsc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
                    
                    mainGain.gain.setValueAtTime(0, audioContext.currentTime);
                    mainGain.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
                    mainGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
                    
                    // 次爆炸音效：高频杂音
                    const noiseOsc = audioContext.createOscillator();
                    const noiseGain = audioContext.createGain();
                    noiseOsc.connect(noiseGain);
                    noiseGain.connect(audioContext.destination);
                    
                    noiseOsc.type = 'square';
                    noiseOsc.frequency.setValueAtTime(2000, audioContext.currentTime);
                    noiseOsc.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.3);
                    
                    noiseGain.gain.setValueAtTime(0, audioContext.currentTime);
                    noiseGain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
                    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    
                    mainOsc.start(audioContext.currentTime);
                    mainOsc.stop(audioContext.currentTime + 1.0);
                    
                    noiseOsc.start(audioContext.currentTime);
                    noiseOsc.stop(audioContext.currentTime + 0.5);
                    
                } catch (error) {
                    console.error('无法播放炸弹爆炸音效:', error);
                }
            }
            
            // 播放游戏失败音效
            playGameOverSound() {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const gainNode = audioContext.createGain();
                    gainNode.gain.value = 0.3;
                    gainNode.connect(audioContext.destination);
                    
                    // 游戏失败音效：悲伤的下降音阶
                    const frequencies = [392.00, 349.23, 293.66, 261.63]; // G4, F4, D4, C4 - 下降音阶
                    const noteDuration = 0.4;
                    
                    frequencies.forEach((freq, index) => {
                        setTimeout(() => {
                            const oscillator = audioContext.createOscillator();
                            const noteGain = audioContext.createGain();
                            oscillator.connect(noteGain);
                            noteGain.connect(gainNode);
                            
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                            
                            noteGain.gain.setValueAtTime(0, audioContext.currentTime);
                            noteGain.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
                            noteGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);
                            
                            oscillator.start(audioContext.currentTime);
                            oscillator.stop(audioContext.currentTime + noteDuration);
                        }, index * noteDuration * 1000);
                    });
                    
                } catch (error) {
                    console.error('无法播放游戏失败音效:', error);
                }
            }
            
            // 播放游戏音乐
            playMusic() {
                if (this.musicPlaying) return;
                
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.musicGain = this.audioContext.createGain();
                    this.musicGain.connect(this.audioContext.destination);
                    
                    let notes, noteDuration, volume, oscillatorType;
                    
                    // 根据游戏模式选择不同的音乐参数
                    if (this.gameMode === 'endless') {
                        // 无尽模式：更活跃、节奏更快的音乐
                        notes = [261.63, 349.23, 440.00, 523.25]; // C4, F4, A4, C5 - 更明亮的和弦
                        noteDuration = 0.5; // 较短的音符持续时间，节奏更快
                        volume = 0.15; // 中等音量
                        oscillatorType = 'sine'; // 正弦波，保持柔和
                    } else {
                        // 经典模式：更庄重、节奏更慢的音乐
                        notes = [196.00, 261.63, 329.63, 392.00]; // G3, C4, E4, G4 - 更低沉的和弦
                        noteDuration = 0.7; // 更长的音符持续时间，节奏更慢
                        volume = 0.12; // 更低的音量，更庄重
                        oscillatorType = 'triangle'; // 三角波，更柔和、圆润
                    }
                    
                    this.musicGain.gain.value = volume;
                    
                    let noteIndex = 0;
                    const playNextNote = () => {
                        if (!this.musicPlaying) return;
                        
                        // 创建振荡器
                        const oscillator = this.audioContext.createOscillator();
                        oscillator.type = oscillatorType;
                        oscillator.frequency.setValueAtTime(notes[noteIndex], this.audioContext.currentTime);
                        
                        // 创建增益节点来控制音符的音量包络
                        const gainNode = this.audioContext.createGain();
                        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.4, this.audioContext.currentTime + 0.2); // 更平滑的音量上升
                        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + noteDuration); // 更平滑的音量下降
                        
                        // 连接节点
                        oscillator.connect(gainNode);
                        gainNode.connect(this.musicGain);
                        
                        // 播放音符
                        oscillator.start(this.audioContext.currentTime);
                        oscillator.stop(this.audioContext.currentTime + noteDuration);
                        
                        // 将振荡器添加到数组以便管理
                        this.musicOscillators.push(oscillator);
                        
                        // 安排下一个音符
                        noteIndex = (noteIndex + 1) % notes.length;
                        setTimeout(playNextNote, noteDuration * 1000 * 0.9); // 更平滑的音符过渡
                    };
                    
                    this.musicPlaying = true;
                    playNextNote();
                } catch (error) {
                    console.error('无法播放游戏音乐:', error);
                }
            }
            
            // 暂停音乐
            pauseMusic() {
                if (this.audioContext && this.audioContext.state === 'running') {
                    this.audioContext.suspend();
                }
            }
            
            // 恢复音乐
            resumeMusic() {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }
            
            // 停止音乐
            stopMusic() {
                if (!this.musicPlaying) return;
                
                this.musicPlaying = false;
                
                // 停止所有振荡器
                this.musicOscillators.forEach(oscillator => {
                    try {
                        oscillator.stop();
                    } catch (error) {
                        // 忽略已停止的振荡器
                    }
                });
                this.musicOscillators = [];
                
                // 关闭音频上下文
                if (this.audioContext) {
                    this.audioContext.close();
                    this.audioContext = null;
                }
            }
            
            stop() {
                if (danmakuAnimationFrame) {
                    cancelAnimationFrame(danmakuAnimationFrame);
                    danmakuAnimationFrame = null;
                }
                
                // 停止音乐
                this.stopMusic();
            }
        }
        
        // ==================== 排行榜系统 ====================
        class LeaderboardSystem {
            constructor() {
                this.currentGame = null;
                this.currentScore = 0;
                this.currentLevel = 1;
                this.currentStage = 1;
                this.currentGameMode = 'endless'; // 当前游戏模式
                this.playerName = localStorage.getItem('playerName') || '玩家';
                
                this.initializeLeaderboard();
                this.bindLeaderboardEvents();
                this.updateStats();
            }
            
            // 初始化排行榜
            initializeLeaderboard() {
                // 检查本地存储中是否有排行榜数据
                if (!localStorage.getItem('snakeLeaderboard')) {
                    localStorage.setItem('snakeLeaderboard', JSON.stringify([]));
                }
                
                if (!localStorage.getItem('tetrisLeaderboard')) {
                    localStorage.setItem('tetrisLeaderboard', JSON.stringify([]));
                }
                
                // 初始化弹幕游戏排行榜（所有模式共用）
                if (!localStorage.getItem('danmakuLeaderboard')) {
                    localStorage.setItem('danmakuLeaderboard', JSON.stringify([]));
                }
                
                // 初始化2048游戏排行榜
                if (!localStorage.getItem('twentyFortyEightLeaderboard')) {
                    localStorage.setItem('twentyFortyEightLeaderboard', JSON.stringify([]));
                }
                
                // 设置玩家名字输入框的默认值
                const playerNameInput = document.getElementById('playerNameInput');
                if (playerNameInput) {
                    playerNameInput.value = this.playerName;
                    playerNameInput.addEventListener('input', (e) => {
                        this.playerName = e.target.value || '玩家';
                        localStorage.setItem('playerName', this.playerName);
                    });
                }
                
                // 加载排行榜数据
                this.loadLeaderboard('snake');
                this.loadLeaderboard('tetris');
                this.loadLeaderboard('danmaku');
                this.loadAllLeaderboard();
                
                // 删除所有多余的模式切换按钮，只保留旧版danmaku排行榜上的
                const allModeTabs = document.querySelectorAll('.game-mode-tabs');
                allModeTabs.forEach(tab => {
                    if (tab.id !== 'danmakuModeTabs') {
                        tab.remove();
                    }
                });
            }
            
            // 绑定排行榜事件
            bindLeaderboardEvents() {
                // 打开排行榜按钮
                const openBtn = document.getElementById('openLeaderboardBtn');
                if (openBtn) {
                    openBtn.addEventListener('click', () => {
                        this.openLeaderboard();
                    });
                }
                
                // 关闭排行榜按钮
                const closeBtn = document.getElementById('closeLeaderboard');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.closeLeaderboard();
                    });
                }
                
                // 标签页切换
                const tabs = document.querySelectorAll('.leaderboard-tab');
                tabs.forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        const game = e.target.getAttribute('data-game');
                        this.switchTab(game);
                    });
                });
                
                // 保存得分按钮
                const saveBtn = document.getElementById('saveScoreBtn');
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        this.saveCurrentScore();
                    });
                }
                
                // 导出排行榜按钮
                const exportBtn = document.getElementById('exportLeaderboardBtn');
                if (exportBtn) {
                    exportBtn.addEventListener('click', () => {
                        this.exportLeaderboard();
                    });
                }
            }
            
            // 打开排行榜
            openLeaderboard() {
                const leaderboard = document.getElementById('leaderboardContainer');
                if (leaderboard) {
                    leaderboard.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    
                    // 更新统计数据
                    this.updateStats();
                    
                    // 加载当前游戏排行榜
                    if (this.currentGame) {
                        this.switchTab(this.currentGame);
                    }
                }
            }
            
            // 关闭排行榜
            closeLeaderboard() {
                const leaderboard = document.getElementById('leaderboardContainer');
                if (leaderboard) {
                    leaderboard.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            }
            
            // 切换标签页
            switchTab(game) {
                // 更新标签页状态
                const tabs = document.querySelectorAll('.leaderboard-tab');
                tabs.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.getAttribute('data-game') === game) {
                        tab.classList.add('active');
                    }
                });
                
                // 显示对应的排行榜
                const tables = document.querySelectorAll('.leaderboard-table');
                tables.forEach(table => {
                    table.classList.remove('active');
                    if (table.id === `${game}Leaderboard` || 
                        (game === 'all' && table.id === 'allLeaderboard')) {
                        table.classList.add('active');
                    }
                });
                
                // 删除所有多余的模式切换按钮
                const allModeTabs = document.querySelectorAll('.game-mode-tabs');
                allModeTabs.forEach(tab => {
                    // 只保留旧版danmaku排行榜上的模式切换按钮（如果当前切换到的是旧版danmaku排行榜）
                    if (game !== 'danmaku' || tab.id !== 'danmakuModeTabs') {
                        tab.remove();
                    }
                });
                
                // 加载对应的排行榜数据
                if (game === 'all') {
                    this.loadAllLeaderboard();
                } else {
                    this.loadLeaderboard(game);
                }
            }
            
            // 加载排行榜数据（支持本地和远程 Firestore）
            loadLeaderboard(game, mode = this.currentGameMode) {
                // 保存当前游戏模式
                this.currentGameMode = mode;
                
                // 获取正确的表格ID
                let tableId;
                if (game === 'danmaku') {
                    // 弹幕游戏所有模式共用一个排行榜
                    tableId = game;
                    // 删除任何可能存在的模式切换按钮
                    const existingModeTabs = document.getElementById('danmakuModeTabs');
                    if (existingModeTabs) {
                        existingModeTabs.remove();
                    }
                } else {
                    // 其他游戏
                    tableId = game;
                }
                
                const tableBody = document.getElementById(`${tableId}LeaderboardBody`);
                if (!tableBody) return;
                tableBody.innerHTML = '';

                // 如果启用了 Firebase，则优先从远程加载
                if (firebaseEnabled) {
                    loadLeaderboardRemote(game).then(remoteData => {
                        if (!remoteData || remoteData.length === 0) {
                            tableBody.innerHTML = '<div class="no-records">暂无记录，快来成为第一名吧！</div>';
                            return;
                        }

                        const displayData = remoteData.slice(0, 50);
                        displayData.forEach((record, index) => {
                            const row = document.createElement('div');
                            row.className = `leaderboard-row rank-${index + 1}`;
                            let rowContent = '';

                            if (game === 'snake') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="level-cell">-</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">

                                    </div>
                                `;
                            } else if (game === 'tetris') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="level-cell">${record.level || 1}</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">

                                    </div>
                                `;
                            } else if (game === 'twentyFortyEight') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">

                                    </div>
                                `;
                            } else if (game === 'danmaku' || game === 'danmaku_classic' || game === 'danmaku_endless') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="stage-cell">${record.stage || 1}</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">

                                    </div>
                                `;
                            }
                            row.innerHTML = rowContent;
                            tableBody.appendChild(row);
                        });
                    }).catch(err => {
                        console.error('远程排行榜加载失败，回退到本地：', err);
                        // 回退到本地加载
                        // 获取该游戏所有模式的排行榜键名
                const getLeaderboardKeys = (gameType) => {
                    if (gameType === 'danmaku') {
                        // 弹幕游戏所有模式共用一个排行榜
                        return [`${gameType}Leaderboard`];
                    }
                    return [`${gameType}Leaderboard`];
                };
                        
                        // 获取当前模式的排行榜数据
                        const getLeaderboardKey = (gameType, mode) => {
                            if (gameType.startsWith('danmaku')) {
                                // 所有弹幕游戏模式共用一个排行榜
                                return 'danmakuLeaderboard';
                            }
                            return `${gameType}Leaderboard`;
                        };
                        
                        // 获取当前模式的排行榜数据
                        const key = getLeaderboardKey(game, mode);
                        const allRecords = JSON.parse(localStorage.getItem(key) || '[]');
                        
                        if (allRecords.length === 0) {
                            tableBody.innerHTML = '<div class="no-records">暂无记录，快来成为第一名吧！</div>';
                            return;
                        }
                        
                        // 按得分排序
                        allRecords.sort((a, b) => b.score - a.score);
                        const displayData = allRecords.slice(0, 50);
                        displayData.forEach((record, index) => {
                            const row = document.createElement('div');
                            row.className = `leaderboard-row rank-${index + 1}`;
                            let rowContent = '';
                            if (game === 'snake') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="level-cell">-</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">

                                    </div>
                                `;
                            } else if (game === 'tetris') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="level-cell">${record.level || 1}</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">
        
                                    </div>
                                `;
                            } else if (game === 'danmaku' || game === 'danmaku_classic' || game === 'danmaku_endless') {

                        rowContent = `
                            <div class="rank-cell">${index + 1}</div>
                            <div class="name-cell">
                                <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                ${record.name}
                            </div>
                            <div class="score-cell">${record.score}</div>
                            <div class="stage-cell">${record.stage || 1}</div>
                            <div class="date-cell">${this.formatDate(record.date)}</div>
                            <div class="actions-cell">
                                <button class="action-btn delete" onclick="leaderboardSystem.deleteRecord('${game}', ${index})">删除</button>
                            </div>
                        `;
                    }
                            row.innerHTML = rowContent;
                            tableBody.appendChild(row);
                        });
                    });

                    return;
                }

                // 本地加载逻辑（fallback）
                // 获取当前模式的排行榜键名
                let leaderboardKey;
                if (game.startsWith('danmaku')) {
                    // 所有弹幕游戏模式共用一个排行榜
                    leaderboardKey = 'danmakuLeaderboard';
                } else {
                    // 其他游戏使用默认排行榜
                    leaderboardKey = `${game}Leaderboard`;
                }
                
                const leaderboardData = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
                if (leaderboardData.length === 0) {
                    tableBody.innerHTML = '<div class="no-records">暂无记录，快来成为第一名吧！</div>';
                    return;
                }
                leaderboardData.sort((a, b) => b.score - a.score);
                const displayData = leaderboardData.slice(0, 50);
                displayData.forEach((record, index) => {
                    const row = document.createElement('div');
                    row.className = `leaderboard-row rank-${index + 1}`;
                    let rowContent = '';
                    if (game === 'snake') {
                        rowContent = `
                            <div class="rank-cell">${index + 1}</div>
                            <div class="name-cell">
                                <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                ${record.name}
                            </div>
                            <div class="score-cell">${record.score}</div>
                            <div class="level-cell">-</div>
                            <div class="date-cell">${this.formatDate(record.date)}</div>
                            <div class="actions-cell">
                                <button class="action-btn delete" onclick="leaderboardSystem.deleteRecord('${game}', ${index})">删除</button>
                            </div>
                        `;
                    } else if (game === 'tetris') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="level-cell">${record.level || 1}</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">
                                        <button class="action-btn delete" onclick="leaderboardSystem.deleteRecord('${game}', ${index})">删除</button>
                                    </div>
                                `;
                            } else if (game === 'twentyFortyEight') {
                                rowContent = `
                                    <div class="rank-cell">${index + 1}</div>
                                    <div class="name-cell">
                                        <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                        ${record.name}
                                    </div>
                                    <div class="score-cell">${record.score}</div>
                                    <div class="date-cell">${this.formatDate(record.date)}</div>
                                    <div class="actions-cell">
                                        <button class="action-btn delete" onclick="leaderboardSystem.deleteRecord('${game}', ${index})">删除</button>
                                    </div>
                                `;
                            } else if (game === 'danmaku' || game === 'danmaku_classic' || game === 'danmaku_endless') {
                        rowContent = `
                            <div class="rank-cell">${index + 1}</div>
                            <div class="name-cell">
                                <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                                ${record.name}
                            </div>
                            <div class="score-cell">${record.score}</div>
                            <div class="stage-cell">${record.stage || 1}</div>
                            <div class="date-cell">${this.formatDate(record.date)}</div>
                            <div class="actions-cell">
                                <button class="action-btn delete" onclick="leaderboardSystem.deleteRecord('${game}', ${index})">删除</button>
                            </div>
                        `;
                    }
                    row.innerHTML = rowContent;
                    tableBody.appendChild(row);
                });
            }
            
            // 添加模式切换按钮
            addModeTabs(game) {
                // 弹幕游戏所有模式共用一个排行榜，不再需要模式切换按钮
                if (game === 'danmaku') {
                    // 删除已存在的模式切换按钮（如果有）
                    const existingModeTabs = document.getElementById('danmakuModeTabs');
                    if (existingModeTabs) {
                        existingModeTabs.remove();
                    }
                    return;
                }
                
                // 检查是否已添加模式切换按钮
                let modeTabs = document.getElementById(`${game}ModeTabs`);
                if (modeTabs) {
                    // 更新当前激活的模式
                    const buttons = modeTabs.querySelectorAll('.mode-tab');
                    buttons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.mode === this.currentGameMode) {
                            btn.classList.add('active');
                        }
                    });
                    return;
                }
                
                // 创建模式切换按钮容器
                const table = document.getElementById(`${game}Leaderboard`);
                if (!table) return;
                
                modeTabs = document.createElement('div');
                modeTabs.id = `${game}ModeTabs`;
                modeTabs.className = 'game-mode-tabs';
                modeTabs.innerHTML = `
                    <button class="mode-tab ${this.currentGameMode === 'endless' ? 'active' : ''}" data-mode="endless" onclick="leaderboardSystem.loadLeaderboard('${game}', 'endless')">无尽模式</button>
                    <button class="mode-tab ${this.currentGameMode === 'classic' ? 'active' : ''}" data-mode="classic" onclick="leaderboardSystem.loadLeaderboard('${game}', 'classic')">经典模式</button>
                `;
                
                // 添加样式
                const style = document.createElement('style');
                style.textContent = `
                    .game-mode-tabs {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin: 15px 0;
                        padding: 10px;
                        background-color: rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                    }
                    
                    .mode-tab {
                        padding: 8px 16px;
                        background-color: rgba(74, 144, 226, 0.3);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    }
                    
                    .mode-tab:hover {
                        background-color: rgba(74, 144, 226, 0.5);
                        transform: translateY(-2px);
                    }
                    
                    .mode-tab.active {
                        background-color: rgba(74, 144, 226, 0.8);
                        box-shadow: 0 0 15px rgba(74, 144, 226, 0.5);
                    }
                `;
                document.head.appendChild(style);
                
                // 将模式切换按钮添加到排行榜表格上方
                const tableHeader = table.querySelector('.table-header');
                table.insertBefore(modeTabs, tableHeader);
            }
            
            loadAllLeaderboard() {
                const games = ['snake', 'tetris', 'danmaku', 'twentyFortyEight'];
                let allRecords = [];
                
                games.forEach(game => {
                    // 获取该游戏所有模式的排行榜键名
                    const getLeaderboardKeys = (gameType) => {
                        if (gameType === 'danmaku') {
                            // 弹幕游戏所有模式共用一个排行榜
                            return [`${gameType}Leaderboard`];
                        }
                        return [`${gameType}Leaderboard`];
                    };
                    
                    // 加载所有模式的数据
                    const keys = getLeaderboardKeys(game);
                    keys.forEach(key => {
                        const gameRecords = JSON.parse(localStorage.getItem(key) || '[]');
                        gameRecords.forEach(record => {
                            record.game = game === 'snake' ? '贪吃蛇' : 
                                     game === 'tetris' ? '俄罗斯方块' : 
                                     game === 'danmaku' ? '弹幕射击' : '2048';
                            record.gameType = game;
                        });
                        allRecords = allRecords.concat(gameRecords);
                    });
                });
                
                // 按得分排序
                allRecords.sort((a, b) => b.score - a.score);
                
                const tableBody = document.getElementById('allLeaderboardBody');
                if (!tableBody) return;
                
                // 清空现有内容
                tableBody.innerHTML = '';
                
                if (allRecords.length === 0) {
                    tableBody.innerHTML = '<div class="no-records">暂无记录，快来成为第一名吧！</div>';
                    return;
                }
                
                // 显示前50条记录
                const displayData = allRecords.slice(0, 50);
                
                displayData.forEach((record, index) => {
                    const row = document.createElement('div');
                    row.className = `leaderboard-row rank-${index + 1}`;
                    
                    row.innerHTML = `
                        <div class="rank-cell">${index + 1}</div>
                        <div class="name-cell">
                            <div class="player-avatar">${record.name.charAt(0).toUpperCase()}</div>
                            ${record.name}
                        </div>
                        <div class="game-cell">${record.game}</div>
                        <div class="score-cell">${record.score}</div>
                        <div class="date-cell">${this.formatDate(record.date)}</div>
                        <div class="actions-cell">

                        </div>
                    `;
                    
                    tableBody.appendChild(row);
                });
            }
            
            // 查找记录索引
            findRecordIndex(game, recordId) {
                // 获取该游戏所有模式的排行榜键名
                const getLeaderboardKeys = (gameType) => {
                    if (gameType === 'danmaku') {
                        // 弹幕游戏有经典模式和无尽模式
                        return [
                            `${gameType}Leaderboard_classic`,
                            `${gameType}Leaderboard_endless`,
                            `${gameType}Leaderboard` // 兼容旧版数据
                        ];
                    }
                    return [`${gameType}Leaderboard`];
                };
                
                // 遍历所有模式的排行榜
                const keys = getLeaderboardKeys(game);
                for (const key of keys) {
                    const records = JSON.parse(localStorage.getItem(key) || '[]');
                    const index = records.findIndex(record => record.id === recordId);
                    if (index !== -1) {
                        return index;
                    }
                }
                return -1;
            }
            
            // 保存当前得分（保存到本地并尝试同步到远程 Firestore）
            saveCurrentScore() {
                if (!this.currentGame || this.currentScore === 0) {
                    alert('请先完成一局游戏获得得分！');
                    return;
                }

                const playerName = document.getElementById('playerNameInput').value || '玩家';
                if (!playerName.trim()) {
                    alert('请输入玩家名称！');
                    return;
                }

                // 更新本地存储的玩家名称
                this.playerName = playerName;
                localStorage.setItem('playerName', playerName);

                // 创建记录
                const record = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name: playerName,
                    score: this.currentScore,
                    date: new Date().toISOString(),
                    mode: this.currentGameMode // 添加游戏模式
                };

                // 添加游戏特定数据
                if (this.currentGame === 'tetris') {
                    record.level = this.currentLevel;
                } else if (this.currentGame === 'danmaku') {
                    record.stage = this.currentStage;
                }
                // 2048游戏没有特定数据，使用默认即可

                // 获取排行榜键名
                let leaderboardKey;
                if (this.currentGame === 'danmaku') {
                    // 弹幕游戏所有模式共用一个排行榜
                    leaderboardKey = `${this.currentGame}Leaderboard`;
                } else {
                    // 其他游戏（包括2048）使用默认排行榜
                    leaderboardKey = `${this.currentGame}Leaderboard`;
                }

                // 获取现有排行榜数据
                const leaderboardData = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');

                // 添加新记录并保存到本地
                leaderboardData.push(record);
                localStorage.setItem(leaderboardKey, JSON.stringify(leaderboardData));

                // 重新加载排行榜与统计
                this.loadLeaderboard(this.currentGame);
                this.loadAllLeaderboard();
                this.updateStats();

                // 尝试同步到远程（如果已配置 Firebase）
                if (firebaseEnabled) {
                    saveScoreRemote(this.currentGame, record).then(ok => {
                        if (ok) {
                            console.log('远程排行榜保存成功');
                            // 可选择提示用户或刷新远程排行榜
                        } else {
                            console.warn('远程排行榜保存失败，保留本地记录');
                        }
                    });
                }

                // 显示成功消息并检查名次
                alert(`得分 ${this.currentScore} 已保存到排行榜！`);
                this.checkTopThree(leaderboardData, record);
            }
            
            // 检查是否进入前三名
            checkTopThree(leaderboardData, newRecord) {
                // 按得分排序
                const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);
                
                // 找到新记录的排名
                const rank = sortedData.findIndex(record => record.id === newRecord.id) + 1;
                
                if (rank <= 3) {
                    // 创建庆祝特效
                    this.createCelebrationEffect(rank);
                    
                    // 播放音效
                    this.playRankSound(rank);
                }
            }
            
            // 创建庆祝特效
            createCelebrationEffect(rank) {
                const colors = {
                    1: '#ffcc00', // 金牌
                    2: '#c0c0c0', // 银牌
                    3: '#cd7f32'  // 铜牌
                };
                
                const messages = {
                    1: '🎉 恭喜获得第一名！ 🎉',
                    2: '🥈 恭喜获得第二名！ 🥈',
                    3: '🥉 恭喜获得第三名！ 🥉'
                };
                
                // 创建庆祝消息
                const message = document.createElement('div');
                message.style.position = 'fixed';
                message.style.top = '50%';
                message.style.left = '50%';
                message.style.transform = 'translate(-50%, -50%)';
                message.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                message.style.color = colors[rank];
                message.style.padding = '30px 50px';
                message.style.borderRadius = '15px';
                message.style.fontSize = '2.5rem';
                message.style.fontWeight = 'bold';
                message.style.textAlign = 'center';
                message.style.zIndex = '2000';
                message.style.border = `4px solid ${colors[rank]}`;
                message.style.boxShadow = `0 0 30px ${colors[rank]}`;
                message.textContent = messages[rank];
                
                document.body.appendChild(message);
                
                // 创建粒子特效
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => {
                        const particle = document.createElement('div');
                        particle.style.position = 'fixed';
                        particle.style.width = '10px';
                        particle.style.height = '10px';
                        particle.style.backgroundColor = colors[rank];
                        particle.style.borderRadius = '50%';
                        particle.style.left = `${Math.random() * 100}%`;
                        particle.style.top = `${Math.random() * 100}%`;
                        particle.style.boxShadow = `0 0 15px ${colors[rank]}`;
                        particle.style.zIndex = '1999';
                        particle.style.animation = `explode ${Math.random() * 1 + 1}s forwards`;
                        
                        document.body.appendChild(particle);
                        
                        setTimeout(() => {
                            particle.remove();
                        }, 1500);
                    }, i * 50);
                }
                
                // 3秒后移除消息
                setTimeout(() => {
                    message.remove();
                }, 3000);
            }
            
            // 播放排名音效
            playRankSound(rank) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const masterGain = audioContext.createGain();
                masterGain.gain.value = 0.3;
                masterGain.connect(audioContext.destination);
                
                // 根据排名播放不同的音效
                const frequencies = {
                    1: [659.25, 830.61, 987.77, 1318.51], // 高音胜利旋律
                    2: [523.25, 659.25, 783.99], // 中音旋律
                    3: [392.00, 493.88, 587.33]  // 低音旋律
                };
                
                const freqArray = frequencies[rank];
                
                freqArray.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        oscillator.type = 'sine';
                        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                        
                        const gainNode = audioContext.createGain();
                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(masterGain);
                        
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.6);
                    }, index * 200);
                });
            }
            
            // 删除记录
            deleteRecord(game, index) {
                if (!confirm('确定要删除这条记录吗？')) {
                    return;
                }
                
                // 获取该游戏所有模式的排行榜键名
                const getLeaderboardKeys = (gameType) => {
                    if (gameType.startsWith('danmaku')) {
                        // 所有弹幕游戏模式共用一个排行榜
                        return ['danmakuLeaderboard'];
                    }
                    return [`${gameType}Leaderboard`];
                };
                
                let recordDeleted = false;
                const keys = getLeaderboardKeys(game);
                
                // 遍历所有模式的排行榜，查找并删除记录
                keys.forEach(key => {
                    const leaderboardData = JSON.parse(localStorage.getItem(key) || '[]');
                    
                    if (index < leaderboardData.length) {
                        // 找到了要删除的记录
                        leaderboardData.splice(index, 1);
                        localStorage.setItem(key, JSON.stringify(leaderboardData));
                        recordDeleted = true;
                    } else {
                        // 调整索引，继续在其他模式中查找
                        index -= leaderboardData.length;
                    }
                });
                
                if (recordDeleted) {
                    // 重新加载排行榜
                    this.loadLeaderboard(game);
                    this.loadAllLeaderboard();
                    
                    // 更新统计数据
                    this.updateStats();
                    
                    alert('记录已删除！');
                } else {
                    alert('未找到要删除的记录！');
                }
            }
            
            // 清空所有排行榜
            clearAllLeaderboards() {
                localStorage.setItem('snakeLeaderboard', JSON.stringify([]));
                localStorage.setItem('tetrisLeaderboard', JSON.stringify([]));
                localStorage.setItem('danmakuLeaderboard', JSON.stringify([]));
                localStorage.setItem('twentyFortyEightLeaderboard', JSON.stringify([]));
                
                // 重新加载所有排行榜
                this.loadLeaderboard('snake');
                this.loadLeaderboard('tetris');
                this.loadLeaderboard('danmaku');
                this.loadLeaderboard('twentyFortyEight');
                this.loadAllLeaderboard();
                
                // 更新统计数据
                this.updateStats();
                
                alert('所有排行榜数据已清空！');
            }
            
            // 导出排行榜
            exportLeaderboard() {
                const data = {
                    snake: JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]'),
                    tetris: JSON.parse(localStorage.getItem('tetrisLeaderboard') || '[]'),
                    danmaku: JSON.parse(localStorage.getItem('danmakuLeaderboard') || '[]'),
                    twentyFortyEight: JSON.parse(localStorage.getItem('twentyFortyEightLeaderboard') || '[]'),
                    exportDate: new Date().toISOString(),
                    version: '1.0'
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `游戏排行榜_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                alert('排行榜数据已导出！');
            }
            
            // 导入排行榜
            importLeaderboard(file) {
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        // 验证数据格式
                        if (data.snake && data.tetris) {
                            if (confirm('导入排行榜数据将覆盖现有数据，确定要继续吗？')) {
                                localStorage.setItem('snakeLeaderboard', JSON.stringify(data.snake));
                                localStorage.setItem('tetrisLeaderboard', JSON.stringify(data.tetris));
                                
                                // 导入弹幕游戏数据（所有模式共用）
                                if (data.danmaku) {
                                    localStorage.setItem('danmakuLeaderboard', JSON.stringify(data.danmaku));
                                }
                                
                                // 导入2048游戏数据
                                if (data.twentyFortyEight) {
                                    localStorage.setItem('twentyFortyEightLeaderboard', JSON.stringify(data.twentyFortyEight));
                                }
                                
                                // 重新加载排行榜
                                this.loadLeaderboard('snake');
                                this.loadLeaderboard('tetris');
                                this.loadLeaderboard('danmaku');
                                this.loadLeaderboard('twentyFortyEight');
                                this.loadAllLeaderboard();
                                
                                // 更新统计数据
                                this.updateStats();
                                
                                alert('排行榜数据导入成功！');
                            }
                        } else {
                            alert('文件格式不正确！');
                        }
                    } catch (error) {
                        alert('文件读取失败，请检查文件格式！');
                    }
                };
                reader.readAsText(file);
                
                // 清空文件输入
                document.getElementById('importFileInput').value = '';
            }
            
            // 更新统计数据
            updateStats() {
                const games = ['snake', 'tetris', 'danmaku'];
                let totalRecords = 0;
                let todayRecords = 0;
                let highestScore = 0;
                const today = new Date().toDateString();
                
                games.forEach(game => {
                    // 获取该游戏所有模式的排行榜键名
                    const getLeaderboardKeys = (gameType) => {
                        if (gameType === 'danmaku') {
                            // 弹幕游戏有经典模式和无尽模式
                            return [
                                `${gameType}Leaderboard_classic`,
                                `${gameType}Leaderboard_endless`,
                                `${gameType}Leaderboard` // 兼容旧版数据
                            ];
                        }
                        return [`${gameType}Leaderboard`];
                    };
                    
                    // 遍历所有模式的排行榜
                    const keys = getLeaderboardKeys(game);
                    keys.forEach(key => {
                        const records = JSON.parse(localStorage.getItem(key) || '[]');
                        totalRecords += records.length;
                        
                        records.forEach(record => {
                            if (new Date(record.date).toDateString() === today) {
                                todayRecords++;
                            }
                            
                            if (record.score > highestScore) {
                                highestScore = record.score;
                            }
                        });
                    });
                });
                
                // 更新显示
                const totalElem = document.getElementById('totalRecords');
                const todayElem = document.getElementById('todayRecords');
                const highestElem = document.getElementById('highestScore');
                
                if (totalElem) totalElem.textContent = totalRecords;
                if (todayElem) todayElem.textContent = todayRecords;
                if (highestElem) highestElem.textContent = highestScore;
            }
            
            // 格式化日期
            formatDate(dateString) {
                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 1) {
                    return '刚刚';
                } else if (diffMins < 60) {
                    return `${diffMins}分钟前`;
                } else if (diffHours < 24) {
                    return `${diffHours}小时前`;
                } else if (diffDays < 7) {
                    return `${diffDays}天前`;
                } else {
                    return date.toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric'
                    });
                }
            }
            
            // 设置当前游戏得分
            setCurrentScore(game, score, level = 1, stage = 1, mode = 'endless') {
                this.currentGame = game;
                this.currentScore = score;
                this.currentLevel = level;
                this.currentStage = stage;
                this.currentGameMode = mode; // 保存游戏模式
            }
        }
        
        // 创建排行榜系统实例
        let leaderboardSystem;
        
        // 初始化排行榜系统
        function initLeaderboardSystem() {
            leaderboardSystem = new LeaderboardSystem();
            
            // 在游戏结束时触发事件
            function triggerGameOver(game, score, level, stage) {
                const event = new CustomEvent('gameOver', {
                    detail: { game, score, level, stage }
                });
                document.dispatchEvent(event);
            }
            
            // 修改游戏结束处理函数
            const originalCreateGameOverEffect = window.createGameOverEffect;
            let lastGameOverCall = 0; // 记录上次调用时间，防止重复提示
            window.createGameOverEffect = function(gameType, score) {
                // 防止短时间内重复调用，避免多次弹出保存提示
                const now = Date.now();
                if (now - lastGameOverCall < 2000) {
                    return;
                }
                lastGameOverCall = now;
                // 调用原始函数
                if (originalCreateGameOverEffect) {
                    originalCreateGameOverEffect(gameType, score);
                }
                
                // 触发游戏结束事件
                let level = 1;
                let stage = 1;
                
                if (gameType === 'tetris' && window.tetrisGame) {
                    level = window.tetrisGame.level || 1;
                } else if (gameType === 'danmaku' && window.danmakuGame) {
                    stage = window.danmakuGame.stage || 1;
                }
                
                // 设置当前得分，包含游戏模式
                if (leaderboardSystem) {
                    // 获取游戏模式
                    let gameMode = 'endless'; // 默认无尽模式
                    if (gameType === 'danmaku' && window.danmakuGame) {
                        gameMode = window.danmakuGame.gameMode || 'endless';
                    }
                    leaderboardSystem.setCurrentScore(gameType, score, level, stage, gameMode);
                }
                
                // 显示保存提示
                setTimeout(() => {
                    if (confirm(`游戏结束！得分: ${score}\n是否保存到排行榜？`)) {
                        if (leaderboardSystem) {
                            // 直接保存当前得分
                            leaderboardSystem.saveCurrentScore();
                            // 然后打开排行榜
                            leaderboardSystem.openLeaderboard();
                            // 自动切换到当前游戏标签页
                            leaderboardSystem.switchTab(gameType);
                        }
                    }
                }, 1000);
            };
        }
        
        // 页面加载完成后初始化
        window.addEventListener('DOMContentLoaded', () => {
            // 初始化视觉效果
            createStars();
            createFloatingParticles();
            
            // 添加测试通关记录（用于验证功能）
            const testRecord = {
                id: 'test-' + Date.now(),
                name: '测试玩家',
                score: 9999,
                date: new Date().toISOString(),
                mode: 'classic',
                completed: true,
                stage: 10
            };
            const leaderboardKey = 'danmakuLeaderboard';
            const leaderboardData = JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
            // 检查是否已有测试记录
            const hasTestRecord = leaderboardData.some(record => record.id.startsWith('test-'));
            if (!hasTestRecord) {
                leaderboardData.push(testRecord);
                localStorage.setItem(leaderboardKey, JSON.stringify(leaderboardData));
            }
            
            // 初始化游戏实例
            let snakeGame, tetrisGame, danmakuGame;
            
            // 初始化排行榜系统
            initLeaderboardSystem();
            
            // 初始化完成后，删除所有多余的模式切换按钮
            setTimeout(() => {
                const allModeTabs = document.querySelectorAll('.game-mode-tabs');
                allModeTabs.forEach(tab => {
                    // 只保留旧版danmaku排行榜上的模式切换按钮
                    if (tab.id !== 'danmakuModeTabs') {
                        tab.remove();
                    }
                });
            }, 500);
            
            // 动态缩放游戏容器内容
            function resizeGameContainer(container) {
                if (!container) return;
                
                // 获取容器可用尺寸
                const availableWidth = window.innerWidth - 40; // 减去左右padding
                const availableHeight = window.innerHeight - 40; // 减去上下padding
                
                // 找到画布容器
                const canvasContainer = container.querySelector('.game-canvas-container');
                if (!canvasContainer) return;
                
                // 获取原始画布尺寸
                const canvas = canvasContainer.querySelector('.game-canvas');
                if (!canvas) return;
                
                const originalWidth = canvas.width;
                const originalHeight = canvas.height;
                
                // 确保控制按钮可见
                const header = container.querySelector('.game-header');
                const controls = container.querySelector('.game-controls');
                const infoPanel = container.querySelector('.game-info');
                
                // 确保所有元素可见
                if (header) {
                    header.style.display = 'block';
                    header.style.width = '100%';
                    header.style.textAlign = 'center';
                    header.style.marginBottom = '10px';
                }
                
                if (controls) {
                    controls.style.display = 'flex';
                    controls.style.flexDirection = 'column';
                    controls.style.alignItems = 'center';
                    controls.style.justifyContent = 'center';
                    controls.style.width = '100%';
                    controls.style.marginTop = '10px';
                    controls.style.zIndex = '1001';
                }
                
                if (canvasContainer) {
                    canvasContainer.style.display = 'block';
                    canvasContainer.style.margin = '0 auto';
                    canvasContainer.style.zIndex = '1000';
                }
                
                if (infoPanel) {
                    infoPanel.style.display = 'block';
                    infoPanel.style.width = '100%';
                    infoPanel.style.textAlign = 'center';
                    infoPanel.style.marginTop = '10px';
                }
                
                // 特殊处理弹幕游戏的模式选择界面
                const modeSelect = container.querySelector('#danmakuGameModeSelect');
                if (modeSelect) {
                    modeSelect.style.display = modeSelect.style.display || 'block';
                    modeSelect.style.position = 'relative';
                    modeSelect.style.zIndex = '1001';
                    modeSelect.style.margin = '20px auto';
                }
                
                // 确保关闭按钮可见
                const closeBtn = container.querySelector('[id^="close"]');
                if (closeBtn) {
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.top = '10px';
                    closeBtn.style.right = '10px';
                    closeBtn.style.zIndex = '1004';
                    closeBtn.style.cursor = 'pointer';
                }
                
                // 确保控制说明可见
                const controlInstructions = container.querySelector('.control-instructions');
                if (controlInstructions) {
                    controlInstructions.style.display = 'block';
                    controlInstructions.style.width = '100%';
                    controlInstructions.style.marginTop = '15px';
                    controlInstructions.style.textAlign = 'center';
                    controlInstructions.style.zIndex = '1001';
                }
                
                // 确保游戏说明可见
                const gameInstructions = container.querySelector('.game-instructions');
                if (gameInstructions) {
                    gameInstructions.style.display = 'block';
                    gameInstructions.style.width = '100%';
                    gameInstructions.style.marginTop = '15px';
                    gameInstructions.style.textAlign = 'center';
                    gameInstructions.style.zIndex = '1001';
                }
                
                // 特殊处理弹幕游戏的BOSS血条
                const bossHealthBar = container.querySelector('.boss-health-bar');
                if (bossHealthBar) {
                    // 默认隐藏BOSS血条，只在BOSS出现时显示
                    bossHealthBar.style.display = 'none';
                    bossHealthBar.style.position = 'absolute';
                    bossHealthBar.style.top = '10px';
                    bossHealthBar.style.left = '50%';
                    bossHealthBar.style.transform = 'translateX(-50%)';
                    bossHealthBar.style.zIndex = '1001';
                }
                
                // 特殊处理任务完成和关卡完成界面
                // 这些元素的详细样式设置将在后面的canvas容器处理中完成
                
                // 计算所有非画布元素的总高度
                let nonCanvasHeight = 0;
                if (header) {
                    nonCanvasHeight += header.offsetHeight + 10; // 标题高度 + 间距
                }
                if (controls) {
                    nonCanvasHeight += controls.offsetHeight + 10; // 控制按钮高度 + 间距
                }
                if (infoPanel) {
                    nonCanvasHeight += infoPanel.offsetHeight + 10; // 信息面板高度 + 间距
                }
                
                // 计算画布可用高度
                let canvasAvailableHeight = availableHeight - nonCanvasHeight;
                canvasAvailableHeight = Math.max(canvasAvailableHeight, 300); // 确保至少有300px可用高度
                
                // 确保画布容器有合适的最大尺寸
                canvasContainer.style.maxWidth = '100%';
                canvasContainer.style.maxHeight = `${canvasAvailableHeight}px`;
                canvasContainer.style.margin = '0 auto';
                
                // 计算缩放比例，确保完全适配
                const scaleX = availableWidth / originalWidth;
                const scaleY = canvasAvailableHeight / originalHeight;
                const scale = Math.min(scaleX, scaleY, 1); // 最大缩放比例为1，不放大
                
                // 应用缩放变换
                canvas.style.transform = `scale(${scale})`;
                canvas.style.transformOrigin = 'top center';
                canvas.style.maxWidth = `${originalWidth}px`;
                canvas.style.maxHeight = `${originalHeight}px`;
                canvas.style.width = '100%';
                canvas.style.height = 'auto';
                canvas.style.display = 'block';
                canvas.style.margin = '0 auto';
                
                // 确保画布容器有合适的高度
                canvasContainer.style.height = `${originalHeight * scale}px`;
                canvasContainer.style.width = `${originalWidth * scale}px`;
                canvasContainer.style.position = 'relative';
                
                // 确保通关提示元素不受画布缩放影响
                const missionComplete = canvasContainer.querySelector('.mission-complete');
                if (missionComplete) {
                    missionComplete.style.position = 'absolute';
                    missionComplete.style.top = '50%';
                    missionComplete.style.left = '50%';
                    missionComplete.style.transform = 'translate(-50%, -50%)';
                    missionComplete.style.zIndex = '200';
                    missionComplete.style.width = 'auto';
                    missionComplete.style.height = 'auto';
                }
                
                const allLevelsComplete = canvasContainer.querySelector('.all-levels-complete');
                if (allLevelsComplete) {
                    allLevelsComplete.style.position = 'absolute';
                    allLevelsComplete.style.top = '50%';
                    allLevelsComplete.style.left = '50%';
                    allLevelsComplete.style.transform = 'translate(-50%, -50%)';
                    allLevelsComplete.style.zIndex = '200';
                    allLevelsComplete.style.width = 'auto';
                    allLevelsComplete.style.height = 'auto';
                }
                
                // 确保整个容器使用合适的布局
                container.style.justifyContent = 'flex-start';
                container.style.alignItems = 'center';
                container.style.padding = '20px';
                container.style.overflow = 'visible';
                container.style.height = '100vh';
                container.style.width = '100vw';
                container.style.position = 'fixed';
                container.style.top = '0';
                container.style.left = '0';
                container.style.zIndex = '1000';
            }
            
            // 监听窗口大小变化，动态调整游戏容器
            function addResizeListener(containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    window.addEventListener('resize', () => {
                        if (container.style.display === 'flex') {
                            resizeGameContainer(container);
                        }
                    });
                }
            }
            
            // 添加所有游戏容器的 resize 监听
            addResizeListener('snakeGameContainer');
            addResizeListener('tetrisGameContainer');
            addResizeListener('danmakuGameContainer');
            
            // 游戏按钮事件处理
            document.getElementById('snakeGameBtn').addEventListener('click', () => {
                const container = document.getElementById('snakeGameContainer');
                container.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                if (!snakeGame) {
                    snakeGame = new SnakeGame();
                }
                
                snakeGame.restart();
                snakeGame.start();
                currentGame = snakeGame;
                enableGameKeyListeners('snake');
                
                // 延迟调用，确保容器已显示
                setTimeout(() => resizeGameContainer(container), 100);
            });
            
            document.getElementById('tetrisGameBtn').addEventListener('click', () => {
                const container = document.getElementById('tetrisGameContainer');
                container.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                if (!tetrisGame) {
                    tetrisGame = new TetrisGame();
                }
                
                tetrisGame.restart();
                tetrisGame.start();
                currentGame = tetrisGame;
                enableGameKeyListeners('tetris');
                
                // 延迟调用，确保容器已显示
                setTimeout(() => resizeGameContainer(container), 100);
            });
            
            // 弹幕射击经典模式按钮事件
            document.getElementById('danmakuClassicGameBtn').addEventListener('click', () => {
                const container = document.getElementById('danmakuGameContainer');
                container.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // 直接显示游戏画布
                document.getElementById('danmakuGameModeSelect').style.display = 'none';
                document.getElementById('danmakuGameCanvasContainer').style.display = 'block';
                
                if (!danmakuGame) {
                    danmakuGame = new DanmakuGame();
                }
                
                danmakuGame.gameMode = 'classic';
                danmakuGame.restart();
                danmakuGame.start();
                currentGame = danmakuGame;
                enableGameKeyListeners('danmaku');
                
                // 延迟调用，确保画布已显示
                setTimeout(() => resizeGameContainer(container), 100);
            });
            
            // 弹幕射击无尽模式按钮事件
            document.getElementById('danmakuEndlessGameBtn').addEventListener('click', () => {
                const container = document.getElementById('danmakuGameContainer');
                container.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // 直接显示游戏画布
                document.getElementById('danmakuGameModeSelect').style.display = 'none';
                document.getElementById('danmakuGameCanvasContainer').style.display = 'block';
                
                if (!danmakuGame) {
                    danmakuGame = new DanmakuGame();
                }
                
                danmakuGame.gameMode = 'endless';
                danmakuGame.restart();
                danmakuGame.start();
                currentGame = danmakuGame;
                enableGameKeyListeners('danmaku');
                
                // 延迟调用，确保画布已显示
                setTimeout(() => resizeGameContainer(container), 100);
            });
            
            // 开始弹幕游戏函数
            function startDanmakuGame(mode) {
                // 隐藏游戏模式选择界面，显示游戏画布
                document.getElementById('danmakuGameModeSelect').style.display = 'none';
                document.getElementById('danmakuGameCanvasContainer').style.display = 'block';
                
                if (!danmakuGame) {
                    danmakuGame = new DanmakuGame();
                }
                
                danmakuGame.gameMode = mode;
                danmakuGame.restart();
                danmakuGame.start();
                currentGame = danmakuGame;
                enableGameKeyListeners('danmaku');
                
                // 延迟调用，确保画布已显示
                const container = document.getElementById('danmakuGameContainer');
                setTimeout(() => resizeGameContainer(container), 100);
            }
            
            // 关闭游戏按钮事件
            document.getElementById('closeSnakeGame').addEventListener('click', () => {
                document.getElementById('snakeGameContainer').style.display = 'none';
                document.body.style.overflow = 'auto';
                if (snakeGame) {
                    snakeGame.stop();
                }
                currentGame = null;
                activeKeyListeners.clear();
            });
            
            document.getElementById('closeTetrisGame').addEventListener('click', () => {
                document.getElementById('tetrisGameContainer').style.display = 'none';
                document.body.style.overflow = 'auto';
                if (tetrisGame) {
                    tetrisGame.stop();
                }
                currentGame = null;
                activeKeyListeners.clear();
            });
            
            document.getElementById('closeDanmakuGame').addEventListener('click', () => {
                document.getElementById('danmakuGameContainer').style.display = 'none';
                document.body.style.overflow = 'auto';
                if (danmakuGame) {
                    danmakuGame.stop();
                }
                currentGame = null;
                activeKeyListeners.clear();
            });
            
            // 添加ESC键退出游戏
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const snakeContainer = document.getElementById('snakeGameContainer');
                    const tetrisContainer = document.getElementById('tetrisGameContainer');
                    const danmakuContainer = document.getElementById('danmakuGameContainer');
                    
                    if (snakeContainer.style.display === 'flex') {
                        document.getElementById('closeSnakeGame').click();
                    } else if (tetrisContainer.style.display === 'flex') {
                        document.getElementById('closeTetrisGame').click();
                    } else if (danmakuContainer.style.display === 'flex') {
                        document.getElementById('closeDanmakuGame').click();
                    }
                    }
            });
        });
    

        // 2048游戏实现
        class TwentyFortyEightGame {
            constructor() {
                this.board = [];
                this.score = 0;
                this.best = parseInt(localStorage.getItem('2048Best')) || 0;
                this.history = [];
                this.isGameOver = false;
                this.isGameWon = false;
                
                this.init();
            }

            init() {
                // 初始化棋盘
                this.board = Array(4).fill().map(() => Array(4).fill(0));
                this.score = 0;
                this.history = [];
                this.isGameOver = false;
                this.isGameWon = false;
                
                // 添加两个初始方块
                this.addRandomTile();
                this.addRandomTile();
                
                // 更新显示
                this.updateDisplay();
            }

            addRandomTile() {
                // 找到所有空白格子
                const emptyCells = [];
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (this.board[i][j] === 0) {
                            emptyCells.push({ x: i, y: j });
                        }
                    }
                }

                if (emptyCells.length > 0) {
                    // 随机选择一个空白格子
                    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    // 90%概率生成2，10%概率生成4
                    this.board[x][y] = Math.random() < 0.9 ? 2 : 4;
                }
            }

            move(direction) {
                if (this.isGameOver || this.isGameWon) return false;
                
                // 保存当前状态到历史记录
                this.saveState();
                
                let moved = false;
                
                switch (direction) {
                    case 'up':
                        moved = this.moveUp();
                        break;
                    case 'down':
                        moved = this.moveDown();
                        break;
                    case 'left':
                        moved = this.moveLeft();
                        break;
                    case 'right':
                        moved = this.moveRight();
                        break;
                }
                
                if (moved) {
                    // 添加新方块
                    this.addRandomTile();
                    // 更新显示
                    this.updateDisplay();
                    // 检查游戏结束
                    this.checkGameOver();
                    // 检查游戏胜利
                    this.checkGameWon();
                }
                
                return moved;
            }

            moveLeft() {
                let moved = false;
                
                for (let i = 0; i < 4; i++) {
                    const row = this.board[i];
                    const newRow = this.mergeRow(row);
                    
                    if (!this.arraysEqual(row, newRow)) {
                        this.board[i] = newRow;
                        moved = true;
                    }
                }
                
                return moved;
            }

            moveRight() {
                let moved = false;
                
                for (let i = 0; i < 4; i++) {
                    const row = this.board[i].reverse();
                    const newRow = this.mergeRow(row).reverse();
                    row.reverse(); // 恢复原数组
                    
                    if (!this.arraysEqual(this.board[i], newRow)) {
                        this.board[i] = newRow;
                        moved = true;
                    }
                }
                
                return moved;
            }

            moveUp() {
                let moved = false;
                
                for (let j = 0; j < 4; j++) {
                    // 提取列
                    const column = [];
                    for (let i = 0; i < 4; i++) {
                        column.push(this.board[i][j]);
                    }
                    
                    const newColumn = this.mergeRow(column);
                    
                    if (!this.arraysEqual(column, newColumn)) {
                        // 放回列
                        for (let i = 0; i < 4; i++) {
                            this.board[i][j] = newColumn[i];
                        }
                        moved = true;
                    }
                }
                
                return moved;
            }

            moveDown() {
                let moved = false;
                
                for (let j = 0; j < 4; j++) {
                    // 提取列
                    const column = [];
                    for (let i = 0; i < 4; i++) {
                        column.push(this.board[i][j]);
                    }
                    
                    const reversedColumn = column.reverse();
                    const newReversedColumn = this.mergeRow(reversedColumn);
                    const newColumn = newReversedColumn.reverse();
                    
                    if (!this.arraysEqual(column, newColumn)) {
                        // 放回列
                        for (let i = 0; i < 4; i++) {
                            this.board[i][j] = newColumn[i];
                        }
                        moved = true;
                    }
                }
                
                return moved;
            }

            mergeRow(row) {
                // 移除空格
                const filtered = row.filter(cell => cell !== 0);
                
                // 合并相同数字
                for (let i = 0; i < filtered.length - 1; i++) {
                    if (filtered[i] === filtered[i + 1]) {
                        filtered[i] *= 2;
                        this.score += filtered[i];
                        filtered.splice(i + 1, 1);
                        // 合并后，i保持不变，以便检查新合并的数字是否还能与后面的数字合并
                        i--;
                    }
                }
                
                // 补零
                while (filtered.length < 4) {
                    filtered.push(0);
                }
                
                return filtered;
            }

            arraysEqual(a, b) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) return false;
                }
                return true;
            }

            saveState() {
                this.history.push({
                    board: this.board.map(row => [...row]),
                    score: this.score
                });
                
                // 限制历史记录长度
                if (this.history.length > 10) {
                    this.history.shift();
                }
            }

            undo() {
                if (this.history.length > 0) {
                    const state = this.history.pop();
                    this.board = state.board.map(row => [...row]);
                    this.score = state.score;
                    this.isGameOver = false;
                    this.isGameWon = false;
                    this.updateDisplay();
                }
            }

            checkGameWon() {
                if (this.isGameWon) return;
                
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (this.board[i][j] === 2048) {
                            this.isGameWon = true;
                            this.showGameWon();
                            return;
                        }
                    }
                }
            }

            checkGameOver() {
                if (this.isGameOver) return;
                
                // 检查是否还有空白格子
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        if (this.board[i][j] === 0) {
                            return;
                        }
                    }
                }
                
                // 检查是否还能合并
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        const current = this.board[i][j];
                        
                        // 检查右侧
                        if (j < 3 && current === this.board[i][j + 1]) {
                            return;
                        }
                        
                        // 检查下方
                        if (i < 3 && current === this.board[i + 1][j]) {
                            return;
                        }
                    }
                }
                
                // 游戏结束
                this.isGameOver = true;
                this.showGameOver();
            }

            showGameWon() {
                // 设置当前分数到排行榜系统
                if (window.leaderboardSystem) {
                    window.leaderboardSystem.setCurrentScore('twentyFortyEight', this.score);
                }
                // 使用全局的Game Over效果
                createGameOverEffect('twentyFortyEight', this.score);
            }

            showGameOver() {
                // 设置当前分数到排行榜系统
                if (window.leaderboardSystem) {
                    window.leaderboardSystem.setCurrentScore('twentyFortyEight', this.score);
                }
                // 使用全局的Game Over效果
                createGameOverEffect('twentyFortyEight', this.score);
            }

            updateDisplay() {
                // 更新分数
                document.getElementById('twentyFortyEightScore').textContent = this.score;
                
                // 更新最高分
                if (this.score > this.best) {
                    this.best = this.score;
                    localStorage.setItem('2048Best', this.best);
                }
                document.getElementById('twentyFortyEightBest').textContent = this.best;
                
                // 更新棋盘
                const boardElement = document.getElementById('twentyFortyEightBoard');
                boardElement.innerHTML = '';
                
                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 4; j++) {
                        const cell = document.createElement('div');
                        cell.className = `game-cell ${this.board[i][j] !== 0 ? 'game-cell-' + this.board[i][j] : ''}`;
                        cell.textContent = this.board[i][j] || '';
                        boardElement.appendChild(cell);
                    }
                }
                
                // 移除已存在的游戏结束效果
                const existingOverlay = document.querySelector('.game-over-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
            }

            newGame() {
                this.init();
            }

            stop() {
                // 2048游戏不需要停止循环
            }
        }

        // 初始化2048游戏
        let twentyFortyEightGame;
        
        // 添加键盘事件监听器
        function enable2048KeyListeners() {
            document.addEventListener('keydown', handle2048KeyDown);
        }
        
        function handle2048KeyDown(e) {
            if (!twentyFortyEightGame) return;
            
            let moved = false;
            const key = e.key.toLowerCase();
            switch (key) {
                case 'arrowup':
                case 'w':
                    moved = twentyFortyEightGame.move('up');
                    break;
                case 'arrowdown':
                case 's':
                    moved = twentyFortyEightGame.move('down');
                    break;
                case 'arrowleft':
                case 'a':
                    moved = twentyFortyEightGame.move('left');
                    break;
                case 'arrowright':
                case 'd':
                    moved = twentyFortyEightGame.move('right');
                    break;
            }
            
            if (moved) {
                e.preventDefault();
            }
        }
        
        // 游戏按钮事件
        document.getElementById('twentyFortyEightGameBtn').addEventListener('click', () => {
            document.getElementById('twentyFortyEightGameContainer').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            if (!twentyFortyEightGame) {
                twentyFortyEightGame = new TwentyFortyEightGame();
            } else {
                twentyFortyEightGame.newGame();
            }
            
            enable2048KeyListeners();
        });
        
        // 关闭游戏按钮事件
        document.getElementById('closeTwentyFortyEightGame').addEventListener('click', () => {
            document.getElementById('twentyFortyEightGameContainer').style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // 移除键盘事件监听器
            document.removeEventListener('keydown', handle2048KeyDown);
        });
        
        // 新游戏按钮事件
        document.getElementById('twentyFortyEightNewGame').addEventListener('click', () => {
            if (twentyFortyEightGame) {
                twentyFortyEightGame.newGame();
            }
        });
        
        // 撤销按钮事件
        document.getElementById('twentyFortyEightUndo').addEventListener('click', () => {
            if (twentyFortyEightGame) {
                twentyFortyEightGame.undo();
            }
        });
        
        // ESC键关闭游戏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const container = document.getElementById('twentyFortyEightGameContainer');
                if (container.style.display === 'flex') {
                    document.getElementById('closeTwentyFortyEightGame').click();
                }
            }
        });
    
