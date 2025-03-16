let isRunning = false;
let currentVisit = 0;
let totalVisits = 0;
let delay = 1000;
let timeoutIds = [];

document.getElementById('startButton').addEventListener('click', startProcess);
document.getElementById('stopButton').addEventListener('click', stopProcess);
document.getElementById('resetButton').addEventListener('click', resetProcess);

function startProcess() {
    const url = document.getElementById('url').value;
    totalVisits = parseInt(document.getElementById('visitCount').value, 10);
    delay = parseInt(document.getElementById('delay').value, 10);

    if (!url || !totalVisits || totalVisits < 1) {
        logToConsole('Please enter a valid URL and number of visits.', 'error');
        playSound('error');
        return;
    }

    isRunning = true;
    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
    document.getElementById('resetButton').disabled = true;

    logToConsole('Process started...', 'info');
    playSound('warning');

    for (let i = 1; i <= totalVisits; i++) {
        const timeoutId = setTimeout(() => {
            if (!isRunning) return;

            currentVisit = i;
            simulateVisit(url, i);
            updateProgressBar(i, totalVisits);

            // Jika semua kunjungan selesai, otomatis berhenti
            if (i === totalVisits) {
                stopProcess();
                logToConsole('All visits completed. Process stopped.', 'info');
            }
        }, i * delay + Math.random() * 1000); // Tambahkan delay acak

        timeoutIds.push(timeoutId);
    }
}

function stopProcess() {
    isRunning = false;
    timeoutIds.forEach(clearTimeout); // Hentikan semua timeout yang sedang berjalan
    timeoutIds = [];

    document.getElementById('startButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
    document.getElementById('resetButton').disabled = false;

    logToConsole('Process stopped.', 'warning');
    playSound('warning');
}

function resetProcess() {
    isRunning = false;
    timeoutIds.forEach(clearTimeout);
    timeoutIds = [];
    currentVisit = 0;

    document.getElementById('startButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
    document.getElementById('resetButton').disabled = true;

    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = '0% Complete';

    document.getElementById('consoleLog').innerHTML = '';
    logToConsole('Process reset.', 'info');
    playSound('warning');
}

function simulateVisit(url, visitNumber) {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.203'
    ];

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const startTime = Date.now();

    // Update iframe preview
    const webPreview = document.getElementById('webPreview');
    webPreview.src = url;

    // Gunakan iframe untuk menghindari masalah CORS
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none'; // Sembunyikan iframe
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        logToConsole(`Visit ${visitNumber}: Successfully loaded ${url} (Time: ${responseTime}ms) with User-Agent: ${randomUserAgent}`, 'success');
        playSound('success');
        document.body.removeChild(iframe); // Hapus iframe setelah selesai
    };

    iframe.onerror = () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        logToConsole(`Visit ${visitNumber}: Error - Failed to load ${url} (Time: ${responseTime}ms)`, 'error');
        playSound('error');
        document.body.removeChild(iframe); // Hapus iframe jika gagal
    };
}

function updateProgressBar(current, total) {
    const progress = (current / total) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${Math.round(progress)}% Complete`;
}

function logToConsole(message, type = 'info') {
    const consoleLog = document.getElementById('consoleLog');
    const logEntry = document.createElement('div');

    // Tambahkan kelas berdasarkan jenis log
    switch (type) {
        case 'info':
            logEntry.classList.add('text-blue-400');
            break;
        case 'success':
            logEntry.classList.add('text-green-400');
            break;
        case 'error':
            logEntry.classList.add('text-red-400');
            break;
        case 'warning':
            logEntry.classList.add('text-yellow-400');
            break;
    }

    // Tambahkan efek typing
    logEntry.textContent = ''; // Kosongkan teks terlebih dahulu
    consoleLog.appendChild(logEntry);

    let charIndex = 0;
    const typingEffect = setInterval(() => {
        if (charIndex < message.length) {
            logEntry.textContent += message[charIndex];
            charIndex++;
        } else {
            clearInterval(typingEffect);
        }
    }, 50); // Kecepatan typing (ms per karakter)

    // Auto scroll ke bawah
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function playSound(type) {
    const sound = document.getElementById(`${type}Sound`);
    if (sound) {
        sound.currentTime = 0; // Reset audio
        sound.play();
    }
}