/**************************************************************/
// fbR_manager.mjs
//
// Written by Mr Bob, Term 4 2022
// Firebase routine manager:
//  Initialize firebase
//  Handle login
//  Process all firebase promises
//  Update html interface with success/failure of firebase I/O
//
// All variables & function begin with fbR_  all const with FBR_
// Diagnostic code lines have a comment appended to them //DIAG
//
// v01 Basic code.
// v02 Convert to modular API
/**************************************************************/
const FBR_COL_C = 'white';
const FBR_COL_B = 'brown';
console.log('%c fbR_manager.mjs',
            'color: blue; background-color: white;');

var FBR_GAMEDB;

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all the methods you want to call from the firebase modules
import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase } 
  from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Import all constants & functions required from html_manager module
import { html_buildTable } 
  from '/manager/html_manager.mjs';

// Import all constants & functions required from fb_io module
import { fb_authChanged, fb_readRec } 
  from '/fb/fb_io.mjs';

/**************************************************************/
// Firebase initialisation 
function fbR_initialize() {
  console.log('%c fbR_initialise: ', 
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  const FBR_GAMECONFIG = {
    apiKey: "AIzaSyCSqf1GdfCl82X_xuWOo72IK8HBw1oLpAI",
    authDomain: "comp-2022-bobby-bob.firebaseapp.com",
    databaseURL: "https://comp-2022-bobby-bob-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "comp-2022-bobby-bob",
    storageBucket: "comp-2022-bobby-bob.appspot.com",
    messagingSenderId: "672130293901",
    appId: "1:672130293901:web:e3673bc2149fc92ca782c4",
    measurementId: "G-Q0EM45G29Q"
  };

  const FBR_GAMEAPP = initializeApp(FBR_GAMECONFIG);
  FBR_GAMEDB  = getDatabase(FBR_GAMEAPP);
  console.info(FBR_GAMEDB);         //DIAG
}

/**************************************************************/
// fbR_procLogin(_loginStatus, _user, _fbD_userDetails, _error)
// Called by fb_login once login is completed
// Save login details and also to session storage
// Read user's fbD_userDetails to determine if already registered
// Read users's admin record to determine if user is ADMIN
// Input:  login status('logged in', 'logged out', 'logged in via popup'), 
//         Google login object, where to save user details & 
//         error msg if any
// Return: n/a
/**************************************************************/
//           _procFunc(fb_loginStatus, user, _save, error);
function fbR_procLogin(_loginStatus, _user, _fbD_userDetails, _error) {
  console.log('%c fbR_procLogin(): status = ' + _loginStatus, 
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  if (_error != null) {
      console.error('Login failed: ' + _error.code + ', ' + _error.message);
      alert('Login failed:\n' + _error.code + '\n' + _error.message);
    }

  else {
    _fbD_userDetails.uid      = _user.uid;
    _fbD_userDetails.email    = _user.email;
    _fbD_userDetails.name     = _user.displayName;
    _fbD_userDetails.photoURL = _user.photoURL;

    sessionStorage.setItem('googleLoginData', JSON.stringify(_fbD_userDetails));
    sessionStorage.setItem('fb_loginStatus', _loginStatus);
    sessionStorage.setItem('fb_readRecStatus', " ");
    sessionStorage.setItem('fb_readAllStatus', " ");
    sessionStorage.setItem('fb_writeRecStatus', " ");
    sessionStorage.setItem('fb_readOnStatus', " ");
    sessionStorage.setItem('fb_deleteStatus', " ");
    sessionStorage.setItem('fb_updateRecStatus', " ");

    fb_readRec(DETAILS, _fbD_userDetails.uid, _fbD_userDetails,
      fbR_procRDETAILS);
  }
}

/**************************************************************/
// fbR_procRDETAILS(_result, _path, _key, _fb_data, _save, _error)
// Called by fb_readRec via fbR_procLogin() as part of login
// Save Google login data to session storage.
// If userDetail returns data, fire off read ADMIN to determine
//  if admin user.
//  Else user not registered so load registration page.
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//       _procFunc(fb_readRecStatus, _path, _key, fb_data, _save, error);
function fbR_procRDETAILS(_result, _path, _key, _fb_data, _save, _error) {
  console.log('%c fbR_procRDETAILS(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result, 
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  sessionStorage.setItem('fb_readRecStatus', _result);
  p_fbReadRec.textContent = _result;

  if (_result == 'OK') {
    sessionStorage.setItem('ud_gameName', _fb_data.gameName);
    fb_readRec(ADMIN, fbD_userDetails.uid, '', fbR_procRADMIN);
  }
  else if (_result == 'no record') {
    window.location = "html/reg.html";
  }
  else {
    console.error('DB read error for ' + _path + '/' + _key +
                  '\n' + _error);
    alert('DB read error for ' + _path + '/' + _key + 
                  '\nSee the console log for details');
  }
}

/**************************************************************/
// fbR_procRADMIN(_result, _path, _key, _fb_data, _save, _error)
// Called by fb_readRec
// Determine user's admin status, save it to session storage and
//  goto game selection page.
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//    _procFunc(fb_readRecStatus, _path, _key, fb_data, _save, error);
function fbR_procRADMIN(_result, _path, _key, _fb_data, _save, _error) {
  console.log('%c fbR_procRADMIN(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result, 
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  sessionStorage.setItem('fb_readRecStatus', _result);
  p_fbReadRec.textContent = _result;

  if (_result == 'OK') {
    var fbR_action = "block";// Admin user = show ADMIN btn
  }
  else if (_result == 'no record') {
    var fbR_action = "none"; // NOT admin user = don't show ADMIN btn
  }
  else {
    var fbR_action = "none"; // NOT admin user = don't show ADMIN btn
    console.error('DB read error for ' + _path + '/' + _key +
                  '\n' + _error);
    alert('DB read error for ' + _path + '/' + _key + 
                  '\nSee the console log for details');
  }

  // Save ADMIN status
  sessionStorage.setItem('fb_adminStatus', fbR_action);
  window.location = "html/select_game.html";
}

/**************************************************************/
// fbR_procWUD(_result, _path, _key, _data, _error)
// Called by fb_writeRec() via reg_regDetailsEntered() on
//  writing userDetails
// If write OK, launch game
// Input:  result('waiting...', 'OK', 'error'), path, 
//         data written & error msg if any
// Return: n/a
/**************************************************************/
//    _procFunc(fb_writeRecStatus, _path, _key, _data, error);
function fbR_procWUD(_result, _path, _key, _data, _error) {
  console.log('%c fbR_procWUD(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result, 
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  sessionStorage.setItem('fb_writeRecStatus', _result);
  p_fbWriteRec.textContent = _result;

  if (_result == 'OK') {
    window.location = "../html/select_game.html";
  }
  else {
    console.error('DB write error for ' + _path + '/' + _key +
                  '\n' + _error);
    alert('DB write error for ' + _path + '/' + _key + 
          '\nSee the console log for details');
  }
}

/**************************************************************/
// fbR_procWScore(_result, _path, _key, _data, _error)
// Called by fb_writeRec() via gameOver() 
// If write OK, update High Score display
// Input:  result('waiting...', 'OK', 'error'), path, key, 
//         data written & error msg if any
// Return: n/a
/**************************************************************/
//      _procFunc(fb_writeRecStatus, _path, _key, _data, error);
function fbR_procWScore(_result, _path, _key, _data, _error) {
  console.log('%c fbR_procWScore(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result,  
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  sessionStorage.setItem('fb_writeRecStatus', _result);
  p_fbWriteRec.textContent = _result;

  if (_result == 'OK') {
    // Deconstruct _data object, updating html High Score along the way
    let fbR_entries = Object.entries(_data);
    for (let i = 0; i < fbR_entries.length; i++) {
      if (fbR_entries[i][0] != 'uid') {
        document.getElementById('p_HS' + fbR_entries[i][0]).innerHTML = fbR_entries[i][1];
      }
    }
  }
  else {
    console.error('DB write error for ' + _path + '/' + _key +
                  '\n' + _error);
    alert('DB write error for ' + _path + '/' + _key + 
          '\nSee the console log for details');
  }
}

/**************************************************************/
// fbR_procRScore(_result, _path, _key, _fb_data, _save, _error)
// Called by fb_readRec()
// Save high scores ignoring uid and update display & session storage
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//    _procFunc(fb_readRecStatus, _path, _key, fb_data, _save, error);
function fbR_procRScore(_result, _path, _key, _fb_data, _save, _error) {
  console.log('%c fbR_procRScore(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result,  
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  sessionStorage.setItem('fb_readRecStatus', _result);
  p_fbReadRec.textContent = _result;

  // Deconstruct _dbdata object, updating _save object & html along the way
  if (_result == 'OK') {
    let fbR_entries = Object.entries(_fb_data);
    for (let i = 0; i < fbR_entries.length; i++) {
      if (fbR_entries[i][0] != 'uid') {
        _save[fbR_entries[i][0]] = fbR_entries[i][1];
        document.getElementById('p_HS' + fbR_entries[i][0]).innerHTML = fbR_entries[i][1];
      }
    }

    // Update session storage with user's High Score values
    sessionStorage.setItem('game_score', JSON.stringify(_fb_data));
  }
  else if (_result == 'no record') {
    // no high score record to display
  }
  else {
    console.error('DB read error for ' + _path + '/' + _key +
                  '\n' + _error);
    alert('DB read error for ' + _path + '/' + _key + 
          '\nSee the console log for details');
  }
}

/**************************************************************/
// fbR_procRTG(_result, _path, _key, _fb_data, _save, _error)
// Called by fb_readRec()
// Save high scores & update session storage
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//  _procFunc(fb_readRecStatus, _path, _key, fb_data, _save, error);
function fbR_procRTG(_result, _path, _key, _fb_data, _save, _error) {
  console.log('%c fbR_procRTG(): path= ' + _path + 
              '  result= ' + _result, 
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  sessionStorage.setItem('fb_readRecStatus', _result);
  p_fbReadRec.textContent = _result;
  
  if (_result == 'OK') {
    let entries = Object.entries(_fb_data);

    for (let i = 0; i < entries.length; i++) {
      _save[entries[i][0]] = entries[i][1];
    }
    
    sessionStorage.setItem('tg_score', JSON.stringify(_fb_data));

    loop();      // Ensure the values get displayed
  }
}

/**************************************************************/
// fbR_procLeaderboard(_result, _path, _snapshot, _save, 
//                     _sortKey, _num, _error)
// Called by fb_readAll()
// Create a sorted (DESCENDING) html table of the top _num 
//  leading game scores
// Input:  path, result('waiting...', 'OK', 'error'), snapshot, 
//         where to save it, sort key & num records & 
//         error msg if any
// Return: n/a
/**************************************************************/
//  
function fbR_procLeaderboard(_result, _path, _snapshot, _save,
                             _sortKey, _num, _error) {
  console.log('%c fbR_procLeaderboard(): path= ' + _path + 
              ' sortKey= ' + _sortKey + ' num= ' + _num  + 
              '  result= ' + _result,  
              'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');

  sessionStorage.setItem('fb_readAllStatus', _result);
  p_fbReadAll.textContent = _result;

  if (_result == 'OK') {
    _snapshot.forEach(function(childSnapshot) {
      // if you need access to the key...
      //var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      _save.push(childData);
      console.table(_save);
    });
  
    // Reverse order from ascending to descending order
    _save.reverse();

    // If user's score not in top _num, append their score onto the end
    var fbR_score = JSON.parse(sessionStorage.getItem('game_score'));
    var fbR_usersRow = _save.map(object => object.uid).indexOf(fbD_userDetails.uid);
    console.log('%c fbR_usersRow= ' + fbR_usersRow,     //DIAG
          'color: ' + FBR_COL_C + '; background-color: ' + FBR_COL_B + ';');
    if (fbR_usersRow == -1) {
      _save.push(fbR_score);
      fbR_usersRow = _save.length - 1;  // Indicate the row user's score is on
    }

    html_buildTable('h_lb', _save, fbR_usersRow);
  }
  else {
    console.error('DB read error for ' + _path + 
                  '\n' + _error);
    alert('DB read error for ' + _path + 
          '\nSee the console log for details');
  }
}

/**************************************************************/
// EXPORT FUNCTIONS
// List all the functions called by code or html outside of this module
/**************************************************************/
export { 
  FBR_GAMEDB,
  fbR_initialize, fbR_procLogin, 
  fbR_procRDETAILS, fbR_procRADMIN, fbR_procWUD,
  fbR_procWScore, fbR_procRScore, fbR_procRTG, fbR_procLeaderboard 
};

/**************************************************************/
//    END OF PROG
/**************************************************************/