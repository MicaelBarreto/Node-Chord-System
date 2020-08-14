const { app, BrowserWindow, Menu, ipcMain, remote } = require('electron');
const Service = require('./services/NodeService');

let win;
let musicWindow;
let newMusicWindow;

// Create new Window
const createWindow = () => {
  
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load HTML
  win.loadFile('views/index.html');

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);

};

// Create Menu
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Find Music',
                click() {
                    createMusicWindow();
                }
            },
            {
                label: 'Add Music',
                click() {
                    createNewMusicWindow();
                }
            },
            {
                label: 'Exit',
                click() {
                    app.quit();
                }
            }
        ],
    }
];

const createMusicWindow = () => {
    // Create new Window
    musicWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
        nodeIntegration: true
    }
    });

    // Load HTML
    musicWindow.loadFile('views/Musics.html');

    if(win) win.destroy();
    if(newMusicWindow) newMusicWindow.destroy();

    // musicWindow.webContents.openDevTools();
};

const createNewMusicWindow = () => {
    // Create new Window
    newMusicWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
          nodeIntegration: true
        }
    });

    // Load HTML
    newMusicWindow.loadFile('views/AddMusic.html');

    if(win) win.destroy();
    if(musicWindow) musicWindow.destroy();
};

app.whenReady().then(createWindow);

// ipc Listeners

// Catch music:add
ipcMain.on('music:add', async (e, payload) => {
    await Service.addNode(payload);
    createMusicWindow();
    newMusicWindow.close();
});

// Catch music:find
ipcMain.on('music:find', (e, payload) => {
    Service.succ(payload);
});

// Catch music:active
ipcMain.on('music:active', (e, payload) => {
    Service.changeNodeStatus(payload);
});

// Catch music:delete
ipcMain.on('music:delete', (e, payload) => {
    Service.removeNode(payload);
});

// Catch music:getAll
ipcMain.on('music:getAll', () => {
    Service.getNodes();
});

// Catch music:add
ipcMain.on('musics:get', async (e, payload) => {
    musicWindow.webContents.send('musics:get', payload);
});

// Catch logs:add
ipcMain.on('logs:add', (e, payload) => {
    musicWindow.webContents.send('logs:add', payload);
});

// Catch logs:response
ipcMain.on('logs:response', (e, payload) => {
    musicWindow.webContents.send('logs:response', payload);
});

// Catch handle:nodes
ipcMain.on('handle:nodes', () => {
    musicWindow.webContents.send('handle:nodes');
});

