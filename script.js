class SpeedTestRumax {
    constructor() {
        this.isRunning = false;
        this.currentServer = 'moscow';
        this.userIP = null;
        this.selectedRating = null;
        
        // Реальные тестовые файлы разных размеров
        this.testFiles = {
            small: 'https://proof.ovh.net/files/1Mb.dat',      // 1MB
            medium: 'https://proof.ovh.net/files/10Mb.dat',   // 10MB  
            large: 'https://proof.ovh.net/files/100Mb.dat',   // 100MB
            ping: 'https://httpbin.org/bytes/1024'            // 1KB для пинга
        };
        
        this.servers = {
            moscow: { name: 'Москва - Ростелеком', ping: 12 },
            spb: { name: 'Санкт-Петербург - МТС', ping: 25 },
            nsk: { name: 'Новосибирск - Билайн', ping: 45 },
            ekb: { name: 'Екатеринбург - Мегафон', ping: 38 },
            kzn: { name: 'Казань - Таттелеком', ping: 42 }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.displayUserIP();
        this.generateResultId();
        this.initRatingSystem();
        this.initShareButtons();
    }
    
    bindEvents() {
        // Кнопка начала теста
        document.getElementById('startTest').addEventListener('click', () => {
            if (!this.isRunning) {
                this.startSpeedTest();
            }
        });
        
        // Смена сервера
        document.getElementById('changeServer').addEventListener('click', () => {
            this.showServerModal();
        });
        
        // Модальное окно
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideServerModal();
        });
        
        // Выбор сервера
        document.querySelectorAll('.server-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const serverId = e.currentTarget.dataset.server;
                this.selectServer(serverId);
            });
        });
        
        // Закрытие модального окна по клику вне его
        document.getElementById('serverModal').addEventListener('click', (e) => {
            if (e.target.id === 'serverModal') {
                this.hideServerModal();
            }
        });
    }
    
    async displayUserIP() {
        const ipDisplay = document.getElementById('ipDisplay');
        
        try {
            // Пробуем несколько сервисов для получения IP
            const services = [
                'https://api.ipify.org?format=json',
                'https://ipapi.co/json/',
                'https://api.myip.com',
                'https://ipinfo.io/json'
            ];
            
            for (const service of services) {
                try {
                    const response = await fetch(service);
                    const data = await response.json();
                    
                    // Разные сервисы возвращают IP в разных полях
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
            
            // Если все сервисы недоступны
            ipDisplay.textContent = 'Не определен';
            
        } catch (error) {
            ipDisplay.textContent = 'Ошибка определения';
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
        
        // Убираем выделение со всех кнопок
        ratingButtons.forEach(btn => {
            btn.classList.remove('selected', 'detractor', 'passive', 'promoter');
        });
        
        // Выделяем выбранную кнопку и определяем категорию
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
                
                switch(index) {
                    case 0: // Копировать ссылку
                        this.copyToClipboard(url);
                        this.showNotification('Ссылка скопирована!');
                        break;
                    case 1: // Email
                        window.open(`mailto:?subject=Тест скорости интернета&body=${encodeURIComponent(text)}`);
                        break;
                    case 2: // Соцсети
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
    
    showServerModal() {
        document.getElementById('serverModal').classList.add('active');
        document.querySelectorAll('.server-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.server === this.currentServer) {
                option.classList.add('selected');
            }
        });
    }
    
    hideServerModal() {
        document.getElementById('serverModal').classList.remove('active');
    }
    
    selectServer(serverId) {
        this.currentServer = serverId;
        const server = this.servers[serverId];
        
        const serverProvider = document.querySelector('.server-provider strong');
        const serverLocation = document.querySelector('.server-location');
        
        const [city, provider] = server.name.split(' - ');
        serverProvider.textContent = provider.toUpperCase();
        serverLocation.textContent = city + ', Россия';
        
        this.hideServerModal();
        this.showNotification(`Сервер изменен на ${city}`);
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
            
            // 1. РЕАЛЬНЫЙ тест пинга
            buttonText.textContent = 'ИЗМЕРЕНИЕ ПИНГА...';
            progress.style.width = '20%';
            await this.testRealPing();
            
            // 2. РЕАЛЬНЫЙ тест скорости загрузки
            buttonText.textContent = 'ТЕСТ ЗАГРУЗКИ...';
            progress.style.width = '60%';
            await this.testRealDownload();
            
            // 3. РЕАЛЬНЫЙ тест скорости отдачи
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
    
    // РЕАЛЬНОЕ измерение пинга
    async testRealPing() {
        const pingTimes = [];
        const pingElement = document.getElementById('pingValue');
        const jitterElement = document.getElementById('jitterValue');
        
        const pingUrls = [
            'https://httpbin.org/get',
            'https://api.github.com',
            'https://jsonplaceholder.typicode.com/posts/1',
            'https://httpbin.org/uuid'
        ];
        
        for (let i = 0; i < 10; i++) {
            const url = pingUrls[i % pingUrls.length] + '?t=' + Date.now();
            const startTime = performance.now();
            
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
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
            
            await this.sleep(100);
        }
        
        if (pingTimes.length > 0) {
            // Вычисляем реальный джиттер
            const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
            const variance = pingTimes.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pingTimes.length;
            const jitter = Math.round(Math.sqrt(variance));
            
            pingElement.textContent = Math.round(avgPing);
            jitterElement.textContent = jitter;
        }
    }
    
    // РЕАЛЬНОЕ измерение скорости загрузки
    async testRealDownload() {
        const downloadElement = document.getElementById('downloadSpeed');
        let maxSpeed = 0;
        
        try {
            // Используем несколько файлов для точности
            const testUrls = [
                'https://proof.ovh.net/files/10Mb.dat',
                'https://speedtest.selectel.ru/10MB.zip',
                'https://mirror.yandex.ru/speedtest/10mb.bin',
                'https://download.microsoft.com/download/2/0/E/20E90413-712F-438C-988E-FDAA79A8AC3D/dotnetfx35.exe'
            ];
            
            // Тестируем параллельно несколько соединений
            const promises = testUrls.slice(0, 3).map(url => this.measureDownloadSpeed(url, downloadElement));
            
            const results = await Promise.allSettled(promises);
            const successfulResults = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            if (successfulResults.length > 0) {
                maxSpeed = Math.max(...successfulResults);
                downloadElement.textContent = maxSpeed.toFixed(2);
            }
            
        } catch (error) {
            console.error('Download test error:', error);
            // Fallback к простому тесту
            await this.measureDownloadSpeed('https://httpbin.org/bytes/10485760', downloadElement);
        }
    }
    
    async measureDownloadSpeed(url, element) {
        const startTime = performance.now();
        let totalBytes = 0;
        
        try {
            const response = await fetch(url + '?t=' + Date.now(), {
                cache: 'no-cache'
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const reader = response.body.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                totalBytes += value.byteLength;
                const currentTime = performance.now();
                const duration = (currentTime - startTime) / 1000; // секунды
                
                if (duration > 0.5) { // Обновляем каждые 0.5 сек
                    const speedMbps = (totalBytes * 8) / (duration * 1000000); // Мбит/с
                    element.textContent = speedMbps.toFixed(2);
                }
                
                // Останавливаем через 15 секунд
                if (duration > 15) break;
            }
            
            const finalDuration = (performance.now() - startTime) / 1000;
            const finalSpeed = (totalBytes * 8) / (finalDuration * 1000000);
            
            return finalSpeed;
            
        } catch (error) {
            console.error('Download measurement error:', error);
            return 0;
        }
    }
    
    // РЕАЛЬНОЕ измерение скорости отдачи
    async testRealUpload() {
        const uploadElement = document.getElementById('uploadSpeed');
        
        try {
            // Создаем реальные данные для отправки
            const testSizes = [1048576, 2097152, 5242880]; // 1MB, 2MB, 5MB
            let maxSpeed = 0;
            
            for (const size of testSizes) {
                const speed = await this.measureUploadSpeed(size, uploadElement);
                if (speed > maxSpeed) {
                    maxSpeed = speed;
                    uploadElement.textContent = speed.toFixed(2);
                }
            }
            
        } catch (error) {
            console.error('Upload test error:', error);
        }
    }
    
    async measureUploadSpeed(dataSize, element) {
        try {
            // Создаем реальные данные
            const testData = new Uint8Array(dataSize);
            for (let i = 0; i < dataSize; i++) {
                testData[i] = Math.floor(Math.random() * 256);
            }
            
            const startTime = performance.now();
            
            // Отправляем на несколько endpoint'ов
            const uploadUrls = [
                'https://httpbin.org/post',
                'https://postman-echo.com/post',
                'https://reqres.in/api/users'
            ];
            
            for (const url of uploadUrls) {
                try {
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
                    continue; // Пробуем следующий URL
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
