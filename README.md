<center>
<img width="120" src="https://raw.githubusercontent.com/xXTgamerXx/do.app/main/src/icon.png">
  
## do.app

A simple, customizable Todo list app, made with Electron and Glasstron
</center>

___

Screenshot
----------

![](https://user-images.githubusercontent.com/72494265/198091708-00de108f-5ff0-4205-8557-2d684e17935b.png)  

Install
-------

Recommended- Build from source

1.  Install nodejs and npm
2.  Clone this repository
3.  Run-
    
        npm i
        # (Optional to run directly) npm start
        npm run make
        
    
4.  The application will be in the out directory.

Use release- Head to https://github.com/xXTgamerXx/do.app/releases and download the latest release.

Warning- This app is still in development, hence expect bugs and issues. If u have a suggestion or bug report please send on the issues tab.

Tips and Tricks
---------------

Config files are located at-

*   %AppData%\\do.app\\ on Windows
*   ~/.config/do.app/ on Linux and MacOS (I think)

You can open the configuration directory by clicking the button on the sidebar.

In this directory you can create a file called custom.css for custom css modifications. (Subject to change)

To change blur type on windows (v0.5.4 onwards), run setBlur({type}) in the console of inspector (Ctrl + Shift + I), where {type} can be one of 'acrylic' 'aero' or 'transparent' (Including the ''). Removed in v0.5.6