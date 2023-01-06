const electron = require('electron');
const glasstron = require('glasstron-clarity');
const path = require('path');
const { ipcMain } = require('electron');
const fs = require('fs');

const datapath = electron.app.getPath('userData');
console.log(datapath);

if (require('electron-squirrel-startup')) {
  electron.app.quit();
}

electron.app.commandLine.appendSwitch("enable-transparent-visuals");
electron.app.on('ready', () => {
  setTimeout(
    spawnWindow,
    process.platform == "linux" ? 1000 : 0
    // Electron has a bug on linux where it
    // won't initialize properly when using
    // transparency. To work around that, it
    // is necessary to delay the window
    // spawn function.
  );
});

const spawnWindow = () => {
  const win = new glasstron.BrowserWindow({
    width: 400,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    frame: false,
    vibrancy: "sidebar",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  console.log("do.app on " + process.platform);

  win.loadFile(path.join(__dirname, 'index.html'));
  if (process.platform == "win32" || process.platform == "linux") {
    win.setBlur(true);
  }
  else if (process.platform == "darwin") {
    win.vibrancy = "sidebar";
    win.setBlur(true);
  }

  win.setIcon(path.join(__dirname, 'icon.png'))

  ipcMain.handle('dark-mode:disabled', () => {
    electron.nativeTheme.themeSource = 'light'
  });
  ipcMain.handle('dark-mode:enabled', () => {
    electron.nativeTheme.themeSource = 'dark'
  });
  ipcMain.handle('dark-mode:system', () => {
    electron.nativeTheme.themeSource = 'system'
  });
  ipcMain.on('close-win', (event, arg) => {
    win.close();
  });
  ipcMain.on('minimize-win', (event, arg) => {
    win.minimize();
  });

  acrylicWorkaround(win, 70)
};

electron.app.on('activate', () => {
  if (glasstron.BrowserWindow.getAllWindows().length === 0) {
    spawnWindow();
  }
});

ipcMain.on('request-datapath', (event) => {
  event.sender.send('datapath', datapath);
});
ipcMain.on('errbox', (event, args) => {
  electron.dialog.showErrorBox(args[0], args[1])
})

// Acrylic Workaround from https://github.com/NyaomiDEV/Glasstron/blob/master/test/index.js
function acrylicWorkaround(win, pollingRate = 60){
  // Replace window moving behavior to fix mouse polling rate bug

  /*win.on("will-move", (e) => {
    if(win.blurType !== "acrylic")
      return;
    
    e.preventDefault();

    // Track if the user is moving the window
    if(win._moveTimeout)
      clearTimeout(win._moveTimeout);

    win._moveTimeout = setTimeout(
      () => {
        win._isMoving = false;
        clearInterval(win._moveInterval);
        win._moveInterval = null;
      }, 1000/pollingRate);

    // Start new behavior if not already
    if(!win._isMoving){
      win._isMoving = true;
      if(win._moveInterval)
        return false;

      // Get start positions
      win._moveLastUpdate = 0;
      win._moveStartBounds = win.getBounds();
      win._moveStartCursor = electron.screen.getCursorScreenPoint();

      // Poll at (refreshRate * 10) hz while moving window
      win._moveInterval = setInterval(() => {
        const now = Date.now();
        if(now >= win._moveLastUpdate + (1000/pollingRate)){
          win._moveLastUpdate = now;
          const cursor = electron.screen.getCursorScreenPoint();

          // Set new position
          win.setBounds({
            x: win._moveStartBounds.x + (cursor.x - win._moveStartCursor.x),
            y: win._moveStartBounds.y + (cursor.y - win._moveStartCursor.y),
            width: win._moveStartBounds.width,
            height: win._moveStartBounds.height
          });
        }
      }, 1000/(pollingRate * 10));
    }
  });*/

  // Replace window resizing behavior to fix mouse polling rate bug
  win.on("will-resize", (e) => {
    if(win.blurType !== "acrylic")
      return;

    const now = Date.now();
    if(!win._resizeLastUpdate)
      win._resizeLastUpdate = 0;

    if(now >= win._resizeLastUpdate + (1000/pollingRate))
      win._resizeLastUpdate = now;
    else
      e.preventDefault();
  });
}
