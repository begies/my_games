/**************************************************************/
// fbR_manager.js
//
// Written by Mr Bob, Term 4 2022
// Firebase routine manger:
//  Intialise firebase
//  Handle login
//  Procees all firebase callbacks
//  Update html interface with success/failure of firebase I/O
//
//  v1 Basic code.
/**************************************************************/
const COLFBR_C = 'white';
const COLFBR_B = 'brown';
console.log('%c fbR_manager.js \n--------------------', 
            'color: blue; background-color: white;');

/**************************************************************/
// Connect to firebase
fbR_initialise();

/**************************************************************/
// fbR_initialise()
// Called by setup()
// If firebase not initialised, then initialise it & enable LOGIN button
// Input:  n/a
// Return: n/a
/**************************************************************/
function fbR_initialise() {
  console.log('%c fbR_initialise(): ', 
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  const FIREBASECONFIG = {
    apiKey: "AIzaSyCSqf1GdfCl82X_xuWOo72IK8HBw1oLpAI",
    authDomain: "comp-2022-bobby-bob.firebaseapp.com",
    databaseURL: "https://comp-2022-bobby-bob-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "comp-2022-bobby-bob",
    storageBucket: "comp-2022-bobby-bob.appspot.com",
    messagingSenderId: "672130293901",
    appId: "1:672130293901:web:e3673bc2149fc92ca782c4",
    measurementId: "G-Q0EM45G29Q"
  };

  // Check if firebase already initialised
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASECONFIG);
    console.log(firebase);
    database = firebase.database();

    html_remAllClasses('b_login', 'w3-disabled');
  }
}

/**************************************************************/
// fbR_procLogin(_loginStatus, _user, _fbUserDetails, _error)
// Called by fb_login once login is completed
// Save login details.
// Read user's fbUserDetails to determine if already registered
// Read users's admin recored to determine if user is ADMIN
// Input:  login status('logged in', 'logged out', 'logged in via popup'), 
//         Google login object, where to save user details & 
//         error msg if any
// Return: n/a
/**************************************************************/
//           _procFunc(fb_loginStatus, user, _save, error);
function fbR_procLogin(_loginStatus, _user, _fbUserDetails, _error) {
  console.log('%c fbR_procLogin(): status = ' + _loginStatus, 
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  if (_error != null) {
      console.error('Login failed: ' + _error.code + ', ' + _error.message);
      alert('Login failed:\n' + _error.code + '\n' + _error.message);
    }

  else {
    _fbUserDetails.uid      = _user.uid;
    _fbUserDetails.email    = _user.email;
    _fbUserDetails.name     = _user.displayName;
    _fbUserDetails.photoURL = _user.photoURL;

    sessionStorage.setItem(SSGOOGLE, JSON.stringify(_fbUserDetails));
    sessionStorage.setItem(SSFBIOLOGIN, _loginStatus);
    sessionStorage.setItem(SSFBIOREAD, " ");
    sessionStorage.setItem(SSFBIOREADALL, " ");
    sessionStorage.setItem(SSFBIOWRITE, " ");
    sessionStorage.setItem(SSFBIOREADON, " ");
    sessionStorage.setItem(SSFBIODELETE, " ");
    sessionStorage.setItem(SSFBIOUPDATE, " ");

    fb_readRec(DETAILS, _fbUserDetails.uid, _fbUserDetails,
      fbR_procRDETAILS);
  }
}

/**************************************************************/
// fbR_procRDETAILS(_result, _path, _key, _dbData, _save, _error)
// Called by fb_readRec via fbR_procLogin() as part of login
// Save Google login data to session storage.
// If userDetail returns data, fire off read ADMIN to determine
//  if admin user.
//  Else user not registered so load registration page.
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//       _procFunc(fb_readRecStatus, _path, _key, dbData, _save, error);
function fbR_procRDETAILS(_result, _path, _key, _dbData, _save, _error) {
  console.log('%c fbR_procRDETAILS(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result, 
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  sessionStorage.setItem(SSFBIOREAD, _result);
  p_fbReadRec.textContent = _result;

  if (_result == 'OK') {
    fb_readRec(ADMIN, fbUserDetails.uid, '', fbR_procRADMIN);
    sessionStorage.setItem(SSGAMENAME, _dbData.gameName);
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
// fbR_procRADMIN(_result, _path, _key, _dbData, _save, _error)
// Called by fb_readRec
// Determine user's admin status, save it to session storage and
//  goto game selection page.
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//    _procFunc(fb_readRecStatus, _path, _key, dbData, _save, error);
function fbR_procRADMIN(_result, _path, _key, _dbData, _save, _error) {
  console.log('%c fbR_procRADMIN(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result, 
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  sessionStorage.setItem(SSFBIOREAD, _result);
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
  sessionStorage.setItem(SSADMINSTATUS, fbR_action);
  window.location = "html/select_game.html";
  // The following worked
  //window.location = "/12COMP-P5play-games/html/select_game.html";
  // The following FAILED 404
  //const targetUrl = new URL('/html/select_game.html', window.location.origin);
  //window.location = targetUrl.href;
  //const baseUrl = window.location.origin;
  //window.location = `${baseUrl}/html/select_game.html`;
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
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  sessionStorage.setItem(SSFBIOWRITE, _result);
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
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  sessionStorage.setItem(SSFBIOWRITE, _result);
  p_fbWriteRec.textContent = _result;

  if (_result == 'OK') {
    // Deconstruct _data object, updating html High Score along the way
    let fbR_entries = Object.entries(_data);
    for (i = 0; i < fbR_entries.length; i++) {
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
// fbR_procRScore(_result, _path, _key, _dbData, _save, _error)
// Called by fb_readRec()
// Save high scores ignoring uid and update display & session storage
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//    _procFunc(fb_readRecStatus, _path, _key, dbData, _save, error);
function fbR_procRScore(_result, _path, _key, _dbData, _save, _error) {
  console.log('%c fbR_procRScore(): path/key= ' + _path + '/' + _key +
              '  result= ' + _result,  
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  sessionStorage.setItem(SSFBIOREAD, _result);
  p_fbReadRec.textContent = _result;

  // Deconstruct _dbdata object, updating _save object & html along the way
  if (_result == 'OK') {
    let fbR_entries = Object.entries(_dbData);
    for (i = 0; i < fbR_entries.length; i++) {
      if (fbR_entries[i][0] != 'uid') {
        _save[fbR_entries[i][0]] = fbR_entries[i][1];
        document.getElementById('p_HS' + fbR_entries[i][0]).innerHTML = fbR_entries[i][1];
      }
    }

    // Update session storage with user's High Score values
    sessionStorage.setItem(SSSCORE, JSON.stringify(_dbData));
  }
  else {
    console.error('DB read error for ' + _path + '/' + _key +
                  '\n' + _error);
    alert('DB read error for ' + _path + '/' + _key + 
          '\nSee the console log for details');
  }
}

/**************************************************************/
// fbR_procRTG(_result, _path, _key, _dbData, _save, _error)
// Called by fb_readRec()
// Save high scores & update session storage
// Input:  result('waiting...', 'OK', 'no record', 'error'), path, 
//         key, DB data, where to save it & error msg if any
// Return: n/a
/**************************************************************/
//  _procFunc(fb_readRecStatus, _path, _key, dbData, _save, error);
function fbR_procRTG(_result, _path, _key, _dbData, _save, _error) {
  console.log('%c fbR_procRTG(): path= ' + _path + 
              '  result= ' + _result, 
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  sessionStorage.setItem(SSFBIOREAD, _result);
  p_fbReadRec.textContent = _result;
  
  if (_result == 'OK') {
    let entries = Object.entries(_dbData);
    console.log(entries);//DIAG
    for (i = 0; i < entries.length; i++) {
      _save[entries[i][0]] = entries[i][1];
    }
    
    sessionStorage.setItem(SSTG_SCORE, JSON.stringify(_dbData));

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
              'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');

  sessionStorage.setItem(SSFBIOREADALL, _result);
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
    var fbR_score = JSON.parse(sessionStorage.getItem(SSSCORE));
    var fbR_usersRow = _save.map(object => object.uid).indexOf(fbUserDetails.uid);
    console.log('%c fbR_usersRow= ' + fbR_usersRow,     //DIAG
          'color: ' + COLFBR_C + '; background-color: ' + COLFBR_B + ';');
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
//    END OF PROG
/**************************************************************/