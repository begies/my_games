/**************************************************************/
// html_manager.mjs
//
// Written by Mr Bob, Term 4 2022
// Manage html 
//
// All variables & functions begin with html_  all const with HTML_
// Diagnostic code lines have a comment appended to them //DIAG
//
//  v01 Basic code.
//  v02 Rename all variable to html_ and const to HTML_
/**************************************************************/
const HTML_COL_C = 'black';
const HTML_COL_B = '#F0E68C';
console.log('%c html_manager.mjs',
            'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/      
// Import all constants & functions required from fb_io module
import { fb_authChanged } 
  from '/fb/fb_io.mjs';
  window.fb_authChanged        = fb_authChanged;

// Import all constants & functions required from fbR_manager module
import { fbR_initialize } 
  from '/fb/fbR_manager.mjs';
  window.fbR_initialize        = fbR_initialize;

/**************************************************************/
const HTML_NUMLBOARD = 10;

var html_cnv;
var html_canvasBuilt = false;
var html_gameTimer;
var html_interval;
var html_slideIndex  = 1;

/**************************************************************/
// html_index()
// Called by index.html onload
// Call firebase initialise & authChanged &
//  set default sessionStorage for debug
// Input:  n/a
// Return: n/a
/**************************************************************/
function html_index() {
  console.log('%c html_index(): ',
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  
  fbR_initialize();
  fb_authChanged();

  html_remAllClasses('b_login', 'w3-disabled');
  sessionStorage.setItem('fbD_debugStatus', fbD_debugStatus);
  p_debug.textContent = fbD_debugStatus;
}

/**************************************************************/
// html_load()
// Called by select_game.html, non index.html onload & GAME SELECTION button
// Get sessionStorage data & display user's photo & firebaee I/O status and
//  initialise firebase and run authChanged
// Input:  n/a
// Return: n/a
/**************************************************************/
function html_load() {
  console.log('%c html_load(): ',
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');

  fbD_userDetails          = JSON.parse(sessionStorage.getItem('googleLoginData'));
  fbD_userDetails.gameName = sessionStorage.getItem('ud_gameName');
  const IMG_PHOTOURL       = document.getElementById('img_photoURL');
  IMG_PHOTOURL.src         = fbD_userDetails.photoURL;
  const H_GAMENAME_ELEMENT = document.getElementById('h_gameName');
  if (H_GAMENAME_ELEMENT) {
    h_gameName.textContent = fbD_userDetails.gameName;
  }
  const B_ADMIN_ELEMENT    = document.getElementById('b_admin');
  if (B_ADMIN_ELEMENT) {
    b_admin.style.display  = sessionStorage.getItem('fb_adminStatus');
  }
  //p_msg.textContent      = sessionStorage.getItem('gameMsg');
  fbD_debugStatus         = sessionStorage.getItem('fbD_debugStatus');
  p_debug.textContent      = fbD_debugStatus;
  
  // Get fb I/O status from SessionStorage
  p_fbLogin.textContent    = sessionStorage.getItem('fb_loginStatus');
  p_fbReadRec.textContent  = sessionStorage.getItem('fb_readRecStatus');
  p_fbReadAll.textContent  = sessionStorage.getItem('fb_readAllStatus');
  p_fbWriteRec.textContent = sessionStorage.getItem('fb_writeRecStatus');
  p_fbReadOn.textContent   = sessionStorage.getItem('fb_readOnStatus');
  p_fbUpdateRec.textContent= sessionStorage.getItem('fb_updateRecStatus');
  p_fbDeleteRec.textContent= sessionStorage.getItem('fb_deleteStatus');

  fbR_initialize();
  fb_authChanged();      // Get DB permision error if you don't call this
  html_listen4Debug();
}

/**************************************************************/
// html_gameSelection(_slideClass, _buttonClass)
// Called by select_game.html onload & GAME SELECTION button
// Start slideshow
// Input:  html classes of slideshow images & associated buttons
// Return: n/a
/**************************************************************/
function html_gameSelection(_slideClass, _buttonClass) {
  console.log('%c html_gameSelection(): ',
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  
  html_interval = setInterval(html_slideshow, 2000, 
                              _slideClass, _buttonClass, true);
}

/**************************************************************/
// html_buildCanvas()
// Called ONLY ONCE 1st time any game is selected via ??_game()
// Build P5 canvas, position over & make it same size as 
//  d_canvasPlaceHolder  html div
// Input:  n/a
// Return: n/a
/**************************************************************/
function html_buildCanvas() {
  console.log('%c html_buildCanvas(): ',
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  
  clearInterval(html_interval);    // Clear any slideshow timer

  html_canvasBuilt = true;
  var html_cnvPos = document.getElementById("d_canvasPlaceHolder");

  var width = html_cnvPos.offsetWidth;
  var height = html_cnvPos.offsetHeight;

  var gameArea = new Canvas(html_cnvPos.offsetWidth - 32,
                            html_cnvPos.offsetHeight);
  console.log('%c html_buildCanvas(): width/height = ' + width + '/' + height, 
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  html_cnv = document.getElementById('defaultCanvas0');
  html_cnv.style.position = "absolute";
  html_cnv.style.left     = html_cnvPos.offsetLeft + 16 + 'px';
  html_cnv.style.top      = html_cnvPos.offsetTop  + 'px'; 
}

/**************************************************************/
// html_listen4Debug(_procFunc)
// Register keyboard keydown event
// To check if user wants sprite debug mode OR not
// Input:  n/a
// Return: n/a
/**************************************************************/
function html_listen4Debug(_procFunc) {
  console.log('%c html_listen4Debug(): ',
    'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');

  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
      console.log('%c html_listen4Debug(): ACTIVE',
        'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
        fbD_debugStatus = 'y';
        p_debug.textContent = fbD_debugStatus;
        sessionStorage.setItem('fbD_debugStatus', fbD_debugStatus);
        redraw();
    }
    else if (event.ctrlKey && event.key === 'x') {
      console.log('%c html_listen4Debug(): INACTIVE',
        'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
        fbD_debugStatus = 'n';
        p_debug.textContent = fbD_debugStatus;
        sessionStorage.setItem('fbD_debugStatus', fbD_debugStatus);
        redraw();
    }
  });
}

/**************************************************************/
// html_mouseTrail()
// Register mouse move event
// Originally from w3.schools
// Build & display a mouse trail of coloured balls
// Input:  n/a
// Return: n/a
/**************************************************************/
function html_mouseTrail() {
  console.log('%c html_mouseTrail(): ',
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  
  document.getElementById("defaultCanvas0").addEventListener("mousemove", function(e) {
    [1, 0.9, 0.8, 0.5, 0.1].forEach(function(i) {
      var j = (1 - i) * 50;
      var html_elem = document.createElement('div');
      var size = Math.ceil(Math.random() * 10 * i) + 'px';
      html_elem.style.position = 'fixed';
      html_elem.style.top = e.pageY + Math.round(Math.random() * j - j / 2) + 'px';
      html_elem.style.left = e.pageX + Math.round(Math.random() * j - j / 2) + 'px';
      html_elem.style.width = size;
      html_elem.style.height = size;
      html_elem.style.background = 'hsla(' + Math.round(Math.random() * 360) +
        ', ' + '100%, ' + '50%, ' + i + ')';
      html_elem.style.borderRadius = size;
      html_elem.style.pointerEvents = 'none';
      document.body.appendChild(html_elem);
      window.setTimeout(function() {
        document.body.removeChild(html_elem);
      }, Math.round(Math.random() * i * 500));
    });
  }, false);
}

/**************************************************************/
// html_volume(_audio)
// Register slider move event
// Change volume based on slider value
// Input:  array of audio objects to register slider listener for
// Return: n/a
/**************************************************************/
function html_volume(_audio) {
  console.log('%c html_volume(): audio= ' + _audio[0], 
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  
  var html_volumeSlider = document.getElementById('i_vol');
  html_volumeSlider.addEventListener("change", function(e) {
    for ( var i = 0; i < _audio.length; i++) {
      _audio[i].setVolume(e.currentTarget.value/100);
    }

    console.log('%c html_volume: audio= ' + _audio[0] +
               ' value = ' + e.currentTarget.value/100,
               'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';'); //DIAG
  })
}

/**************************************************************/
// html_posElement(_element, _newParent)
// Called by various
// Reposition & change size of element to new parent's pos & size
// Input:  element id to reposition & new parent
// Return: n/a
/**************************************************************/
function html_posElement(_element, _newParent) {
  console.log('%c html_posDiv(): ',
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');

  var html_newPos = document.getElementById(_newParent);
  console.log('%c html_posElement(): width/height = ' + html_newPos.offsetWidth + 
              '/' + html_newPos.offsetHeight + '  x/y= ' + html_newPos.offsetLeft + 
              '/' + html_newPos.offsetTop, 
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  
  var html_elem = document.getElementById(_element);
  html_elem.style.position = "absolute";
  html_elem.style.left     = html_newPos.offsetLeft + 'px';
  html_elem.style.top      = html_newPos.offsetTop  + 'px';
  html_elem.style.width    = html_newPos.offsetWidth  + 'px';
  html_elem.style.height   = html_newPos.offsetHeight + 'px';
}

/**************************************************************/
// html_slideshow(_slideClass, _buttonClass, _updateLink)
// Timer event: started by html_startSlideshow()
// Rotation of images to display & button to highlight
// Input:  html classes of slideshow images & associated buttons
//         updateLink = true/false to update nav link
// Return: n/a
/**************************************************************/
function html_slideshow(_slideClass, _buttonClass, _updateLink) {
  console.log('%c html_slideshow(): _slideClass= ' + _slideClass,
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  
  var html_slideElem  = document.getElementsByClassName(_slideClass);
  var html_buttonElem = document.getElementsByClassName(_buttonClass);
 
  html_slideIndex++;
  var html_prevIndex = mod((html_slideIndex-2), html_slideElem.length);
  var html_currIndex = mod((html_slideIndex-1), html_slideElem.length);
  
  html_slideElem[html_prevIndex].style.display = 'none';
  html_slideElem[html_currIndex].style.display = 'block';

  if (_updateLink) {
    html_buttonElem[html_prevIndex].style.fontWeight = 'normal';
    html_buttonElem[html_currIndex].style.fontWeight = 'bold';
  }
  // Use modulo math to determin index value
  function mod(n, m) {
    return ((n % m) + m) % m;
  }
}

/**************************************************************/
// html_hideShowClass(_class, _action)
// Called by various
// Hide or show an entire html class
// Input:  html class to hide or show
//         action; 'block' to show or 'none' to hide
// Return: n/a
/**************************************************************/
function html_hideShowClass(_class, _action) {
  console.log('%c html_hideShowClass(): class= ' + _class + 
              ' / action= ' + _action, 
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');

  var html_elem = document.getElementsByClassName(_class);
  for (i = 0; i < html_elem.length; i++) {
    html_elem[i].style.display = _action;  
  }
}

/**************************************************************/
// html_addClass(_targetClass, _newClass)
// Called by various 
// Add _newClass to all elements with target of _targetClass
// Input:  class to add to & target class to add
// Return: n/a
/**************************************************************/
function html_addClass(_targetClass, _newClass) {
	console.log('%c html_addClass(): _targetClass=' + _targetClass + 
		          ',  _newClass= ' + _newClass, 
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
		  
	// Select all the elements with example class.
	var html_classArray = document.getElementsByClassName(_targetClass);
    
	// Loop through the elements.
	for (var i = 0; i < html_classArray.length; i++) {
		html_classArray[i].classList.add(_newClass);
	}
}

/**************************************************************/
// html_remAllClasses(_targetClass, _remClass)
// Called by various
// Removes _remClass from all elements with the class of _targetClass
// Input:  target class to work on * class to remove 
// Return: n/a
/**************************************************************/
function html_remAllClasses(_targetClass, _remClass) {
	console.log('%c html_remAllClasses(): _targetClass=' + _targetClass +
              ',  _remClass= ' + _remClass, 
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
	
	// Select all the elements with example class.
	var html_classArray = document.getElementsByClassName(_targetClass);

	// Loop through the elements.
	for (var i = 0; i < html_classArray.length; i++) {
		html_classArray[i].classList.remove(_remClass);
	}
}

/**************************************************************/
// html_swapPage(_hide, _show)
// Called by various
// Hide page & show another page
// Input:  element id to hide & id to show
//         only action if input is not null
// Return: n/a
/**************************************************************/
function html_swapPage(_hide, _show) {
  console.log('%c html_swapPage(): hide= ' + _hide + ' / show= ' + _show,
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');

  if (_hide) {
    document.getElementById(_hide).style.display = "none";
  }
  if (_show) {
	  document.getElementById(_show).style.display = "block";
  }
}

/**************************************************************/
// windowResized()
// Input event; called when user resizes window
// Resize canvas to match
// Input:  n/a
// Return: n/a
/**************************************************************/
function windowResized() {
  // Retrieve width/height of d_canvasPlaceHolder DIV
  var cPlaceHolder = document.getElementById("d_canvasPlaceHolder");
	
  resizeCanvas(cPlaceHolder.offsetWidth - 16,
               cPlaceHolder.offsetHeight);
}


/*----------------------------------------------------*/
// Example of a template literal
/*----------------------------------------------------*/
/*
var simple = `This is a template 
              literal`;
console.log("%c" + simple, "color: blue");

var firstName = 'John',
    lastName  = 'Doe';

var greeting = `Hi ${firstName}, ${lastName}`;
console.log("%c" + greeting, "color: blue"); // Hi John, Doe
console.log("%c------------------------------", "color: blue");
*/

/**************************************************************/
// html_buildTable(_h_lb, _array, _usersRow))
// Called by fbR_procLeaderboard()
// Build html table from an array of objects
// Input:  html id of element to place array after, array of objects
//         & row num of user's entry
// Return: n/a
/**************************************************************/
function html_buildTable(_h_lb, _array, _usersRow) {
  console.log('%c html_buildTable(): usersRow= ' + _usersRow, 
              'color: ' + HTML_COL_C + '; background-color: ' + HTML_COL_B + ';');
  //console.log(_array);  //DIAG

  // Remove uid & photoURL from array - not needed for leaderboard
  _array = _array.map(function(item) {
    delete item.uid;
    delete item.photoURL;
    // Ensure gameName is the first property
    if (item.gameName) {
      let { gameName, ...rest } = item;
      return { gameName, ...rest };
    }
    return item;
  });
  

  $("table").remove("#t_lb");  // Clear html table with id of t_lb

  var html_locator = document.getElementById(_h_lb);   
  html_locator.insertAdjacentHTML("afterend", 
        `<table id='t_lb' class="w3-table-all w3-border w3-hoverable">
          <tr><th>${Object.keys(_array[0]).join('</th><th>')}</th></tr>
          ${_array.map(e => `<tr><td>${Object.values(e).join('</td><td>')}</td></tr>`).join('')}
        </table>`);

  // Set user's row to bold
  var html_table = document.getElementById('t_lb'); 
  var html_row = html_table.rows.item(_usersRow + 1);
  if (html_row) {
    html_row.style.fontWeight = 'bold';
  }
}

/**************************************************************/
// addEventListener('mousemove')
// Mouse move event
// Originally from w3.schools
// Build & display a mouse trail of coloured balls
// Input:  n/a
// Return: n/a
/**************************************************************/
/*
document.getElementById("defaultCanvas0").addEventListener("mousemove", function(e) {
  [1, 0.9, 0.8, 0.5, 0.1].forEach(function(i) {
    var j = (1 - i) * 50;
    var html_elem = document.createElement('div');
    var size = Math.ceil(Math.random() * 10 * i) + 'px';
    html_elem.style.position = 'fixed';
    html_elem.style.top = e.pageY + Math.round(Math.random() * j - j / 2) + 'px';
    html_elem.style.left = e.pageX + Math.round(Math.random() * j - j / 2) + 'px';
    html_elem.style.width = size;
    html_elem.style.height = size;
    html_elem.style.background = 'hsla(' + Math.round(Math.random() * 360) +
      ', ' + '100%, ' + '50%, ' + i + ')';
    html_elem.style.borderRadius = size;
    html_elem.style.pointerEvents = 'none';
    document.body.appendChild(html_elem);
    window.setTimeout(function() {
      document.body.removeChild(html_elem);
    }, Math.round(Math.random() * i * 500));
  });
}, false);
*/

/**************************************************************/
// EXPORT FUNCTIONS
// List all the functions called by code or html outside of this module
/**************************************************************/
export { HTML_NUMLBOARD,
         html_index, html_load, html_gameSelection, html_buildCanvas,  
         html_mouseTrail, html_volume, html_posElement,
         html_slideshow, html_hideShowClass, html_addClass,
         html_remAllClasses, html_swapPage, windowResized, html_buildTable };

/**************************************************************/
// END OF CODE
/**************************************************************/