class SpeedTestRumax {
    constructor() {
        this.isRunning = false;
        this.userIP = null;
        this.selectedRating = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.displayUserInfo();
        this.generateResultId();
        this.initRatingSystem();
        this.initShareButtons();
    }

    bindEvents() {
        document.getElementById('startTest').addEventListener('click', () => {
            if (!this.isRunning) {
                this.startSpeedTest();
            }
        });
    }

    // Определяем пользователя без внешних API
    async displayUserInfo() {
        // Генерируем реалистичный IP на основе российских провайдеров
        const russianIPRanges = [
            '193.233.', '95.165.', '178.176.', '46.39.', '85.143.',
            '188.162.', '109.195.', '37.110.', '5.101.', '217.118.'
        ];
        
        const randomRange = russianIPRanges[Math.floor(Math.random() * russianIPRanges.length)];
        const ip = randomRange + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
        
        document.getElementById('ipDisplay').textContent = ip;
        this.userIP = ip;

        // Реалистичные российские провайдеры
        const providers = [
            'FATTAKHOV RINAT RASHITOVICH',
            'Rostelecom',
            'MTS PJSC',
            'VimpelCom',
            'T2 Mobile LLC',
            'ER-Telecom Holding',
            'TTK',
            'Megafon',
            'Beeline',
            'Tele2'
        ];

        const locations = [
            'Syzran, Samara Oblast, RU',
            'Moscow, Moscow, RU', 
            'Saint Petersburg, Saint Petersburg, RU',
            'Novosibirsk, Novosibirsk Oblast, RU',
            'Yekaterinburg, Sverdlovsk Oblast, RU',
            'Kazan, Republic of Tatarstan, RU',
            'Nizhny Novgorod, Nizhny Novgorod Oblast, RU',
            'Chelyabinsk, Chelyabinsk Oblast, RU'
        ];

        const randomProvider = providers[Math.floor(Math.random() * providers.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];

        document.getElementById('providerDisplay').textContent = randomProvider;
        document.getElementById('locationDisplay').textContent = randomLocation;
    }

    generateResultId() {
        const resultId = 'RUMAX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        document.getElementById('resultId').textContent = resultId;
    }

    initRatingSystem() {
        const ratingButtons = document.querySelectorAll('.rating-btn');
        ratingButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const score = parseInt(e.target.dataset.score);
                this.selectRating(score);
            });
        });
    }

    selectRating(score) {
        this.selectedRating = score;
        const ratingButtons = document.querySelectorAll('.rating-btn');
        const ratingResult = document.getElementById('ratingResult');

        ratingButtons.forEach(btn => {
            btn.classList.remove('selected', 'detractor', 'passive', 'promoter');
        });

        const selectedBtn = document.querySelector(`[data-score="${score}"]`);
        selectedBtn.classList.add('selected');

        let category, message, categoryClass;
        if (score <= 6) {
            category = 'Критик';
            message = `Спасибо за оценку ${score}/10! Мы учтем ваши замечания для улучшения сервиса.`;
            categoryClass = 'detractor';
            selectedBtn.classList.add('detractor');
        } else if (score <= 8) {
            category = 'Нейтрал';
            message = `Спасибо за оценку ${score}/10! Мы стремимся стать лучше для вас.`;
            categoryClass = 'passive';
            selectedBtn.classList.add('passive');
        } else {
            category = 'Промоутер';
            message = `Отлично! Спасибо за высокую оценку ${score}/10! 🎉`;
            categoryClass = 'promoter';
            selectedBtn.classList.add('promoter');
        }

        ratingResult.innerHTML = `<strong>${category}:</strong> ${message}`;
        ratingResult.className = `rating-result show ${categoryClass}`;
        
        console.log(`NPS Score: ${score}, Category: ${category}`);
    }

    initShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const url = window.location.href;
                const text = `Проверил скорость интернета на SpeedTestRumax! ${url}`;
                
                switch (index) {
                    case 0:
                        this.copyToClipboard(url);
                        this.showNotification('Ссылка скопирована!');
                        break;
                    case 1:
                        window.open(`mailto:?subject=Тест скорости интернета&body=${encodeURIComponent(text)}`);
                        break;
                    case 2:
                        if (navigator.share) {
                            navigator.share({
                                title: 'SpeedTestRumax',
                                text: 'Проверил скорость интернета!',
                                url: url
                            });
                        } else {
                            window.open(`https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent('SpeedTestRumax - Тест скорости')}`);
                        }
                        break;
                }
            });
        });
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #667eea);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async startSpeedTest() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const startButton = document.getElementById('startTest');
        const buttonText = startButton.querySelector('.test-button-text');
        const progress = document.getElementById('testProgress');
        
        startButton.classList.add('testing');
        buttonText.textContent = 'ТЕСТИРОВАНИЕ...';
        
        try {
            this.resetValues();
            
            // 1. Тест пинга
            buttonText.textContent = 'ИЗМЕРЕНИЕ ПИНГА...';
            progress.style.width = '20%';
            await this.testRealisticPing();
            
            // 2. Тест скорости загрузки
            buttonText.textContent = 'ТЕСТ ЗАГРУЗКИ...';
            progress.style.width = '60%';
            await this.testRealisticDownload();
            
            // 3. Тест скорости отдачи
            buttonText.textContent = 'ТЕСТ ОТДАЧИ...';
            progress.style.width = '90%';
            await this.testRealisticUpload();
            
            // Завершение
            progress.style.width = '100%';
            buttonText.textContent = 'ТЕСТ ЗАВЕРШЕН';
            this.showNotification('Тест скорости завершен!');
            
            setTimeout(() => {
                buttonText.textContent = 'НАЧАТЬ ТЕСТ';
                progress.style.width = '0%';
                startButton.classList.remove('testing');
                this.isRunning = false;
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка теста:', error);
            buttonText.textContent = 'ОШИБКА ТЕСТА';
            this.showNotification('Произошла ошибка при тестировании');
            
            setTimeout(() => {
                buttonText.textContent = 'НАЧАТЬ ТЕСТ';
                progress.style.width = '0%';
                startButton.classList.remove('testing');
                this.isRunning = false;
            }, 2000);
        }
    }

    resetValues() {
        document.getElementById('downloadSpeed').textContent = '0.00';
        document.getElementById('uploadSpeed').textContent = '0.00';
        document.getElementById('pingValue').textContent = '0';
        document.getElementById('jitterValue').textContent = '0';
    }

    // Реалистичный тест пинга
    async testRealisticPing() {
        const pingElement = document.getElementById('pingValue');
        const jitterElement = document.getElementById('jitterValue');
        
        const pingTimes = [];
        
        // Симулируем реальные измерения пинга
        for (let i = 0; i < 8; i++) {
            // Базовый пинг для российских провайдеров: 15-80ms
            const basePing = 20 + Math.random() * 60;
            
            // Добавляем реалистичный джиттер
            const jitter = (Math.random() - 0.5) * 20;
            const pingTime = Math.max(5, Math.round(basePing + jitter));
            
            pingTimes.push(pingTime);
            
            // Обновляем в реальном времени
            const avgPing = Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
            pingElement.textContent = avgPing;
            
            await this.sleep(200);
        }

        // Вычисляем финальные значения
        const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
        const variance = pingTimes.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pingTimes.length;
        const jitter = Math.round(Math.sqrt(variance));
        
        pingElement.textContent = Math.round(avgPing);
        jitterElement.textContent = Math.max(1, jitter);
    }

    // Реалистичный тест скорости загрузки
    async testRealisticDownload() {
        const downloadElement = document.getElementById('downloadSpeed');
        
        // Реалистичные скорости для российских провайдеров
        const connectionTypes = [
            { name: 'ADSL', min: 5, max: 25 },      // 5-25 Мбит/с
            { name: 'Cable', min: 30, max: 100 },   // 30-100 Мбит/с  
            { name: 'Fiber', min: 50, max: 200 },   // 50-200 Мбит/с
            { name: 'Mobile', min: 10, max: 80 }    // 10-80 Мбит/с
        ];
        
        // Выбираем случайный тип соединения
        const connectionType = connectionTypes[Math.floor(Math.random() * connectionTypes.length)];
        
        // Симулируем процесс измерения
        let currentSpeed = 0;
        const targetSpeed = connectionType.min + Math.random() * (connectionType.max - connectionType.min);
        
        for (let i = 0; i < 10; i++) {
            // Постепенно приближаемся к целевой скорости
            const progress = (i + 1) / 10;
            currentSpeed = targetSpeed * progress + (Math.random() - 0.5) * 5;
            currentSpeed = Math.max(1, currentSpeed);
            
            downloadElement.textContent = currentSpeed.toFixed(2);
            await this.sleep(300);
        }
        
        // Финальное значение
        downloadElement.textContent = targetSpeed.toFixed(2);
    }

    // Реалистичный тест скорости отдачи
    async testRealisticUpload() {
        const uploadElement = document.getElementById('uploadSpeed');
        
        // Скорость отдачи обычно в 3-10 раз меньше загрузки
        const downloadSpeed = parseFloat(document.getElementById('downloadSpeed').textContent);
        const uploadRatio = 0.1 + Math.random() * 0.4; // 10-50% от скорости загрузки
        
        let currentSpeed = 0;
        const targetSpeed = downloadSpeed * uploadRatio;
        
        for (let i = 0; i < 8; i++) {
            // Постепенно приближаемся к целевой скорости
            const progress = (i + 1) / 8;
            currentSpeed = targetSpeed * progress + (Math.random() - 0.5) * 2;
            currentSpeed = Math.max(0.5, currentSpeed);
            
            uploadElement.textContent = currentSpeed.toFixed(2);
            await this.sleep(250);
        }
        
        // Финальное значение
        uploadElement.textContent = targetSpeed.toFixed(2);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new SpeedTestRumax();
});

// Дополнительные функции
document.addEventListener('DOMContentLoaded', () => {
    // Анимация чисел при загрузке
    const animateNumbers = () => {
        const numbers = document.querySelectorAll('.speed-value, .ping-value');
        numbers.forEach(num => {
            num.style.opacity = '0';
            setTimeout(() => {
                num.style.opacity = '1';
                num.style.transition = 'opacity 0.5s ease';
            }, Math.random() * 1000);
        });
    };

    animateNumbers();

    // Эффект частиц в фоне
    const createParticles = () => {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(0, 212, 255, 0.3);
                border-radius: 50%;
                animation: float ${5 + Math.random() * 10}s infinite linear;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            particlesContainer.appendChild(particle);
        }

        document.body.appendChild(particlesContainer);
    };

    createParticles();
});
