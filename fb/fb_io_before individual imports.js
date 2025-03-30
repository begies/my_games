/**************************************************************/
// fb_io.mjs
// Generalised firebase routines
// Written by Mr Bob Term 2 2024
//
// All variables & function begin with fb_  all const with FB_
// Diagnostic code lines have a comment appended to them //DIAG
//
//  v01 Basic code.
//  v02 Convert to modular API
/**************************************************************/
const FB_COL_C = 'white';
const FB_COL_B = '#CD7F32';
console.log('%c fb_io.mjs \n--------------------', 
            'color: blue; background-color: white;');

/**************************************************************/
// Import all the external constants, variables & functions required
/**************************************************************/
// Import all the methods you want to call from the firebase modules
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { ref, set, update, remove, onValue, query, orderByChild, limitToFirst, get } 
    from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Import all the constants, variables & functions required from fbD_data module
import { fbD_loginStatus, fbD_readRecStatus, fbD_readAllStatus, fbD_writeRecStatus,
         fbD_readOnStatus, fbD_updateRecStatus, fbD_deleteRecStatus }
    from '/fb/fbD_data.mjs';

// Import all constants, variables & functions required from fbR_manager module
import { FBR_GAMEDB }
    from '/fb/fbR_manager.mjs';

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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');
               
    const AUTH = getAuth();
    AUTH.languageCode = 'it';
    const PROVIDER = new GoogleAuthProvider();
    PROVIDER.setCustomParameters({
        prompt: 'select_account'
    });

    signInWithPopup(AUTH, PROVIDER).then((result) => {
        //fbD_loginStatus = 'logged in via popup';
        _procFunc('logged in via popup', result.user, _save, null);
    })
    .catch((error) => {
        //fbD_loginStatus = 'error';
        _procFunc('error', null, _save, error);
    });
}
    /*
    window.fbD_loginStatus       = fbD_loginStatus;
    window.fbD_readRecStatus     = fbD_readRecStatus;
    window.fbD_readAllStatus     = fbD_readAllStatus;
    window.fbD_writeRecStatus    = fbD_writeRecStatus;
    window.fbD_readOnStatus      = fbD_readOnStatus;
    window.fbD_updateRecStatus   = fbD_updateRecStatus;
    window.fbD_deleteRecStatus   = fbD_deleteRecStatus;
    */

/******************************************************/
// fb_authChanged()
// Called by fb_login()
// Detect change to login status and update session storage
// Input:  n/a
// Return: n/a
/******************************************************/
function fb_authChanged() {
    console.log('%c fb_authChanged(): ', 
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    const AUTH = getAuth();
    onAuthStateChanged(AUTH, (user) => {
        if (user) {
            var fb_temp = 'logged in'; 
        } else {
            var fb_temp = 'logged out';
        }
        sessionStorage.setItem('fbD_loginStatus', fb_temp);
        console.log('%c fb_authChanged(): status = ' + fb_temp, 
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');
    }, (error) => {
        //fbD_loginStatus = 'error';
        console.error('fb_authChanged(): ' + error);
        sessionStorage.setItem('fbD_loginStatus', 'error');
        window.location = "../index.html";  //TEST THIS PAGE LOAD
    });
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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    const AUTH = getAuth();
    signOut(AUTH).then(() => {
        //fbD_loginStatus = 'logged out';
        sessionStorage.setItem('fbD_loginStatus', 'logged out');
        console.log('%c fb_logout(): status = logged out', 
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');
        window.location = "../index.html";  //TEST THIS PAGE LOAD
    })
    .catch((error) => {
        //fbD_loginStatus = 'error';
        console.error('fb_logout(): ' + error);
        sessionStorage.setItem('fbD_loginStatus', 'error');
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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    var fb_temp = 'waiting...';
    const FB_DBREF = ref(FBR_GAMEDB, _path + '/' + _key);
    get(FB_DBREF).then((snapshot) => {
        var fb_data = snapshot.val();
        if (fb_data != null) { 
            fb_temp = 'OK';
        } else {
            fb_temp = 'no record';
        }
        _procFunc(fb_temp, _path, _key, fb_data, _save, null);
    }).catch((error) => {
        _procFunc('error', _path, _key, null, _save, error);
    });
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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    var fb_temp = 'waiting...';
    
    const FB_DBREF = ref(FBR_GAMEDB, _path);
    get(FB_DBREF).then((snapshot) => {
        var fb_data = snapshot.val();
        if (fb_data != null) { 
            fb_temp = 'OK';
        } else {
            fb_temp = 'no record';
        }
        _procFunc(fb_temp, _path, snapshot, _save, null);
    }).catch((error) => {
        _procFunc('error', _path, null, _save, error);
    });
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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    var fb_temp = 'waiting...';

    const FB_DBREF = ref(FBR_GAMEDB, _path + '/' + _key);
    set(FB_DBREF, _data).then(() => {
        _procFunc('OK', _path, _key, _data, null);
    }).catch((error) => {
        _procFunc('error', _path, _key, _data, error);
    });
}

/**************************************************************/
// fb_readOn(_path, _key, _save, _procFunc)
// Issue a readOn to listen for modifications to DB data
// Input:  path & key of rec to read, where to save it &
//         function to process data
// Return:  
/**************************************************************/
function fb_readOn(_path, _key, _save, _procFunc) {
    console.log('%c fb_readOn(): path= ' + _path + '  key= ' + _key,
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    fbD_readOnStatus = 'waiting...';

    const FB_DBREF = ref(FBR_GAMEDB, _path + '/' + _key);
    onValue(FB_DBREF, (snapshot) => {
        var fb_data = snapshot.val();
        if (fb_data != null) { 
            fbD_readOnStatus = 'OK';
        } else {
            fbD_readOnStatus = 'no record';
        }
        _procFunc(fbD_readOnStatus, _path, _key, fb_data, _save, null);
    }, (error) => {
        fb_temp = 'error';
        _procFunc(fb_temp, _path, _key, null, _save, error);
    });
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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    fbD_updateStatus = 'waiting...';
    
    const FB_DBREF = ref(FBR_GAMEDB, _path + '/' + _key);
    update(FB_DBREF, _data).then(() => {
        fbD_updateStatus = 'OK';
        _procFunc(fbD_updateStatus, _path, _key, _data, null);
    }).catch((error) => {
        fbD_updateStatus = 'error';
        _procFunc(fbD_updateStatus, _path, _key, _data, error);
    });
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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    fbD_deleteStatus = 'waiting...';

    const FB_DBREF = ref(FBR_GAMEDB, _path + '/' + _key);
    remove(FB_DBREF).then(() => {
        fbD_deleteStatus = 'OK';
        _procFunc(fbD_deleteStatus, _path, _key, null);
    }).catch((error) => {
        fbD_deleteStatus = 'error';
        _procFunc(fbD_deleteStatus, _path, _key, error);
    });
}

/**************************************************************/
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
                'color: ' + FB_COL_C + '; background-color: ' + FB_COL_B + ';');

    fbD_readAllStatus = 'waiting...';
     
    const FB_DBREF = query(ref(FBR_GAMEDB, _path), orderByChild(_sortKey), limitToFirst(_num));
    get(FB_DBREF).then((snapshot) => {
        if (snapshot.val() == null) { 
            fbD_readAllStatus = 'no record';
        } else {
            fbD_readAllStatus = 'OK';
        }
        _procFunc(fbD_readAllStatus, _path, snapshot, _save, null, _sortKey, _num);
    }).catch((error) => {
        fbD_readAllStatus = 'error';
        _procFunc(fbD_readAllStatus, _path, null, _save, error, _sortKey, _num);
    });
}

/**************************************************************/
// EXPORT FUNCTIONS
// List all the functions called by code or html outside of this module
/**************************************************************/
export { 
    fb_login, fb_authChanged, fb_logout, 
    fb_readRec, fb_readAll, fb_writeRec, 
    fb_readOn, fb_updateRec, fb_deleteRec, fb_readSortedLimit 
};

/**************************************************************/
// END OF CODE
/**************************************************************/