const electron = require('electron');
const glasstron = require('glasstron');
const path = require('path');
const { ipcMain } = require('electron');
const fs = require('fs');

const datapath = electron.app.getPath('userData');
console.log(datapath);

if (fs.existsSync(datapath + (process.platform == 'win32' ? "\\" : "/") + "todo.xml")) {
  fs.readFile(datapath + (process.platform == 'win32' ? "\\" : "/") + "todo.xml", 'utf-8', (err, data) => {
    if(err){
      console.log("An error ocurred reading the file :" + err.message);
    }
    var todocontent = data;
    ipcMain.on('request-mainprocess-action', (event, arg) => {
      event.sender.send('mainprocess-response', todocontent);
    });
  });
}
else {
  fs.writeFile(datapath + (process.platform == 'win32' ? "\\" : "/") + "todo.xml", '', (err) => {
    if(err){
      console.log("An error ocurred creating the file "+ err.message)
    }
    console.log("New todo file created");
  });
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
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
  // Create the browser window.
  const win = new glasstron.BrowserWindow({
    width: 400,
    height: 800,
    minWidth: 400,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  console.log("do.app on " + process.platform);

  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, 'index.html'));
  if (process.platform == "win32") {
    win.blurType = "acrylic";
    acrylicWorkaround(win, 60);
    win.setBlur(true);
  }
  else if (process.platform == "linux") {
    win.blurType = "blurbehind";
    win.setBlur(true);
  }
  else if (process.platform == "darwin") {
    win.setVibrancy('fullscreen-ui');
    win.setBlur(true);
  }

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
};


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

electron.app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    spawnWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('savefile', (event, arg) => {
  fs.writeFile(datapath + (process.platform == 'win32' ? "\\" : "/") + "todo.xml", arg, (err) => {
    if(err){
      console.log("An error ocurred creating the file "+ err.message)
    }
    console.log("The file has been succesfully saved");
  });
});
  ipcMain.on('request-datapath', (event) => {
  event.sender.send('datapath', datapath);
});


// Acrylic Workaround from https://github.com/NyaomiDEV/Glasstron/blob/master/test/index.js
function acrylicWorkaround(win, pollingRate = 60){
  // Replace window moving behavior to fix mouse polling rate bug
  win.on("will-move", (e) => {
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
  });

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