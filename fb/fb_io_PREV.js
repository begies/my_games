/**************************************************************/
// fb_io.js
// Generalised firebase routines
// Written by Mr Bob Term 2 2024
/**************************************************************/
const COLFB_C = 'white';
const COLFB_B = '#CD7F32';
console.log('%c fb_io.js \n--------------------', 
            'color: blue; background-color: white;');

var fb_loginStatus    = 'n/a';
var fb_readRecStatus  = 'n/a';
var fb_readAllStatus  = 'n/a';
var fb_writeRecStatus = 'n/a';
var fb_readOnStatus   = 'n/a';
var fb_updateStatus   = 'n/a';
var fb_deleteStatus   = 'n/a';

/******************************************************/
// fb_login(_save, _procFunc)
// Called by html LOGIN button
// Login to Firebase
// Input:  object to save login data to &
//         function to process the login result
// Return: n/a
/******************************************************/
function fb_login(_save, _procFunc) {
    console.log('%c fb_login(): ', 
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    fb_authChanged(fbUserDetails, fbR_procLogin);

    //var provider = new firebase.auth.GoogleAuthProvider();
    //To force Google signin to ask which account to use:
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    //firebase.auth().signInWithRedirect(provider); // Another method
    firebase.auth().signInWithPopup(provider).then(function(result) {
            fb_loginStatus = 'logged in via popup';
            _procFunc(fb_loginStatus, result.user, _save, null);
        })
        // Catch errors
        .catch(function(error) {
            fb_loginStatus = 'error';
            _procFunc(fb_loginStatus, null, _save, error);
        });
}

/******************************************************/
// fb_authChanged()
// Called by fb_login()
// Detect change to login status and update fb_loginStatus
// Input:  n/a
// Return: n/a
/******************************************************/
function fb_authChanged() {
    console.log('%c fb_authChanged(): ', 
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    firebase.auth().onAuthStateChanged(newLogin);

    function newLogin(user) {
        console.log('%c fb_authChanged(): newLogin - status = ' + fb_loginStatus, 
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');
       
        if (user) {
            // user is signed in, so save Google login details
            fb_loginStatus = 'logged in'; 
        }
        else {
            // user NOT logged in, so redirect to Google login
            fb_loginStatus = 'logged out';
        }
        sessionStorage.setItem(SSFBIOLOGIN, fb_loginStatus);
        console.log('%c fb_authChanged(): status = ' + fb_loginStatus, 
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');
    }
}

/******************************************************/
// fb_logout()
// Called by html LOGOUT button
// Logout of firebase
// Input:  n/a
// Return: n/a
/******************************************************/
function fb_logout() {
    console.log('%c fb_logout(): ', 
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    firebase.auth().signOut().then(function() {
        fb_loginStatus = 'logged out';
        sessionStorage.setItem(SSFBIOLOGIN, fb_loginStatus);
        console.log('%c fb_logout(): status = ' + fb_loginStatus, 
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');
        window.location = "../index.html";  //TEST THIS PAGE LOAD
    })
    // Catch errors
    .catch(function(error) {
        fb_loginStatus = 'error';
        console.error('fb_logout(): ' + error);
        sessionStorage.setItem(SSFBIOLOGIN, fb_loginStatus);
        window.location = "../index.html";  //TEST THIS PAGE LOAD
    });
}

/**************************************************************/
// fb_readRec(_path, _key, _save, _procFunc)
// Read a specific DB record
// Input:  path & key of rec to read, where to save it &
//         function to process data
// Return:  
/**************************************************************/
function fb_readRec(_path, _key, _save, _procFunc) {
    console.log('%c fb_readRec(): path= ' + _path + '  key= ' + _key,
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    fb_readRecStatus = 'waiting...';
    firebase.database().ref(_path + '/' + _key).once('value', fb_readOK, fb_readErr);

    /*******************************************/
    // fb_readOK(data)
    // DB read is sucssessful
    // Input:  data returned from firebase
    /*******************************************/
    function fb_readOK(snapshot) {
        var dbData = snapshot.val();
        if (dbData != null) { // if data returned	
            fb_readRecStatus = 'OK';
        }
        else {
            fb_readRecStatus = 'no record';
        }
        _procFunc(fb_readRecStatus, _path, _key, dbData, _save, null);
    }

    /*******************************************/
    // fb_readErr(error)
    // DB read record failed
    // Input:  error message returned from firebase
    /*******************************************/
    function fb_readErr(error) {
        fb_readRecStatus = 'error';
        _procFunc(fb_readRecStatus, _path, _key, null, _save, error);
    }
}

/**************************************************************/
// fb_readAll(_path, _save, _procFunc)
// Read ALL records in a path
// Input:  path to read, where to save it &
//         function to process data
// Return:  
/**************************************************************/
function fb_readAll(_path, _save, _procFunc) {
    console.log('%c fb_readAll(): path= ' + _path,
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    fb_readAllStatus = 'waiting...';
    firebase.database().ref(_path).once('value', fb_readOK, fb_readErr);

    /*******************************************/
    // fb_readOK(data)
    // DB read is sucssessful
    // Input:  data returned from firebase
    /*******************************************/
    function fb_readOK(snapshot) {
        var dbData = snapshot.val();
        if (dbData != null) { // if data returned	
            fb_readAllStatus = 'OK';
        }
        else {
            fb_readAllStatus = 'no record';
        }
        _procFunc(fb_readAllStatus, _path, snapshot, _save, null);
    }

    /*******************************************/
    // fb_readErr(error)
    // DB read record failed
    // Input:  error message returned from firebase
    /*******************************************/
    function fb_readErr(error) {
        fb_readAllStatus = 'error';
        _procFunc(fb_readAllStatus, _path, null, _save, error);
    }
}

/**************************************************************/
// fb_writeRec(_path, _key, _data, _procFunc)
// Called by various
// Write a specific record & key to the DB
// Input:  path to write to, the key, the data & 
//         function to process the result
// Return: 
/**************************************************************/
function fb_writeRec(_path, _key, _data, _procFunc) {
    console.log('%c fb_WriteRec(): path= ' + _path + '  key= ' + _key,
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    fb_writeRecStatus = 'waiting...';
    firebase.database().ref(_path + '/' + _key).set(_data,
        function(error) {
            if (error) {
                fb_writeRecStatus = 'error';
            }
            else {
                fb_writeRecStatus = 'OK';
            }
            _procFunc(fb_writeRecStatus, _path, _key, _data, error);
        }
    );
}

/**************************************************************/
// fb_updateRec(_path, _key, _data, _procFunc)
// Called by various
// Update a specific record & key to the DB
// Input:  path to update, the key, the data & 
//         function to process the result
// Return: 
/**************************************************************/
function fb_updateRec(_path, _key, _data, _procFunc) {
    console.log('%c fb_updateRec(): path= ' + _path + '  key= ' + _key,
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    fb_updateStatus = 'waiting...';
    firebase.database().ref(_path + '/' + _key).update(_data,
        function(error) {
            if (error) {
                fb_updateStatus = 'error';
            }
            else {
                fb_updateStatus = 'OK';
            }
            _procFunc(fb_updateStatus, _path, _key, _data, error);
        }
    );
}

/**************************************************************/
// fb_deleteRec(_path, _key, _procFunc)
// Called by various
// Delete the entire path (_key == null) specified by _path
//   OR delete a specific record specified by _path & _key
// Input:  path to delete, the key or null, 
//         function to process the result
// Return: 
/**************************************************************/
function fb_deleteRec(_path, _key, _procFunc) {
    console.log('%c fb_deleteRec(): path= ' + _path + '  key= ' + _key,
                'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

    var optKey = '';
    if (_key != null) {
        optKey = '/' + _key
    }
    fb_deleteStatus = 'waiting...';
    firebase.database().ref(_path + optKey).remove(
        function(error) {
            if (error) {
                fb_deleteStatus = 'error';
            }
            else {
                fb_deleteStatus = 'OK';
            }
            _procFunc(fb_deleteStatus, _path, _key, error);
        }
    );
}

//**************************************************************/
// fb_readSortedLimit(_path, _procFunc, _save, _sortKey, _num)
// Called by various
// Read specified num of DB records for the path, sorted by _sortKey
//  in ascending order.
// Input:  path to read from, array to save sorted data in, function
//          to process data, sort key & num records to return
// Return: n/a
/**************************************************************/
function fb_readSortedLimit(_path, _procFunc, _save, _sortKey, _num) {
  console.log('%c fb_readSortedLimit(): path= ' + _path +
              '  sortKey= ' + _sortKey + '  num= ' + _num, 
              'color: ' + COLFB_C + '; background-color: ' + COLFB_B + ';');

  readStatus = 'waiting...';
  database = firebase.database();
  ref = database.ref(_path).orderByChild(_sortKey).limitToLast(_num);
  ref.once('value', fb_readOK, fb_readErr);

  /*-----------------------------------------*/
  // fb_readOK(snapshot)
  // DB read is sucssessful
  // Input:  data returned from firebase
  /*-----------------------------------------*/
  function fb_readOK(snapshot) {
    if (snapshot.val() == null) { 
        fb_readAllStatus = 'no record';
    }
    else {
        fb_readAllStatus = 'OK';
    }
    
    _procFunc(fb_readAllStatus, _path, snapshot, _save, null, 
              _sortKey, _num,);
  } 
  
  /*-----------------------------------------*/
  // fb_readErr(error)
  // DB read failed
  // Input:  error message returned from firebase
  /*-----------------------------------------*/
  function fb_readErr(error) {
    console.error(error);
    fb_readAllStatus = 'error';
    _procFunc(fb_readAllStatus, _path, snapshot, _save, error, 
              _sortKey, _num,);
  }
}

/**************************************************************/
// END OF CODE
/**************************************************************/