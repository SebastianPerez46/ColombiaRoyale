document.addEventListener('DOMContentLoaded', () => {
    console.log("Juego iniciado...");

    // --- CONFIGURACIÓN ---
    const arenasData = {
        "plaza_che": { name: "Plaza Ché", img: "assets/img/arenas/che.jpg" },
        "ingenieria": { name: "Ingeniería", img: "assets/img/arenas/ing.jpg" },
        "medicina": { name: "Medicina", img: "assets/img/arenas/med.jpg" }
    };

    // --- GESTOR DE AUDIO ---
    const audioManager = {
        sounds: {},
        init: function() {
            const soundList = {
                'bgm_menu': 'assets/audio/menu.mp3',
                'bgm_battle': 'assets/audio/battle.mp3',
                'click': 'assets/audio/click.mp3',
                'spawn_default': 'assets/audio/spawn.mp3',
                'spell_default': 'assets/audio/spell.wav',
                'hit': 'assets/audio/hit.wav',
                'shot': 'assets/audio/shot.wav',
                'win': 'assets/audio/win.mp3',
                'lose': 'assets/audio/lose.mp3'
            };

            for (const [key, path] of Object.entries(soundList)) {
                this.sounds[key] = new Audio(path);
                if (key.startsWith('bgm')) {
                    this.sounds[key].loop = true;
                    this.sounds[key].volume = 0.4;
                } else {
                    this.sounds[key].volume = 0.6;
                }
            }

            const allCards = getAllCards();
            allCards.forEach(card => {
                if (card.sounds) {
                    if (card.sounds.spawn) {
                        this.sounds[`${card.name}_spawn`] = new Audio(card.sounds.spawn);
                        this.sounds[`${card.name}_spawn`].volume = 0.7;
                    }
                    if (card.sounds.attack) {
                        this.sounds[`${card.name}_attack`] = new Audio(card.sounds.attack);
                        this.sounds[`${card.name}_attack`].volume = 0.6;
                    }
                }
            });
        },
        play: function(key) {
            const sound = this.sounds[key];
            if (sound) {
                if (key.startsWith('bgm')) {
                    if (sound.paused) sound.play().catch(e => {});
                } else {
                    const clone = sound.cloneNode();
                    clone.volume = sound.volume;
                    clone.play().catch(e => {}); 
                }
            }
        },
        stop: function(key) {
            const sound = this.sounds[key];
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        },
        stopAllMusic: function() {
            this.stop('bgm_menu');
            this.stop('bgm_battle');
        }
    };

    audioManager.init();

    class SparseMatrix {
        constructor(rows, cols) {
            this.rows = rows;
            this.cols = cols;
            this.data = new Map();
        }
        _key(row, col) { return `${row},${col}`; }
        set(row, col, value) {
            if (value === 0) this.data.delete(this._key(row, col));
            else this.data.set(this._key(row, col), value);
        }
        get(row, col) { return this.data.get(this._key(row, col)) || 0; }
    }

    let sessionWins = 0;
    let sessionLosses = 0;

    const gameState = {
        playerDeck: [], 
        maxDeckSize: 6,
        selectedArena: "plaza_che",
        isPlaying: false,
        elixir: 5,
        maxElixir: 10,
        gameTime: 180,
        hand: [],
        nextCard: null,
        deckPile: [],
        selectedHandIndex: -1,
        units: [], 
        effects: [],
        enemyElixir: 5,
        enemyDeck: [], 
        enemyCycle: [], 
        enemySpawnTimer: 0 
    };

    let canvas, ctx;
    let lastTime = 0;
    let gameLoopId;
    const GRID_SIZE = 20;
    let mapMatrix;
    let towers = [];
    
    const bridges = [
        { x: 190, y: 640 }, 
        { x: 550, y: 640 } 
    ];
    const RIVER_Y = 640;
    const RIVER_SAFE_TOP = 600;
    const RIVER_SAFE_BOTTOM = 680;

    const screens = {
        loading: document.getElementById('loading-screen'),
        menu: document.getElementById('main-menu'),
        deck: document.getElementById('deck-screen'),
        game: document.getElementById('gameplay-screen'),
        result: document.getElementById('result-screen')
    };

    function attachButtonSound(btn) {
        if (btn) btn.addEventListener('click', () => audioManager.play('click'));
    }

    const buttons = {
        play: document.getElementById('btn-play'),
        deckView: document.getElementById('btn-deck-view'),
        backMenu: document.getElementById('btn-back-menu'),
        randomDeck: document.getElementById('btn-random-deck'),
        returnHome: document.getElementById('btn-return-home'),
        confirmDeck: document.getElementById('btn-confirm-deck'),
        closeArena: document.getElementById('btn-close-arena')
    };

    Object.values(buttons).forEach(attachButtonSound);

    const uiElements = {
        resultTitle: document.getElementById('result-title'),
        elixirBar: document.getElementById('elixir-bar'),
        elixirText: document.getElementById('elixir-text'),
        handContainer: document.getElementById('hand-container'),
        nextCardSlot: document.getElementById('next-card-slot'),
        timer: document.getElementById('game-timer'),
        loadingFill: document.querySelector('.loading-bar-fill'),
        winsCount: document.getElementById('wins-count'),   
        lossesCount: document.getElementById('losses-count') 
    };

    const arenaUI = {
        previewContainer: document.getElementById('arena-preview-container'),
        currentImg: document.getElementById('current-arena-img'),
        nameDisplay: document.getElementById('arena-name-display'),
        modal: document.getElementById('arena-selector-modal'),
        options: document.querySelectorAll('.arena-option')
    };
    attachButtonSound(arenaUI.previewContainer);
    
    const deckUI = {
        currentDeckGrid: document.getElementById('current-deck-grid'),
        collectionGrid: document.getElementById('collection-grid'),
        deckCountLabel: document.getElementById('deck-count')
    };

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });
        if (screens[screenName]) {
            screens[screenName].classList.remove('hidden');
            setTimeout(() => screens[screenName].classList.add('active'), 50);
        }

        if (screenName === 'menu' || screenName === 'deck') {
            audioManager.stop('bgm_battle');
            audioManager.play('bgm_menu');
        } else if (screenName === 'game') {
            audioManager.stop('bgm_menu');
            audioManager.play('bgm_battle');
        } else if (screenName === 'result') {
            audioManager.stopAllMusic();
        }
    }

    function startFakeLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            const jump = Math.random() * 15 + 5;
            progress += jump;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    updateArenaUI();
                    showScreen('menu'); 
                }, 500);
            }
            uiElements.loadingFill.style.width = `${progress}%`;
        }, 300);
    }

    startFakeLoading();

    buttons.play.addEventListener('click', () => {
        if (gameState.playerDeck.length < gameState.maxDeckSize) {
            alert(`¡Necesitas ${gameState.maxDeckSize} cartas para jugar!`);
            return;
        }
        showScreen('game');
        iniciarPartida(); 
    });
    buttons.deckView.addEventListener('click', () => { showScreen('deck'); renderizarPantallaMazo(); });
    buttons.backMenu.addEventListener('click', () => showScreen('menu'));
    if (buttons.confirmDeck) buttons.confirmDeck.addEventListener('click', () => showScreen('menu'));
    
    buttons.returnHome.addEventListener('click', () => { 
        gameState.isPlaying = false; 
        updateScoreUI(); 
        showScreen('menu'); 
    });
    
    buttons.randomDeck.addEventListener('click', () => { generarMazoAleatorio(); renderizarPantallaMazo(); });
    
    arenaUI.previewContainer.addEventListener('click', () => arenaUI.modal.classList.remove('hidden'));
    buttons.closeArena.addEventListener('click', () => arenaUI.modal.classList.add('hidden'));
    arenaUI.options.forEach(option => {
        option.addEventListener('click', () => {
            const key = option.getAttribute('data-arena');
            if (arenasData[key]) {
                audioManager.play('click');
                gameState.selectedArena = key;
                updateArenaUI();
                arenaUI.modal.classList.add('hidden');
            }
        });
    });

    function updateArenaUI() {
        const arena = arenasData[gameState.selectedArena];
        arenaUI.currentImg.style.backgroundImage = `url('${arena.img}')`;
        arenaUI.nameDisplay.textContent = arena.name;
    }

    function updateScoreUI() {
        uiElements.winsCount.textContent = sessionWins;
        uiElements.lossesCount.textContent = sessionLosses;
    }

    function generarMazoAleatorio() {
        const allCards = getAllCards();
        shuffleArray(allCards);
        gameState.playerDeck = allCards.slice(0, gameState.maxDeckSize);
    }

    function toggleCartaEnMazo(cartaData) {
        audioManager.play('click');
        const index = gameState.playerDeck.findIndex(c => c.name === cartaData.name);
        if (index !== -1) gameState.playerDeck.splice(index, 1);
        else {
            if (gameState.playerDeck.length < gameState.maxDeckSize) gameState.playerDeck.push(cartaData);
            else { alert("¡Mazo lleno!"); return; }
        }
        renderizarPantallaMazo();
    }

    function renderizarPantallaMazo() {
        deckUI.deckCountLabel.textContent = gameState.playerDeck.length;
        deckUI.currentDeckGrid.innerHTML = '';
        deckUI.collectionGrid.innerHTML = '';
        const allCards = getAllCards(); 
        allCards.forEach(cartaData => {
            const isInDeck = gameState.playerDeck.some(c => c.name === cartaData.name);
            const cardElement = document.createElement('div');
            cardElement.className = `card-slot ${isInDeck ? 'in-deck' : ''}`;
            cardElement.style.backgroundImage = `url('${cartaData.img}')`;
            cardElement.innerHTML = `<div class="card-name">${cartaData.name}</div>`;
            cardElement.addEventListener('click', () => toggleCartaEnMazo(cartaData));
            (isInDeck ? deckUI.currentDeckGrid : deckUI.collectionGrid).appendChild(cardElement);
        });
    }

    function iniciarPartida() {
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        
        canvas.removeEventListener('mousedown', handleCanvasClick);
        canvas.addEventListener('mousedown', handleCanvasClick);

        initMapMatrix();
        initTowers();
        
        gameState.units = []; 
        gameState.effects = [];
        gameState.selectedHandIndex = -1; 
        gameState.gameTime = 180; 

        gameState.deckPile = [...gameState.playerDeck]; 
        shuffleArray(gameState.deckPile);
        gameState.hand = [];
        for(let i=0; i<3; i++) if(gameState.deckPile.length > 0) gameState.hand.push(gameState.deckPile.pop());
        gameState.nextCard = gameState.deckPile.length > 0 ? gameState.deckPile.pop() : null;
        gameState.elixir = 5; 

        const allCards = getAllCards();
        shuffleArray(allCards);
        gameState.enemyDeck = allCards.slice(0, gameState.maxDeckSize);
        if (gameState.enemyDeck.length < 6) {
            while(gameState.enemyDeck.length < 6) gameState.enemyDeck.push(allCards[0]);
        }
        gameState.enemyCycle = [...gameState.enemyDeck]; 
        gameState.enemyElixir = 2; 
        
        renderGameUI();
        updateTimerUI();

        gameState.isPlaying = true;
        lastTime = performance.now();
        gameLoopId = requestAnimationFrame(gameLoop);

        if(window.elixirInterval) clearInterval(window.elixirInterval);
        window.elixirInterval = setInterval(() => {
            if (gameState.isPlaying) {
                if (gameState.elixir < gameState.maxElixir) {
                    gameState.elixir++;
                    updateElixirUI();
                }
                if (gameState.enemyElixir < gameState.maxElixir) {
                    gameState.enemyElixir++;
                }
            }
        }, 2000); 
    }

    function checkTimeOutWinner() {
        const playerTowers = towers.filter(t => t.team === 'player').length;
        const enemyTowers = towers.filter(t => t.team === 'enemy').length;
        
        if (playerTowers > enemyTowers) endGame('VICTORIA');
        else if (enemyTowers > playerTowers) endGame('DERROTA');
        else {
            const playerHP = towers.filter(t => t.team === 'player').reduce((sum, t) => sum + t.hp, 0);
            const enemyHP = towers.filter(t => t.team === 'enemy').reduce((sum, t) => sum + t.hp, 0);
            if (playerHP > enemyHP) endGame('VICTORIA (Vida)');
            else if (enemyHP > playerHP) endGame('DERROTA (Vida)');
            else endGame('EMPATE');
        }
    }

    function endGame(resultText) {
        gameState.isPlaying = false;
        cancelAnimationFrame(gameLoopId);
        clearInterval(window.elixirInterval);
        
        if (resultText.includes('VICTORIA')) {
            sessionWins++;
            audioManager.play('win');
        } else if (resultText.includes('DERROTA')) {
            sessionLosses++;
            audioManager.play('lose');
        }
        
        uiElements.resultTitle.textContent = resultText;
        uiElements.resultTitle.style.color = resultText.includes('VICTORIA') ? "#2ecc71" : "#e74c3c";
        
        const arenaImg = arenasData[gameState.selectedArena].img;
        screens.result.style.backgroundImage = `url('${arenaImg}')`;
        screens.result.style.backgroundSize = 'cover';
        screens.result.style.backgroundPosition = 'center';
        
        showScreen('result');
    }

    function initMapMatrix() {
        const rows = Math.ceil(1280 / GRID_SIZE);
        const cols = Math.ceil(720 / GRID_SIZE);
        mapMatrix = new SparseMatrix(rows, cols);
        const riverRow = Math.floor(rows / 2);
        for (let c = 0; c < cols; c++) {
            mapMatrix.set(riverRow, c, 1);
            mapMatrix.set(riverRow - 1, c, 1);
        }
        const bridgeLeft = Math.floor(cols * 0.25);
        const bridgeRight = Math.floor(cols * 0.75);
        for(let r = riverRow-1; r <= riverRow; r++) {
            mapMatrix.set(r, bridgeLeft, 0); 
            mapMatrix.set(r, bridgeRight, 0);
        }
    }

    function initTowers() {
        towers = [];
        const princessStats = { range: 7.5, dmg: 90, atkSpeed: 0.8 };
        const kingStats = { range: 7, dmg: 120, atkSpeed: 1.0 };

        // --- TORRES ---
        towers.push({ 
            id: 'p_tower_l', x: 140, y: 880, hp: 2500, maxHp: 2500, team: 'player', type: 'princess', width: 70, height: 70,
            stats: princessStats, attackTimer: 0, hitFlash: 0,
            img: "assets/img/sprites/tower.png" 
        });
        towers.push({ 
            id: 'p_tower_r', x: 580, y: 880, hp: 2500, maxHp: 2500, team: 'player', type: 'princess', width: 70, height: 70,
            stats: princessStats, attackTimer: 0, hitFlash: 0,
            img: "assets/img/sprites/tower.png"
        });
        towers.push({ 
            id: 'p_king', x: 360, y: 1030, hp: 4000, maxHp: 4000, team: 'player', type: 'king', width: 90, height: 90,
            stats: kingStats, attackTimer: 0, hitFlash: 0,
            img: "assets/img/sprites/tower.png"
        });

        towers.push({ 
            id: 'e_tower_l', x: 140, y: 280, hp: 2500, maxHp: 2500, team: 'enemy', type: 'princess', width: 70, height: 70,
            stats: princessStats, attackTimer: 0, hitFlash: 0,
            img: "assets/img/sprites/tower.png"
        });
        towers.push({ 
            id: 'e_tower_r', x: 580, y: 280, hp: 2500, maxHp: 2500, team: 'enemy', type: 'princess', width: 70, height: 70,
            stats: princessStats, attackTimer: 0, hitFlash: 0,
            img: "assets/img/sprites/tower.png"
        });
        towers.push({ 
            id: 'e_king', x: 360, y: 130, hp: 4000, maxHp: 4000, team: 'enemy', type: 'king', width: 90, height: 90,
            stats: kingStats, attackTimer: 0, hitFlash: 0,
            img: "assets/img/sprites/tower.png"
        });
    }

    function handleCanvasClick(e) {
        if (gameState.selectedHandIndex === -1) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const card = gameState.hand[gameState.selectedHandIndex];

        if (gameState.elixir < card.cost) return;

        if (card.type === "hechizo") {
            castSpell(card, x, y, 'player');
        } else {
            if (y < RIVER_Y) { 
                console.log("¡Solo puedes colocar tropas en tu territorio!");
                return;
            }
            const row = Math.floor(y / GRID_SIZE);
            const col = Math.floor(x / GRID_SIZE);
            if (mapMatrix.get(row, col) === 1 && !card.isFlying) {
                console.log("¡No puedes colocar tropas terrestres en el río!");
                return;
            }
            spawnUnit(card, x, y, 'player');
        }

        gameState.elixir -= card.cost;
        rotateCard(gameState.selectedHandIndex);
        gameState.selectedHandIndex = -1;
        updateElixirUI();
    }

    function spawnUnit(cardData, x, y, team) {
        const soundKey = `${cardData.name}_spawn`;
        if (audioManager.sounds[soundKey]) {
            audioManager.play(soundKey);
        } else {
            audioManager.play('spawn_default');
        }

        let size = 40; 
        if (cardData.cost >= 5) size = 60; 
        if (cardData.cost <= 2 || cardData.name === 'Dron') size = 30; 

        if (team === 'enemy' && !cardData.isFlying) {
            const row = Math.floor(y / GRID_SIZE);
            const col = Math.floor(x / GRID_SIZE);
            if (mapMatrix.get(row, col) === 1) y -= 40; 
        }

        const unit = {
            id: Math.random().toString(36).substr(2, 9),
            name: cardData.name,
            x: x, y: y,
            stats: { ...cardData.stats },
            hp: cardData.stats.hp,
            maxHp: cardData.stats.hp,
            team: team,
            img: cardData.img,
            spriteConfig: cardData.spriteConfig,
            animFrame: 0,
            animTimer: 0,
            state: 'walk',
            width: size, height: size,
            attackTimer: 0,
            hitFlash: 0,
            isFlying: cardData.isFlying
        };
        gameState.units.push(unit);
    }

    function castSpell(cardData, x, y, team) {
        const soundKey = `${cardData.name}_spawn`; 
        if (audioManager.sounds[soundKey]) {
            audioManager.play(soundKey);
        } else {
            audioManager.play('spell_default');
        }

        gameState.effects.push({
            type: 'projectile',
            x: x, y: y,
            radius: cardData.stats.radius * GRID_SIZE,
            timer: 2.0, 
            color: 'rgba(0, 0, 0, 0.2)', 
            dmg: cardData.stats.dmg,
            team: team, 
            cardName: cardData.name
        });
    }

    function shootProjectile(start, target, team) {
        audioManager.play('shot');

        gameState.effects.push({
            type: 'arrow',
            x: start.x, y: start.y,
            targetX: target.x, targetY: target.y,
            life: 0.2, 
            color: team === 'player' ? '#3498db' : '#e74c3c',
            width: 4
        });
    }

    function explodeSpell(effect) {
        const soundKey = `${effect.cardName}_attack`;
        if (audioManager.sounds[soundKey]) {
            audioManager.play(soundKey);
        } else {
            audioManager.play('hit'); 
        }

        gameState.effects.push({
            type: 'explosion',
            x: effect.x, y: effect.y,
            radius: effect.radius, 
            life: 0.5, 
            color: 'rgba(255, 69, 0, 0.6)' 
        });

        const radiusPx = effect.radius * 1.5; 
        const targetTeam = effect.team === 'player' ? 'enemy' : 'player';
        const targets = [...gameState.units, ...towers].filter(u => u.team === targetTeam);

        targets.forEach(target => {
            const dx = target.x - effect.x;
            const dy = target.y - effect.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < radiusPx) {
                takeDamage(target, effect.dmg);
            }
        });
    }

    function rotateCard(indexUsed) {
        const usedCard = gameState.hand[indexUsed];
        gameState.deckPile.unshift(usedCard);
        gameState.hand[indexUsed] = gameState.nextCard;
        gameState.nextCard = gameState.deckPile.length > 0 ? gameState.deckPile.pop() : null;
        renderGameUI();
    }

    function takeDamage(entity, amount) {
        entity.hp -= amount;
        entity.hitFlash = 0.2; 
    }

    function updateEnemyAI(dt) {
        gameState.enemySpawnTimer += dt;
        if (gameState.enemySpawnTimer < 1.0) return; 
        gameState.enemySpawnTimer = 0;

        const threats = gameState.units.filter(u => u.team === 'player' && u.y < RIVER_Y);
        
        if (threats.length > 0 && gameState.enemyElixir >= 2) {
            const threat = threats[0]; 
            const cardToPlay = getEnemyCard(gameState.enemyElixir);
            if (cardToPlay) {
                const spawnY = Math.min(threat.y - 80, RIVER_Y - 50); 
                spawnUnit(cardToPlay, threat.x, spawnY, 'enemy');
                gameState.enemyElixir -= cardToPlay.cost;
                return; 
            }
        }

        if (gameState.enemyElixir >= 4) {
            const cardToPlay = getEnemyCard(gameState.enemyElixir);
            if (cardToPlay) {
                const lane = Math.random() > 0.5 ? bridges[0] : bridges[1];
                spawnUnit(cardToPlay, lane.x, lane.y - 150, 'enemy');
                gameState.enemyElixir -= cardToPlay.cost;
            }
        }
    }

    function getEnemyCard(maxCost) {
        const handSize = Math.min(4, gameState.enemyCycle.length);
        const virtualHand = gameState.enemyCycle.slice(0, handSize);
        const playableCards = virtualHand.filter(c => c.cost <= maxCost);
        
        if (playableCards.length > 0) {
            const choice = playableCards[Math.floor(Math.random() * playableCards.length)];
            const index = gameState.enemyCycle.indexOf(choice);
            if (index > -1) {
                gameState.enemyCycle.splice(index, 1);
                gameState.enemyCycle.push(choice);
                return choice;
            }
        }
        return null;
    }

    function updateTimerUI() {
        const minutes = Math.floor(gameState.gameTime / 60);
        const seconds = Math.floor(gameState.gameTime % 60);
        uiElements.timer.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (gameState.gameTime < 30) uiElements.timer.style.color = '#e74c3c';
        else uiElements.timer.style.color = 'white';
    }

    function gameLoop(timestamp) {
        if (!gameState.isPlaying) return;
        const deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    }

    function update(dt) {
        gameState.gameTime -= dt;
        if (gameState.gameTime <= 0) {
            gameState.gameTime = 0;
            checkTimeOutWinner();
        }
        updateTimerUI();

        updateEnemyAI(dt);

        const playerKing = towers.find(t => t.team === 'player' && t.type === 'king');
        const enemyKing = towers.find(t => t.team === 'enemy' && t.type === 'king');
        if (!playerKing) endGame('DERROTA'); 
        else if (!enemyKing) endGame('VICTORIA'); 

        gameState.effects.forEach(e => {
            if (e.type === 'projectile') {
                e.timer -= dt;
                if (e.timer <= 0) {
                    explodeSpell(e);
                    e.life = 0; 
                }
            } else {
                e.life -= dt; 
            }
        });
        gameState.effects = gameState.effects.filter(e => (e.type === 'projectile' && e.timer > 0) || (e.type !== 'projectile' && e.life > 0));

        gameState.units = gameState.units.filter(u => u.hp > 0);
        towers = towers.filter(t => t.hp > 0); 

        gameState.units.forEach(unit => {
            if (unit.hitFlash > 0) unit.hitFlash -= dt;
            if (unit.attackTimer > 0) unit.attackTimer -= dt;
            
            unit.animTimer += dt;
            if (unit.animTimer > 0.25) { 
                unit.animFrame = unit.animFrame === 0 ? 1 : 0;
                unit.animTimer = 0;
            }

            let target = findTarget(unit);

            if (target) {
                const dx = target.x - unit.x;
                const dy = target.y - unit.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const rangePx = (unit.stats.range * GRID_SIZE) + (target.width/2);

                if (dist <= rangePx) {
                    if (unit.attackTimer <= 0) {
                        if (unit.stats.range > 2) {
                            shootProjectile(unit, target, unit.team);
                        }
                        
                        const attackSoundKey = `${unit.name}_attack`;
                        if (audioManager.sounds[attackSoundKey]) {
                            audioManager.play(attackSoundKey);
                        } 

                        takeDamage(target, unit.stats.dmg);
                        unit.attackTimer = unit.stats.atkSpeed;
                    }
                } else {
                    let moveX = target.x;
                    let moveY = target.y;
                    const isGround = !unit.isFlying; 
                    const crossingRiver = (unit.y > RIVER_Y && target.y < RIVER_Y) || (unit.y < RIVER_Y && target.y > RIVER_Y);

                    if (isGround && crossingRiver) {
                        const bridge = bridges.reduce((prev, curr) => {
                            const distPrev = Math.abs(unit.x - prev.x);
                            const distCurr = Math.abs(unit.x - curr.x);
                            return distPrev < distCurr ? prev : curr;
                        });
                        const bridgeSafeY_Top = RIVER_Y - 40;
                        const bridgeSafeY_Bottom = RIVER_Y + 40;
                        let hasCrossed = (unit.team === 'player') ? (unit.y < bridgeSafeY_Top) : (unit.y > bridgeSafeY_Bottom);

                        if (!hasCrossed) {
                            moveX = bridge.x;
                            moveY = unit.team === 'player' ? bridgeSafeY_Top : bridgeSafeY_Bottom;
                        }
                    }
                    const angle = Math.atan2(moveY - unit.y, moveX - unit.x);
                    const speedPx = unit.stats.speed * 15; 
                    unit.x += Math.cos(angle) * speedPx * dt;
                    unit.y += Math.sin(angle) * speedPx * dt;
                }
            }
        });

        towers.forEach(tower => {
            // CORRECCIÓN BUG: Reducir timer visual de golpe
            if (tower.hitFlash > 0) tower.hitFlash -= dt;

            if (tower.attackTimer > 0) tower.attackTimer -= dt;
            else {
                const enemyTeam = tower.team === 'player' ? 'enemy' : 'player';
                const targets = gameState.units.filter(u => u.team === enemyTeam);
                let closest = null;
                let minDist = Infinity;
                targets.forEach(u => {
                    const dx = u.x - tower.x;
                    const dy = u.y - tower.y;
                    const d = dx*dx + dy*dy;
                    if (d < minDist) { minDist = d; closest = u; }
                });
                if (closest) {
                    const rangePx = tower.stats.range * GRID_SIZE;
                    if (Math.sqrt(minDist) <= rangePx) {
                        shootProjectile(tower, closest, tower.team);
                        takeDamage(closest, tower.stats.dmg);
                        tower.attackTimer = tower.stats.atkSpeed;
                    }
                }
            }
        });
    }

    function findTarget(unit) {
        const enemyTeam = unit.team === 'player' ? 'enemy' : 'player';
        let potentialTargets = towers.filter(t => t.team === enemyTeam);
        const enemyUnits = gameState.units.filter(u => u.team === enemyTeam);
        
        if (unit.stats.target !== 'torres') {
            if (unit.stats.target === 'terrestre') {
                potentialTargets = [...potentialTargets, ...enemyUnits.filter(u => !u.isFlying)];
            } else {
                potentialTargets = [...potentialTargets, ...enemyUnits];
            }
        }
        let closest = null;
        let minDist = Infinity;
        potentialTargets.forEach(t => {
            const dx = t.x - unit.x;
            const dy = t.y - unit.y;
            const d = dx*dx + dy*dy;
            if (d < minDist) { minDist = d; closest = t; }
        });
        return closest;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bgImg = new Image();
        bgImg.src = arenasData[gameState.selectedArena].img;
        if (bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        towers.forEach(t => drawEntity(t));
        gameState.units.forEach(u => drawEntity(u));

        gameState.effects.forEach(e => {
            if (e.type === 'arrow') {
                ctx.beginPath();
                ctx.moveTo(e.x, e.y);
                ctx.lineTo(e.targetX, e.targetY);
                ctx.strokeStyle = e.color;
                ctx.lineWidth = e.width;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                ctx.fillStyle = e.color;
                ctx.fill();
                if (e.type === 'projectile') {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'white';
                    ctx.stroke();
                    ctx.fillStyle = "white";
                    ctx.font = "12px Arial";
                    ctx.fillText(Math.ceil(e.timer), e.x - 4, e.y + 4);
                }
            }
        });
    }

    function drawEntity(e) {
        let drawX = e.x;
        let drawY = e.y;
        let width = e.width || 40;
        let height = e.height || 40;

        if (e.hitFlash > 0) {
            drawY -= 5; 
            ctx.globalAlpha = 0.7; 
            ctx.beginPath();
            ctx.arc(drawX, drawY, width/1.5, 0, Math.PI*2);
            ctx.fillStyle = 'red';
            ctx.fill();
        }

        // --- DIBUJO DE TORRES (CON IMAGEN) ---
        if (e.type === 'princess' || e.type === 'king') {
             const img = new Image();
             img.src = e.img; 
             
             if (img.complete && img.naturalWidth !== 0) {
                 ctx.drawImage(img, drawX - width/2, drawY - height/2, width, height);
             } else {
                 ctx.fillStyle = e.team === 'player' ? '#3498db' : '#e74c3c';
                 ctx.fillRect(drawX - width/2, drawY - height/2, width, height);
             }
        } else {
            if (e.spriteConfig) {
                const cfg = e.spriteConfig;
                const img = new Image();
                img.src = cfg.sheet;
                
                if (img.complete && img.naturalWidth !== 0) {
                    const animKey = e.team === 'player' ? 'animBack' : 'animFront';
                    const animation = cfg[animKey]; 
                    
                    const frameData = animation[e.animFrame]; 
                    const row = frameData[0];
                    const col = frameData[1];

                    const sx = col * cfg.frameWidth;
                    const sy = row * cfg.frameHeight;
                    
                    const destW = width * cfg.scale;
                    const destH = height * cfg.scale;
                    
                    ctx.drawImage(
                        img, 
                        sx, sy, cfg.frameWidth, cfg.frameHeight, 
                        drawX - (destW/2) + cfg.offsetX, drawY - (destH/2) + cfg.offsetY, 
                        destW, destH 
                    );
                } else {
                    drawSimpleUnit(ctx, drawX, drawY, width, e.team);
                }
            } else {
                drawSimpleUnit(ctx, drawX, drawY, width, e.team);
            }
        }
        
        if (e.hp < e.maxHp || e.team === 'enemy') { 
            const hpPct = Math.max(0, e.hp / e.maxHp);
            const barWidth = width; 
            const healthBarOffset = 25; 

            ctx.fillStyle = 'black';
            ctx.fillRect(drawX - barWidth/2, drawY - height/2 - healthBarOffset, barWidth, 6);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(drawX - barWidth/2, drawY - height/2 - healthBarOffset, barWidth * hpPct, 6);
        }
        ctx.globalAlpha = 1.0; 
    }

    function drawSimpleUnit(ctx, x, y, w, team) {
        ctx.beginPath();
        ctx.arc(x, y, w/2, 0, Math.PI * 2);
        ctx.fillStyle = team === 'player' ? "#3498db" : "#e74c3c";
        ctx.fill();
    }

    function updateElixirUI() {
        uiElements.elixirText.textContent = `${gameState.elixir}/${gameState.maxElixir}`;
        const pct = (gameState.elixir / gameState.maxElixir) * 100;
        uiElements.elixirBar.style.height = `${pct}%`; 
        updateHandVisuals();
    }

    function updateHandVisuals() {
        const cardsInHand = document.querySelectorAll('.game-card');
        cardsInHand.forEach((cardEl, index) => {
            const cost = parseInt(cardEl.dataset.cost);
            cardEl.classList.remove('disabled', 'selected');
            if (gameState.elixir < cost) cardEl.classList.add('disabled');
            if (index === gameState.selectedHandIndex) cardEl.classList.add('selected');
        });
    }

    function renderGameUI() {
        updateElixirUI();
        uiElements.handContainer.innerHTML = '';
        gameState.hand.forEach((card, index) => {
            if (!card) return;
            const el = document.createElement('div');
            el.className = 'game-card';
            el.dataset.cost = card.cost;
            el.style.backgroundImage = `url('${card.img}')`;
            el.addEventListener('click', () => selectCardToPlay(index));
            uiElements.handContainer.appendChild(el);
        });
        uiElements.nextCardSlot.innerHTML = '';
        if (gameState.nextCard) {
            const nextEl = document.createElement('div');
            nextEl.className = 'game-card small';
            nextEl.style.backgroundImage = `url('${gameState.nextCard.img}')`;
            uiElements.nextCardSlot.appendChild(nextEl);
        }
    }

    function selectCardToPlay(handIndex) {
        const card = gameState.hand[handIndex];
        if (gameState.elixir < card.cost) return;
        if (gameState.selectedHandIndex === handIndex) {
            gameState.selectedHandIndex = -1;
        } else {
            gameState.selectedHandIndex = handIndex;
        }
        audioManager.play('click');
        updateHandVisuals();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});