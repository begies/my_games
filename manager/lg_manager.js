/**************************************************************/
// lg_manger.js
//
// Written by mr Bob, Term 2 2019
// Log to console if logIt is y
// v1 base code
// v2 alter from true/false to y/n as session storage only stores strings
/**********************************************p_debug ****************/
MODULENAME = "lg_manager.js";

const COL_FUNC    = 'brown';
const COL_INFO    = 'black'; 
const COL_WARN    = 'yellow'; 
const COL_SUCCESS = 'blue';
const COL_ERROR   = 'red';

const SSLOGIT     = 'logIt';
var   logIt       = 'y';
lg_console(MODULENAME, '\n--------------------', 'blue');

/**************************************************************/
// If session storage for logIt not set, set it
// Else get it
/**************************************************************/
if (!sessionStorage.getItem(SSLOGIT)) {
  sessionStorage.setItem(SSLOGIT, logIt);
} else {
  logIt = sessionStorage.getItem(SSLOGIT);
}
p_debug.textContent = logIt;

/**************************************************************/
// Register key event for debug setting
/**************************************************************/
document.getElementById("to_focus");
document.addEventListener("keydown", function(event) {
  if (event.ctrlKey && event.key === "b") {
    logIt = sessionStorage.getItem(SSLOGIT);
    console.log('html_buildCanvas: registered key event. logIt was ' + logIt);
    if (logIt == 'y') {
      logIt = 'n';
    }
    else {
      logIt = 'y';
    }
    sessionStorage.setItem(SSLOGIT, logIt);
    p_debug.textContent = logIt;
  }
});

/**************************************************************/
// lg_console(_function, _text, _colour)
// Called by various
// Log information to console if logIt is y
// Input:  calling function, text to display, colour code
//         If calling function = "%" use console.table
//                               "&" use just console.log
// Return: n/a
/**************************************************************/
function lg_console(_function, _text, _colour) {	
  if (logIt == 'y') {
    if (_function == "%") {
      console.table(_text);
      return;
    }
    if (_function == "&") {
      console.log(_text);
      return;
    }
    
    if(_colour == COL_FUNC) {
      console.info("%c" + _function + ': '  + _text, "color:" + COL_FUNC);
    }
    else if (_colour == COL_INFO) {
      console.info("%c" + _function + ': '  + _text, "color:" + COL_INFO);
    }
    else if (_colour == COL_WARN) {
      console.warn("%c" + _function + ': '  + _text, "color:" + COL_WARN);
    }
    else if (_colour == COL_SUCCESS) {
      console.info("%c" + _function + ': '  + _text, "color:" + COL_SUCCESS);
    }
    else if (_colour == COL_ERROR) {
      console.error("%c" + _function + ': ' + _text, "color:" + COL_ERROR);
    } 
    else {
      console.log("%c" + _function + ': '   + _text, "color:" + _colour);
    }
  }
}

/**************************************************************/
//      END OF APP
/**************************************************************/