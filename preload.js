const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (text) => ipcRenderer.invoke('send-to-qwen', text),

    getMusicUrl: () => {
        const rawPath = 'D:/Music Wuwa/Wuthering_Waves_-_A_Splash_of_True_Colors_Throttle_Up_(SkySound.cc).mp3';

        return 'file:///' + rawPath.replace(/\\/g, '/').replace(/ /g, '%20');
    }
});
