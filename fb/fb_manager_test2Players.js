/**************************************************************/
// fbR_manager.js
// Skeleton written by Arya Ubale   2023
// Initialise function
// Proc Functions
// Add console.logs
// fbR console.logs are brown
// Lobby & readon function console.logs are pink
/**************************************************************/
console.log('%c fbR_manager.js \n--------------------', 
	'color: blue; background-color: white;');
const COLFBR_C 	= 'blue';
const COLFBR_B = 'Gainsboro';

// Connect to firebase
fbR_initialise();

/**************************************************************/
// fbR_initialise()
// Called by setup
// Initialize firebase
// Input:  n/a
// Return: n/a
/**************************************************************/
function fbR_initialise() {
	console.log('%c fbR_initialise: ', 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	// PLACE YOUR CONFIG FROM THE FIREBASE CONSOLE BELOW <========
	const FIREBASECONFIG = {
		apiKey: "AIzaSyC5ps4Prtigq-JQyMjk436YzFak71YwXXc",
		authDomain: "comp-2024-arya-ubale.firebaseapp.com",
		projectId: "comp-2024-arya-ubale",
		storageBucket: "comp-2024-arya-ubale.appspot.com",
		messagingSenderId: "285047456115",
		appId: "1:285047456115:web:f646fe0a2567e524068506",
		measurementId: "G-REY9YD77LM"
	};

	// Check if firebase already initialised
	if (!firebase.apps.length) {
		firebase.initializeApp(FIREBASECONFIG);
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
// Input:  login status, Google login object, 
//           where to save user details & error msg if any
// Return: n/a
/**************************************************************/
function fbR_procLogin(_loginStatus, _user, _fbUserDetails, _error) {
	console.log("%c fbR_procLogin", 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	_save.uid = user.uid;
	_save.email = user.email;
	_save.name = user.displayName;
	_save.photoURL = user.photoURL;

	//Save Google's login info to sessionStorage
	sessionStorage.setItem("uid", user.uid);
	sessionStorage.setItem("email", user.email);
	sessionStorage.setItem("name", user.displayName);
	sessionStorage.setItem("photoURL", user.photoURL);

	//fb_readRec(_path, _key, _save, _procFunc)
	fb_readRec(DETAILS, _save.uid, _save, fbR_procReadUD);
}

/*****************************************************/
//FUNCTIONS TO PROCESS THE FIRE BASE CALL BACKS
/*****************************************************/
// fbR_procWUD (_path, _key, _data, _save, error)
// Called by reg_register
// write registration record to firebase
/*****************************************************/
//_procFunc (_readStatus, _path, _key, snapshot, _save, null);
function fbR_procWUD(_path, _key, _data, _save, error) {
	console.log('%c fbR_procWUD: path = ' + _path + ' error= ' + error, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (error) {
		writeStatus = "Failed";
		alert("Write Failed.");
		console.error(error);
	} else {
		writeStatus = "OK";
		console.log('%c fbR_writeRec: writeStatus = ' + writeStatus, 
					'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
		window.location.href = ("/HTML/readon.html");
	}
}

/*****************************************************/
// fbR_procReadUD(_readStatus, _path, _key, _dbData, _save)
// Called by 
// Determine if user is registered
//
/*****************************************************/
//_procFunc (_readStatus, _path, _key, dbData, _save, null);
function fbR_procReadUD(_readStatus, _path, _key, _dbData, _save) {
	console.log('%cfbR_procReadUD: _readStatus = ' + _readStatus, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_snapshot.val() == null) {
		//User is not registered
		console.log("snapshot is null");
		readStatus = "no record";
		window.location.href = "/HTML/reg.html";
	} else {
		//user is already registered
		readStatus = 'OK';
		let dbData = _snapshot.val();
		sessionStorage.setItem('gameName', dbData.gameName);
		sessionStorage.setItem('age', dbData.age);
		sessionStorage.setItem('phone', dbData.phone);
		sessionStorage.setItem('address', dbData.address);
		sessionStorage.setItem('gender', dbData.gender);
		//fb_readRec(_path, _key, _save, _procFunc)
		fb_readRec(ADMIN, userDetails.uid, adminUser, fbR_procReadAdmin);
	}
}

/*****************************************************/
// fbR_procReadAllUD (_path, _snapshot, _save, error)
// Read all of the user details data
/*****************************************************/
//_procFunc (_readStatus, _path, _key, snapshot, _save, null);
function fbR_procReadAllUD(_path, _key, _snapshot, _save, error) {
	console.log('%c fbR_procReadAllUD: path = ' + _path, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (error == null) {
		var dbData = _snapshot.val();
		if (dbData == null) {
			readStatus = "No Records";
		} else {
			readStatus = "OK";
			var dbKeys = Object.keys(dbData);
			console.log(dbKeys);
			for (i = 0; i < dbKeys.length; i++) {
				var k = dbKeys[i];
				_save.push({
					name: dbData[k].name,
					score: dbData[k].score
				});
			}
		}
	} else {
		readStatus = "Error";
		console.error(error);
	}
}

/*****************************************************/
// fbR_procReadUD (_path, _key, _snapshot, _save, _error)
// Reads user details and saves name, email, gameName and score
/*****************************************************/
//_procFunc (_readStatus, _path, _key, snapshot, _save, null);
function fbR_procReadUD_1(_path, _key, _snapshot, _save, _error) {
	console.log('%c fbR_procReadUD: path = ' + _path, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_error == null) {
		let dbData = _snapshot.val();
		sessionStorage.setItem('gameName', dbData.gameName);
		if (dbData != null) {
			_save.name = dbData.name;
			_save.email = dbData.email;
			_save.score = dbData.score;

			readStatus = "OK";
		} else {
			readStatus = "No Record";
		}
	} else {
		readStatus = "Error";
		console.error(error);
	}
}


//ADMIN CODE
// fbR_procReadAd (_path, _key, _snapshot, _save, _error) 
function fbR_procReadAd(_path, _key, _snapshot, _save, _error) {
	console.log('%c fbR_procReadAd: path = ' + _path, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_error == null) {
		var dbData = _snapshot.val();
		if (dbData != null) {
			_save.score = dbData.score;
			readStatus = "OK";
		} else {
			readStatus = "No Record";
		}
	} else {
		readStatus = "Error";
		console.error(error);
	}
}

/**************************************************************/
// fbR_procReadAdmin()
// Called by fbR_procUserDetails()
/**************************************************************/
//_procFunc (_readStatus, _path, _key, snapshot, _save, null);
function fbR_procReadAdmin(_result, _path, _key, _snapshot, _save, _error) {
	console.log('%cfbR_procReadAdmin: result = ' + _result, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	var dbData = _snapshot.val();
	if (dbData != null) {
		//there is data
		readStatus = 'OK';
		sessionStorage.setItem('admin', "y");
	} else {
		sessionStorage.setItem('admin', "n");
	}
	window.location.href = "/HTML/readon.html";
}

/*****************************************************/
// reads and processes user details 
// if user is an admin user then display admin button
/*****************************************************/
function fbR_procUserDetails(_readStatus, _path, _key, _snapshot, _save, _error) {
	console.log("%c fbr_procUserDetails: readStatus= " + _readStatus, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_readStatus == 'Failure') {
		console.error(_error);
	} else if (_readStatus == "OK") {
		let dbData = _snapshot.val();
		console.log(dbData);
		console.log('%c procUserDetails: result = ' + _readStatus,
					'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
		_save = dbData;
	} else if (_readStatus == "No record") {
		console.log("%c " + _readStatus,
					'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
	}

	if (_save == "admin") {
		b_admin.style.display = 'block';
	}

	document.getElementById("nameDisplay").innerHTML = userDetails.gameName;
}

/*------------------------- LOBBY TABLE CODE ---------------------------*/
// fbR_procRS_gtnLobbyTable(_readStatus, _snapshot, _save, _error)
// Callback from firebase read (fb_readAllSorted) 
// Process data from sorted read of all KA records
// Input:  read status, database data & where to save it &
//         error message if any
// Output: n/a
//_procFunc(_readStatus, _path, _key, snapshot, _save, null);
//_procFunc(_readStatus, _snapshot, _save, null);
function fbR_procRS_gtnLobbyTable(_readStatus, _snapshot, _save, _error) {
	console.log("%c fbR_procRS_gtnLobbyTable: readStatus = " + _readStatus,
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_readStatus != 'error') {
		var recCount = 0;
		if (_snapshot.val() != null) { // if data returned	
			_snapshot.forEach(function(childSnapshot) {
				recCount++;
				// if you need access to the key
				var childKey = childSnapshot.key;
				var childData = childSnapshot.val();
				if (childData.p2Join == false) {
					_save.push({
						gameName: childData.gameName, //<============
						p2Join: childData.p2Join, //<============
						wins: childData.wins, //<============
						losses: childData.losses, //<============              
						uid: childKey //<============
					});
				}
			});
		}
		// Build the html table 
		html_buildTable("tb_gtnLobbyTable", _save);
	} else {
		console.error(_error);
		alert('firebase read error.\nPlease see console log for details');
	}
}

/**********************************************************/
// fbR_procJoinPlayer2(__readStatus, _path, _key, _dbData, _save, _error)
// Called by fb_readOnJoin via fbR_procCR and 
//	fb_updateRec via html_buildTable when PLAYER 2 clicks JOIN
// Process the readon for PLAYER 2
//			If p2Join = 'W' PLAYER 1 won, else its 1st time callback so 
//			load gtn html
// Input: read status, DB path & key, database data & where to save it
//			and error if any.
// Output: n/a
/**********************************************************/
//                  _procFunc(_readStatus, _path, _key, dbData, _save, error);
function fbR_procJoinPlayer2(_readStatus, _path, _key, _dbData, _save, _error) {
	console.log("%c fbR_procJoin " + _readStatus, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_readStatus == 'OK') {
		console.log(_dbData);
		if (_dbData == 'W') {
			console.log('%c fbR_procJoinPlayer2: Player 1 has won',
						'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
			//fb_readOffJoin (LOBBY, userDetails.uid + '/p2Join', p2Join, fbR_procJoin);

		} else {
			console.log('%c fbR_procJoinPlayer2: player 2 joined',
						'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
			window.location.href = ("/HTML/gtnGame.html");
		}
	} else {
		console.error(_error);
		alert("database error see console for details")
	}
}

/**********************************************************/
// fbR_procJoinPlayer1(_readStatus, _path, _key, _dbData, _save, _error) 
// called by fb_readOnJoin via html_gtnOnclick
// Process the readon
// Input: read status, database data & where to save it
// Output: n/a
/**********************************************************/
//	_procFunc(_readStatus, _path, _key, dbData, _save, error);
function fbR_procJoinPlayer1(_readStatus, _path, _key, _dbData, _save, _error) {
	console.log("%c fbR_procJoinPLayer1 " + _readStatus, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_readStatus == 'OK') {
		console.log(_dbData);
		if (_dbData == 'false') {
			console.log('%c p2Join IGNORE',
						'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
			//fb_readOffJoin (LOBBY, userDetails.uid + '/p2Join', p2Join, fbR_procJoin);
		} else if (_dbData == 'W') {
			console.log('%c Player 2 has won',
						'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
		} else {
			console.log('%c p2Join: there is a number in p2Join',
						'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
		}
	} else {
		console.error(_error);
		alert("database error see console for details")
	}
}

/**********************************************************/
// Callback from firebase readon via ------
//called by fb_readOn via html_gtnOnclick
// Process the readon
// Input: read status, database data & where to save it
// Output: n/a
/**********************************************************/
//_procFunc(_readStatus, dbData, _save, null);
/*function fbR_procJoin(_readStatus, _dbData, _save, _error){
    console.log("%cfbR_procJoin " + _readStatus, 'color: pink;');
    if (_readStatus == 'OK'){
        console.log(_dbData);
        if (_dbData == true){
            console.log('player 2 has joined');
            fb_readOffJoin (LOBBY, userDetails.uid + '/p2Join', p2Join, fbR_procJoin);
        }
        else {
            console.log('player 2 has NOT joined');
        }
    }
    else {
        console.error(_error);
        alert("database error see console for details")
    }
}*/

/**********************************************************/
// stop reading from firebase
// turn readon off when p2join = false 
/**********************************************************/
function fbR_procJoinOff(_readStatus, _dbData, _save) {
	console.log("%c fbR_procJoinOff: result= " + _readStatus,
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	_readStatus == "OK";
}

/**********************************************************/
// fbR_procCR(_path, _key, _field, _error)
// Called by fb_updateRec via html_buildTable when PLAYER 2 clicks JOIN
// Process the result of the update record
// PLAYER 2 clicked JOIN button so issue readon on p2Join for PLAYER 2 
// Input:  DB path & key, field to issue readOn & error if any
// Output: n/a
/**********************************************************/
//		  _procfunc(_path, _key, _field, _error);
function fbR_procCR(_path, _key, _field, _error) {
	console.log('%c fbR_procCR: path = ' + _path + ', ' + _key,
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_error) {
		updateStatus = 'failure';
		console.error(_error);
		alert('write error. check console for details');
	} else {
		updateStatus = 'OK';
		console.log("%c fbR_procCR updateStatus: " + updateStatus, 
					'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);
		fb_readOnJoin(LOBBY, _key, _field, fbR_procJoinPlayer2);
	}
}

/*****************************************************/
//creates p1 
//called by fb_writeRec in html_gtnOnclick
/*****************************************************/
function fbR_procWriteP1Create(_path, _key, _data, _error) {
	console.log('%c fbR_procWriteP1Create: path = ' + _path + ' error= ' + _error, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	if (_error) {
		writeStatus = "Failed";
		console.error(_error);
	} else {
		writeStatus = "OK";
	}
}

/*****************************************************/
//called by html_gtnOnclick
//processes users scores
/*****************************************************/
// _procFunc(_readStatus, _path, _key, snapshot, _save, null);
function fbR_procReadUDScores(_readStatus, _path, _key, _snapshot, _save, _error) {
	console.log('%c fbR_procReadUDScores: path = ' + _path, 
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	dbData = _snapshot.val();
	if (dbData == null) {
		//User is not registered
		_readStatus = "no record";
		sessionStorage.setItem('wins', 0);
		sessionStorage.setItem('losses', 0);
		_save.wins = 0;
		_save.losses = 0;
	} else {
		//user is already registered
		_readStatus = 'OK';
		//let dbData = _snapshot.val();
		sessionStorage.setItem('wins', dbData.wins);
		sessionStorage.setItem('losses', dbData.losses);
		_save.wins = dbData.wins;
		_save.losses = dbData.losses;
	}
}

function fbR_procReadUDScores2(_readStatus, _path, _key, _snapshot, _save, _error) {
	console.log('%c fbR_procReadUDScores: path = ' + _path,
				'color:' + COLFBR_C + ';' + 'background-color:' + COLFBR_B);

	dbData = _snapshot.val();
	if (dbData == null) {
		//User is not registered
		_readStatus = "no record";
		sessionStorage.setItem('wins', 0);
		sessionStorage.setItem('losses', 0);
		_save.wins = 0;
		_save.losses = 0;
	} else {
		//user is already registered
		_readStatus = 'OK';
		//let dbData = _snapshot.val();
		sessionStorage.setItem('wins', dbData.wins);
		sessionStorage.setItem('losses', dbData.losses);
		_save.wins = dbData.wins;
		_save.losses = dbData.losses;
	}
}

/*****************************************************/
// END OF CODE
/*****************************************************/