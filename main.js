const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        autoHideMenuBar: true,
        menuBarVisible: false,
        backgroundColor: '#0f0f0f',
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        setTimeout(() => mainWindow.show(), 1500);
    });
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('send-to-qwen', async (event, userMessage) => {
    try {
        const API_KEY = process.env.QWEN_API_KEY;

        if (!API_KEY || API_KEY === 'your-api-key-here') throw new Error('API ключ не указан. Установите переменную окружения QWEN_API_KEY');

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'QwenChat'
            },
            body: JSON.stringify({
                model: 'qwen/qwen-2.5-72b-instruct',
                messages: [
                    { role: 'system', content: 'Ты полезный ассистент. Отвечай кратко и по делу.' },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));

            throw new Error(errData.error ? .message || `HTTP ${response.status}: Ошибка API`);
        }

        const data = await response.json();

        return data.choices[0].message.content;
    } catch (error) {
        console.error('Ошибка API:', error);

        throw error;
    }
});
