const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
const os = require('os');
const { shell } = require('electron')

var inputbar = document.getElementById('input');
inputbar.addEventListener("keyup", function(EnterPressed) {
  if (EnterPressed.keyCode === 13) {
    EnterPressed.preventDefault();
    newItem();
  }
});
function setTheme(arg) {
  if (arg == 'dark') {
    ipcRenderer.invoke('dark-mode:enabled');
    document.getElementById('darktheme').setAttribute('checked', 'checked');
    storage.set("theme", {"theme" : arg});
  }
  else if (arg == 'light') {
    ipcRenderer.invoke('dark-mode:disabled');
    document.getElementById('lighttheme').setAttribute('checked', 'checked');
    storage.set("theme", {"theme" : arg});
  }
  else if (arg == 'sys') {
    ipcRenderer.invoke('dark-mode:system');
    document.getElementById('systheme').setAttribute('checked', 'checked');
    storage.set("theme", {"theme" : arg});
  }
}
function setBlur(arg) {
  ipcRenderer.send('blurchange', arg);
  storage.set("blur", {"blurtype" : arg});
}
var listItem = document.querySelector('ul');
listItem.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('done');
    var content = document.getElementById("TodoList").innerHTML;
    ipcRenderer.send('savefile', content);
  }
}, false);
function newItem() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("input").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } 
  else {
    document.getElementById("TodoList").appendChild(li);
    document.getElementById("input").value = "";

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    var content = document.getElementById("TodoList").innerHTML;
    ipcRenderer.send('savefile', content);
  }
  

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.remove();
      var content = document.getElementById("TodoList").innerHTML;
      ipcRenderer.send('savefile', content);
    }
  }
}
function currentTime() {
    let date = new Date(); 
    let hh = date.getHours();
    let mm = date.getMinutes();
    hh = (hh < 10) ? "0" + hh : hh;
    mm = (mm < 10) ? "0" + mm : mm;  
    let time = hh + ":" + mm
    document.getElementById("time").innerText = "The time is " + time; 
    let t = setTimeout(function(){ currentTime() }, Infinity);
}
function currentDate() {
    let today = new Date();
    let day = today.getDay();
    if (day == 0) {dayName = "Sunday"}
    if (day == 1) {dayName = "Monday"}
    if (day == 2) {dayName = "Tuesday"}
    if (day == 3) {dayName = "Wednesday"}
    if (day == 4) {dayName = "Thursday"}
    if (day == 5) {dayName = "Friday"}
    if (day == 6) {dayName = "Saturday"}
    let dayNum = today.getDate();
    if (dayNum == 1 || dayNum == 21 || dayNum == 31) {suffix = "st"}
    if (dayNum == 2 || dayNum == 22) {suffix = "nd"}
    if (dayNum == 3 || dayNum == 23) {suffix = "rd"}
    if (dayNum >= 4 && dayNum != 31 && dayNum != 23 && dayNum != 22 && dayNum != 21) {suffix = "th"}
    let month = today.getMonth();
    if (month == 0) {monthName = " January"}
    if (month == 1) {monthName = " February"}
    if (month == 2) {monthName = " March"}
    if (month == 3) {monthName = " April"}
    if (month == 4) {monthName = " May"}
    if (month == 5) {monthName = " June"}
    if (month == 6) {monthName = " July"}
    if (month == 7) {monthName = " August"}
    if (month == 8) {monthName = " September"}
    if (month == 9) {monthName = " October"}
    if (month == 10) {monthName = " November"}
    if (month == 11) {monthName = " December"}
    let year = " " + today.getFullYear();
    let date = dayName + ", " + dayNum + suffix + monthName + year;
    document.getElementById("date").innerText = "Today is " + date;
    let t = setTimeout(function(){ currentTime() }, Infinity); 
}
currentTime();
currentDate();
let css = document.querySelector(':root');
let open = "0";
function sidebar() {
  if (open == "0") {
    document.getElementById("sidebar").style.width = "250px";
    css.style.setProperty('--filter', 'blur(5px)');
    document.getElementById("titlebar").style.setProperty('background-color', 'var(--sidebar-bg)');
    open = "1";
  }
  else if (open == "1") {
    document.getElementById("sidebar").style.width = "0";
    css.style.setProperty('--filter', 'none');
    document.getElementById("titlebar").style.setProperty('background-color', 'var(--titlebar-bg)');
    open = "0";
  }
}

ipcRenderer.on('filepath', (event, arg) => {
  console.log(arg);
});

ipcRenderer.send('request-mainprocess-action');

ipcRenderer.on('mainprocess-response', (event, arg) => {
  document.getElementById("TodoList").insertAdjacentHTML("beforeend", arg);
  var close = document.getElementsByClassName("close");
  var i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.remove();
      var content = document.getElementById("TodoList").innerHTML;
      ipcRenderer.send('savefile', content);
    }
  }
});
var arg;
ipcRenderer.send('request-datapath');
ipcRenderer.on('datapath', (event, arg) => {
  document.getElementById('head').insertAdjacentHTML('beforeend','<link rel="stylesheet" type="text/css" href="' + arg + (process.platform == 'win32' ? "\\" : "/") + "custom.css\">");
  storage.setDataPath(arg + (process.platform == 'win32' ? "\\" : "/") + "config");
  storage.get('opacity', function(error, data) {
    if (error) throw error;
    for(let value of Object.values(data)){
      console.log(value)
      css.style.setProperty('--bg-opacity', value);
    }
  });
  storage.get('theme', function(error, data) {
    if (error) throw error;
    for(let value of Object.values(data)){
      console.log(value);
      setTheme(value);
    }
  });
  storage.get('blur', function(error, data) {
    if (error) throw error;
    for(let value of Object.values(data)){
      console.log(value);
      setBlur(value);
    }
  });
  openDataPath(arg);
});
ipcRenderer.on('blurchange-error', (event, arg) => {
  alert("This option only works on windows.")
});
var opacitybar = document.getElementById('opacity-input');
function ChangeOpacity() {
  opacity = opacitybar.value;
  if (opacity <=1 && opacity >= 0) {
    css.style.setProperty('--bg-opacity', opacity);
    opacitybar.placeholder = opacity;
    opacitybar.value = '';
    storage.set('opacity', {"opacity" : opacity}, function(error) {
      if (error) throw error;
    });
  }
  else {
    alert("Invalid opacity. Please supply a number between 0 and 1.");
  }
}
opacitybar.addEventListener("keyup", function(EnterPressed) {
  if (EnterPressed.keyCode === 13) {
    EnterPressed.preventDefault();
    ChangeOpacity();
  }
});
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.remove();
    var content = document.getElementById("TodoList").innerHTML;
    ipcRenderer.send('savefile', content);
  }
}
function closeWin() {
  ipcRenderer.send('close-win');
}
function minimizeWin() {
  ipcRenderer.send('minimize-win');
}
function openDataPath(path) {
  document.getElementById('opendatapath').addEventListener("click", () => {
    shell.openPath(path)
  });
}
