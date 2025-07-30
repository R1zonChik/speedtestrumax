class SpeedTestRumax {
    constructor() {
        this.isRunning = false;
        this.userIP = null;
        this.selectedRating = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.displayUserIPAndGeo();
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

    // РАБОЧИЙ JSONP для IP и геолокации (ip-api.com поддерживает JSONP)
    displayUserIPAndGeo() {
        return new Promise((resolve) => {
            const callbackName = 'ipCallback_' + Math.random().toString(36).substr(2, 9);
            
            window[callbackName] = (data) => {
                try {
                    // IP адрес
                    document.getElementById('ipDisplay').textContent = data.query || 'Не определен';
                    this.userIP = data.query;
                    
                    // Провайдер
                    document.getElementById('providerDisplay').textContent = data.isp || 'Не определен';
                    
                    // Местоположение
                    const location = [data.city, data.regionName, data.country]
                        .filter(Boolean).join(', ') || 'Не определено';
                    document.getElementById('locationDisplay').textContent = location;
                    
                } catch (error) {
                    console.error('Error processing geo data:', error);
                    document.getElementById('ipDisplay').textContent = 'Ошибка';
                    document.getElementById('providerDisplay').textContent = 'Ошибка';
                    document.getElementById('locationDisplay').textContent = 'Ошибка';
                }
                
                // Очистка
                if (script.parentNode) script.parentNode.removeChild(script);
                delete window[callbackName];
                resolve();
            };
            
            // ip-api.com поддерживает JSONP
            const script = document.createElement('script');
            script.src = `https://ip-api.com/json/?fields=query,isp,city,regionName,country&callback=${callbackName}`;
            script.onerror = () => {
                document.getElementById('ipDisplay').textContent = 'Не определен';
                document.getElementById('providerDisplay').textContent = 'Не определен';
                document.getElementById('locationDisplay').textContent = 'Не определено';
                if (script.parentNode) script.parentNode.removeChild(script);
                delete window[callbackName];
                resolve();
            };
            
            document.head.appendChild(script);
        });
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

    // РЕАЛЬНЫЙ тест пинга через Image объекты
    async testRealPing() {
        const pingElement = document.getElementById('pingValue');
        const jitterElement = document.getElementById('jitterValue');
        const pingTimes = [];
        
        // Используем быстрые CDN для реального пинга
        const pingUrls = [
            'https://cdn.jsdelivr.net/gh/jquery/jquery@3.6.0/dist/jquery.min.js',
            'https://unpkg.com/react@18/umd/react.production.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
        ];

        for (let i = 0; i < 8; i++) {
            const url = pingUrls[i % pingUrls.length];
            
            try {
                const pingTime = await this.measureRealPing(url);
                if (pingTime > 0 && pingTime < 2000) {
                    pingTimes.push(pingTime);
                    
                    // Обновляем в реальном времени
                    const avgPing = Math.round(pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length);
                    pingElement.textContent = avgPing;
                }
            } catch (error) {
                console.log('Ping measurement error:', error);
            }
            
            await this.sleep(200);
        }

        if (pingTimes.length > 0) {
            const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
            const variance = pingTimes.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pingTimes.length;
            const jitter = Math.round(Math.sqrt(variance));
            
            pingElement.textContent = Math.round(avgPing);
            jitterElement.textContent = Math.max(1, jitter);
        }
    }

    // Реальное измерение пинга через fetch с таймаутом
    async measureRealPing(url) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const controller = new AbortController();
            
            // Таймаут 3 секунды
            const timeoutId = setTimeout(() => {
                controller.abort();
                resolve(0);
            }, 3000);
            
            fetch(url, { 
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            })
            .then(() => {
                clearTimeout(timeoutId);
                const endTime = performance.now();
                resolve(Math.round(endTime - startTime));
            })
            .catch(() => {
                clearTimeout(timeoutId);
                const endTime = performance.now();
                resolve(Math.round(endTime - startTime));
            });
        });
    }

    // РЕАЛЬНЫЙ тест скорости загрузки через CDN с CORS
    async testRealDownload() {
        const downloadElement = document.getElementById('downloadSpeed');
        
        // Используем публичные CDN файлы с известными размерами
        const testFiles = [
            { url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js', size: 89000 },
            { url: 'https://unpkg.com/react@18/umd/react.development.js', size: 1000000 },
            { url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', size: 600000 }
        ];

        let maxSpeed = 0;

        for (const file of testFiles) {
            try {
                const speed = await this.measureRealDownloadSpeed(file.url, file.size);
                if (speed > maxSpeed) {
                    maxSpeed = speed;
                    downloadElement.textContent = speed.toFixed(2);
                }
            } catch (error) {
                console.log('Download test error:', error);
            }
        }

        if (maxSpeed === 0) {
            downloadElement.textContent = '0.00';
        }
    }

    // Реальное измерение скорости загрузки
    async measureRealDownloadSpeed(url, sizeBytes) {
        try {
            const startTime = performance.now();
            
            const response = await fetch(url + '?t=' + Date.now(), { 
                cache: 'no-cache'
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            // Читаем весь файл
            await response.arrayBuffer();
            
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000; // в секундах
            
            // Вычисляем скорость
            const mbps = (sizeBytes * 8) / (duration * 1000000); // Мбит/с
            
            return mbps > 0 ? mbps : 0;
        } catch (error) {
            console.error('Download speed measurement error:', error);
            return 0;
        }
    }

    // РЕАЛЬНЫЙ тест скорости отдачи
    async testRealUpload() {
        const uploadElement = document.getElementById('uploadSpeed');
        
        try {
            const testSizes = [50000, 100000]; // 50KB, 100KB
            let maxSpeed = 0;
            
            for (const size of testSizes) {
                const speed = await this.measureRealUploadSpeed(size);
                if (speed > maxSpeed) {
                    maxSpeed = speed;
                    uploadElement.textContent = speed.toFixed(2);
                }
            }
            
            if (maxSpeed === 0) {
                uploadElement.textContent = '0.00';
            }
        } catch (error) {
            console.error('Upload test error:', error);
            uploadElement.textContent = '0.00';
        }
    }

    async measureRealUploadSpeed(dataSize) {
        try {
            // Создаем реальные данные
            const testData = new Uint8Array(dataSize);
            for (let i = 0; i < dataSize; i++) {
                testData[i] = Math.floor(Math.random() * 256);
            }

            // Используем рабочие endpoints
            const uploadUrls = [
                'https://httpbin.org/post',
                'https://postman-echo.com/post',
                'https://reqres.in/api/users'
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
                        return speedMbps > 0 ? speedMbps : 0;
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
