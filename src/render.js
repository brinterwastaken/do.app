const { ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
const os = require('os');
const { shell } = require('electron');

ipcRenderer.send('request-datapath');
ipcRenderer.on('datapath', (event, arg) => {
  document.getElementById('head').insertAdjacentHTML('beforeend','<link rel="stylesheet" type="text/css" href="' + arg + (process.platform == 'win32' ? "\\" : "/") + "custom.css\">");
  storage.setDataPath(arg);
  storage.get('config', function(error, data) {
    if (error) throw error;
    console.log(data)
    css.style.setProperty('--bg-opacity', data.opacity)
    opacitybar.value = (data.opacity * 100)/5
    opacitydisp.innerText = data.opacity * 100 + "%"
    setTheme(data.theme);
    css.style.setProperty('--accent', data.accent)
    accentpicker.value = data.accent
    accentdisp.innerText = data.accent
    getTodo()
  });
  openDataPath(arg);
});

var inputbar = document.getElementById('input');
inputbar.addEventListener("keyup", function(EnterPressed) {
  if (EnterPressed.keyCode === 13) {
    EnterPressed.preventDefault();
    newItem();
  }
});
function setTheme(arg) {
  var conf = {"theme" : arg, "opacity" : storage.getSync('config').opacity, "accent" : storage.getSync('config').accent}
  if (arg == 'dark') {
    ipcRenderer.invoke('dark-mode:enabled');
    document.getElementById('darktheme').setAttribute('checked', 'checked');
    storage.set('config', conf, {prettyPrinting: true});
  }
  else if (arg == 'light') {
    ipcRenderer.invoke('dark-mode:disabled');
    document.getElementById('lighttheme').setAttribute('checked', 'checked');
    storage.set('config', conf, {prettyPrinting: true});
  }
  else if (arg == 'sys') {
    ipcRenderer.invoke('dark-mode:system');
    document.getElementById('systheme').setAttribute('checked', 'checked');
    storage.set('config', conf, {prettyPrinting: true});
  }
}
var listItem = document.querySelector('#TodoList');
listItem.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('done');
    updateTodo();
  }
}, false);
function newItem() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("input").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '' || inputValue === ' ') {
    ipcRenderer.send('errbox', ["Invalid Input", `"${inputValue}" cannot be added as a task. (Are you bored with nothing to do?)`])
  } 
  else {
    listItem.appendChild(li);
    document.getElementById("input").value = "";

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("");
    span.className = "close nf";
    span.appendChild(txt);
    li.appendChild(span);

    updateTodo();
  }
  
}
function currentTime() {
    let date = new Date(); 
    let hh = date.getHours();
    let mm = date.getMinutes();
    hh = (hh < 10) ? "0" + hh : hh;
    mm = (mm < 10) ? "0" + mm : mm;  
    let time = hh + ":" + mm
    document.getElementById("time").innerText = time; 
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
    document.getElementById("date").innerText = date;
    let t = setTimeout(function(){ currentTime() }, Infinity); 
}
currentTime();
currentDate();
let css = document.querySelector(':root');
let open = "0";
function sidebar() {
  if (open == "0") {
    document.getElementById("sidebar").style.width = "250px";
    css.style.setProperty('--filter', 'blur(15px)');
    document.querySelector('.main').style.setProperty('pointer-events', 'none');
    document.getElementById("titlebar").style.setProperty('background-color', 'var(--sidebar-bg)');
    open = "1";
  }
  else if (open == "1") {
    document.getElementById("sidebar").style.width = "0";
    css.style.setProperty('--filter', 'none');
    document.querySelector('.main').style.setProperty('pointer-events', 'all');
    document.getElementById("titlebar").style.setProperty('background-color', 'var(--titlebar-bg)');
    open = "0";
  }
}

ipcRenderer.on('filepath', (event, arg) => {
  console.log(arg);
});

/*
ipcRenderer.send('request-mainprocess-action');

ipcRenderer.on('mainprocess-response', (event, arg) => {
  document.getElementById("TodoList").insertAdjacentHTML("beforeend", arg);
  updateTodo();
});
*/
var opacitybar = document.getElementById('opacity-slider');
var opacitydisp = document.getElementById('opacity-value');
var accentpicker = document.getElementById('accent-selector');
var accentdisp = document.getElementById('accent-value');
opacitybar.addEventListener('input', () => {
  opacitydisp.innerText = opacitybar.value * 5 + "%"
  opacity = (opacitybar.value * 5)/100;
  css.style.setProperty('--bg-opacity', opacity);
  var conf = {"theme" : storage.getSync('config').theme, "opacity" : opacity, "accent" : storage.getSync('config').accent}
  storage.set('config', conf, {prettyPrinting: true})
});
accentpicker.addEventListener('change', () => {
  css.style.setProperty('--accent', accentpicker.value);
  var conf = {"theme" : storage.getSync('config').theme, "opacity" : storage.getSync('config').opacity, "accent" : accentpicker.value}
  storage.set('config', conf, {prettyPrinting: true})
  accentdisp.innerText = accentpicker.value
});
accentdisp.addEventListener('click', () => {
  navigator.clipboard.writeText(accentdisp.innerText);
  accentdisp.innerText = "Copied!"
  setTimeout(() => {accentdisp.innerText = accentpicker.value}, 2500)
})
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

function updateTodo() {
  var arr = Array.prototype.slice.call(listItem.children)
  var obj = {}
  arr.forEach((e, i) => {
    obj[i] = [e.innerText.slice(0, -2), e.classList[0] == 'done' ? 'done' : '']
  })
  console.log(obj)
  storage.set('todolist', obj, {prettyPrinting: true})
  close = document.getElementsByClassName("close");
  
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      this.parentElement.remove()
      updateTodo()
    }
  }
}

function getTodo() {
  storage.get('todolist', (err, data) => {
    if (err) {
      throw err
    }
    for (i=0; i<Object.entries(data).length; i++) {
      console.log('key: ' + i + ' value: ' + data[i])
      console.log(data[i])

      var li = document.createElement("li");
      li.appendChild(document.createTextNode(data[i][0]));

      var span = document.createElement("span");
      span.className = "close nf";
      span.appendChild(document.createTextNode(""));

      li.appendChild(span);
      listItem.appendChild(li)
      
      li.classList = data[i][1]
    }
    updateTodo()
  })
}