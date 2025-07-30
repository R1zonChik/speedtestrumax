class SpeedTestRumax {
    constructor() {
        this.isRunning = false;
        this.userIP = null;
        this.selectedRating = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.displayUserIP();
        await this.displayUserGeo();
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

    async displayUserIP() {
        const ipDisplay = document.getElementById('ipDisplay');
        try {
            const services = [
                'https://api.ipify.org?format=json',
                'https://ipapi.co/json/',
                'https://ipinfo.io/json'
            ];

            for (const service of services) {
                try {
                    const response = await fetch(service);
                    const data = await response.json();
                    const ip = data.ip || data.origin || data.query;
                    if (ip) {
                        this.userIP = ip;
                        ipDisplay.textContent = ip;
                        return;
                    }
                } catch (error) {
                    continue;
                }
            }
            ipDisplay.textContent = 'Не определен';
        } catch (error) {
            ipDisplay.textContent = 'Ошибка определения';
        }
    }

    async displayUserGeo() {
        const providerDisplay = document.getElementById('providerDisplay');
        const locationDisplay = document.getElementById('locationDisplay');
        
        try {
            const geoServices = [
                'https://ipapi.co/json/',
                'https://ipinfo.io/json'
            ];

            for (const service of geoServices) {
                try {
                    const response = await fetch(service);
                    if (!response.ok) continue;
                    
                    const data = await response.json();
                    
                    let provider = data.org || data.isp || data.as || 'Не определен';
                    provider = provider.replace(/^AS\d+\s+/i, '');
                    provider = provider.replace(/\s+Inc\.?$/i, '');
                    provider = provider.replace(/\s+LLC\.?$/i, '');
                    provider = provider.replace(/\s+Ltd\.?$/i, '');
                    
                    providerDisplay.textContent = provider;
                    
                    const locationParts = [
                        data.city,
                        data.region || data.region_name,
                        data.country_name || data.country
                    ].filter(Boolean);
                    
                    const location = locationParts.length > 0 
                        ? locationParts.join(', ') 
                        : 'Не определено';
                    
                    locationDisplay.textContent = location;
                    
                    if (provider !== 'Не определен' || location !== 'Не определено') {
                        return;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            providerDisplay.textContent = 'Не определен';
            locationDisplay.textContent = 'Не определено';
            
        } catch (error) {
            providerDisplay.textContent = 'Ошибка определения';
            locationDisplay.textContent = 'Ошибка определения';
        }
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
            await this.testRealPing();
            
            // 2. Тест скорости загрузки
            buttonText.textContent = 'ТЕСТ ЗАГРУЗКИ...';
            progress.style.width = '60%';
            await this.testRealDownload();
            
            // 3. Тест скорости отдачи
            buttonText.textContent = 'ТЕСТ ОТДАЧИ...';
            progress.style.width = '90%';
            await this.testRealUpload();
            
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

    // Исправленное измерение пинга
    async testRealPing() {
        const pingElement = document.getElementById('pingValue');
        const jitterElement = document.getElementById('jitterValue');
        
        const pingUrls = [
            'https://httpbin.org/get',
            'https://api.github.com',
            'https://jsonplaceholder.typicode.com/posts/1'
        ];

        const pingTimes = [];

        for (let i = 0; i < 8; i++) {
            const url = pingUrls[i % pingUrls.length] + '?t=' + Date.now();
            const startTime = performance.now();
            
            try {
                const response = await fetch(url, {
                    cache: 'no-cache',
                    mode: 'cors'
                });
                
                if (response.ok) {
                    const endTime = performance.now();
                    const pingTime = Math.round(endTime - startTime);
                    pingTimes.push(pingTime);
                    
                    // Обновляем в реальном времени
                    const avgPing = Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
                    pingElement.textContent = avgPing;
                }
            } catch (error) {
                console.log('Ping error:', error);
            }
            
            await this.sleep(200);
        }

        if (pingTimes.length > 0) {
            const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
            const variance = pingTimes.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pingTimes.length;
            const jitter = Math.round(Math.sqrt(variance));
            
            pingElement.textContent = Math.round(avgPing);
            jitterElement.textContent = jitter;
        }
    }

    // Исправленное измерение скорости загрузки
    async testRealDownload() {
        const downloadElement = document.getElementById('downloadSpeed');
        
        const testUrls = [
            'https://proof.ovh.net/files/10Mb.dat',
            'https://speedtest.selectel.ru/10MB.zip',
            'https://httpbin.org/bytes/10485760', // 10MB
            'https://httpbin.org/bytes/5242880'   // 5MB
        ];

        try {
            const speeds = await Promise.allSettled(
                testUrls.map(url => this.simpleDownloadSpeed(url))
            );
            
            const successfulSpeeds = speeds
                .filter(result => result.status === 'fulfilled' && result.value > 0)
                .map(result => result.value);

            if (successfulSpeeds.length > 0) {
                const maxSpeed = Math.max(...successfulSpeeds);
                downloadElement.textContent = maxSpeed.toFixed(2);
            } else {
                downloadElement.textContent = '0.00';
            }
        } catch (error) {
            console.error('Download test error:', error);
            downloadElement.textContent = '0.00';
        }
    }

    // Простой и надежный измеритель скорости загрузки
    async simpleDownloadSpeed(url) {
        try {
            const startTime = performance.now();
            const response = await fetch(url + '?t=' + Date.now(), { 
                cache: 'no-cache',
                mode: 'cors'
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            // Читаем весь файл
            const blob = await response.blob();
            const endTime = performance.now();
            
            const duration = (endTime - startTime) / 1000; // в секундах
            const bytes = blob.size;
            const mbps = (bytes * 8) / (duration * 1000000); // Мбит/с
            
            return mbps;
        } catch (error) {
            console.error('Download speed measurement error:', error);
            return 0;
        }
    }

    // Исправленное измерение скорости отдачи
    async testRealUpload() {
        const uploadElement = document.getElementById('uploadSpeed');
        
        try {
            const testSizes = [1048576, 2097152]; // 1MB, 2MB
            let maxSpeed = 0;
            
            for (const size of testSizes) {
                const speed = await this.measureUploadSpeed(size);
                if (speed > maxSpeed) {
                    maxSpeed = speed;
                    uploadElement.textContent = speed.toFixed(2);
                }
            }
        } catch (error) {
            console.error('Upload test error:', error);
            uploadElement.textContent = '0.00';
        }
    }

    async measureUploadSpeed(dataSize) {
        try {
            // Создаем тестовые данные
            const testData = new Uint8Array(dataSize);
            for (let i = 0; i < dataSize; i++) {
                testData[i] = Math.floor(Math.random() * 256);
            }

            const uploadUrls = [
                'https://httpbin.org/post',
                'https://postman-echo.com/post'
            ];

            for (const url of uploadUrls) {
                try {
                    const startTime = performance.now();
                    
                    const response = await fetch(url, {
                        method: 'POST',
                        body: testData,
                        cache: 'no-cache',
                        headers: {
                            'Content-Type': 'application/octet-stream'
                        }
                    });

                    if (response.ok) {
                        const endTime = performance.now();
                        const duration = (endTime - startTime) / 1000; // секунды
                        const speedMbps = (dataSize * 8) / (duration * 1000000); // Мбит/с
                        return speedMbps;
                    }
                } catch (error) {
                    continue;
                }
            }

            return 0;
        } catch (error) {
            console.error('Upload measurement error:', error);
            return 0;
        }
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
