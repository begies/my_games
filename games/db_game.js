/**************************************************************/
// db_game.js
//
// Written by Mr Bob, Term 4 2022
// Dodge the Bacteria game
//
// All variables & function begin with db_  all const with DB_
// Diagnostic code lines have a comment appended to them //DIAG
//
//  v01 Basic game.
//  v02 Rename all variable to db_ and const to DB_
/**************************************************************/
const DB_COL_C = 'black';
const DB_COL_B = '#F0E68C';
console.log('%c db_game.js',
            'color: blue; background-color: white;');

// General game CONSTANTS
const DB_MINVEL        = 6;
const DB_MAXVEL        = 10;

const DB_BASETIME      = 300;

// General game variables
var   db_background;
var   db_resetActive   = false;
var   db_timer;
var   db_level         = 0;
var   db_lives;
var   db_numBacteria;
var   db_seconds;
var   db_score;
let   db_bacteriaGroup;

var   db_scoreArray    = [];

// Dodge the Bacteria score
var db_fb_score = {
  uid:      '?',
  gameName: '?',
  score:    '0',
  level:    '0',
  bacteria: '0',
  time:     '0',
  ratio:    '0',
  wins:     '0',
  losses:   '0'
}; 

var   db_levelArray    = [];

class Level {
  // DEFINE LEVEL'S PROPERTIES
  constructor(_spaceShipDia,
              _bacteriaDia,  _numBacteria, 
              _lives, _secs, _velScale, _bg) {
    this.spaceShipDia	  = _spaceShipDia;
    this.bacteriaDia	  = _bacteriaDia;
    this.numBacteria 	  = _numBacteria;
    this.lives          = _lives;
    this.secs           = _secs;
    this.velScale 	    = _velScale;
    this.bg 	          = _bg;    
  }
}

/**************************************************************/
// preload()
// Called by P5 before setup
/**************************************************************/
function preload() {
  console.log('%c DB preload(): ', 
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');
  
  db_imgBGVein1      = loadImage('../assets/background/insideVeins1.png');
  db_imgBGVein2      = loadImage('../assets/background/insideVeins2.webp');
  db_imgBGVein3      = loadImage('../assets/background/insideVeins3.webp');
  db_imgBGVein4      = loadImage('../assets/background/Romulan.webp');
  db_imgBacteria     = loadImage('../assets/images/evilBacteria.png');
  db_imgSpaceship    = loadImage('../assets/images/spaceship.png');
  db_gameOverImg     = loadImage('../assets/background/gameOver.png');

  db_spaceSound      = loadSound('../assets/sounds/spaceAtmospheric.mp3');
  db_collect         = loadSound('../assets/sounds/collect.mp3');
  db_explosion       = loadSound('../assets/sounds/explosion.mp3');
  db_levelSuccess    = loadSound('../assets/sounds/levelSuccess.mp3');
  db_levelSuccess.setVolume(0.1);
  db_levelFail       = loadSound('../assets/sounds/levelFail.mp3');
  db_gameFail        = loadSound('../assets/sounds/gameFail.mp3');
  db_gameSuccess     = loadSound('../assets/sounds/gameSuccess.mp3');
  //db_spaceSound.setVolume(0.1);
}

/**************************************************************/
// setup()
/**************************************************************/
function setup() {
  console.log('%c DB setup(): ',
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');
  
  html_buildCanvas();
  html_mouseTrail();         // Register mouse move event to build mouse trail
  // Register slider event to alter volume
  html_volume([db_spaceSound, db_collect, db_explosion,
               db_levelSuccess, db_levelFail, db_gameFail, db_gameSuccess]);
  noLoop();                  // No point looping thru draw until START clicked

  db_fb_score.uid        = fbD_userDetails.uid;
  db_fb_score.gameName   = fbD_userDetails.gameName;
  p_gameName.textContent = fbD_userDetails.gameName;
    
  fb_readRec(DB, fbD_userDetails.uid, db_fb_score, fbR_procRScore);
   
  // Construct levels array
  //Level(spaceShipDia, bacteriaDia, numBacteria, lives, secs, velScale, bg)
  db_levelArray[0] = new Level(30, 50, 1, 4, 20, 0.1, db_imgBGVein1);
  db_levelArray[1] = new Level(30, 50, 2, 4, 20, 0.2, db_imgBGVein2);
  db_levelArray[2] = new Level(30, 50, 3, 4, 20, 0.3, db_imgBGVein3);
  db_levelArray[3] = new Level(30, 50, 4, 4, 20, 0.4, db_imgBGVein4);
  //db_levelArray[3] = new Level(30, 50, 5, 4, 20, 0.5, db_imgBGSpace);
    
  db_imgSpaceship.resize(db_levelArray[db_level].spaceShipDia, 
                         db_levelArray[db_level].spaceShipDia);
  db_imgBacteria.resize(db_levelArray[db_level].bacteriaDia, 
                        db_levelArray[db_level].bacteriaDia);
  
  // Build game screen & enable buttons
  db_reset();
  b_leaderboard.classList.remove("w3-disabled");
  b_inst.classList.remove("w3-disabled");
  b_startPause.classList.remove("w3-disabled");
  b_reset.classList.remove("w3-disabled");
}

/**************************************************************/
// draw()
/**************************************************************/
function draw() {
  clear();
  background(db_background);

  if(html_gameActive == 'p') {
    noLoop();                          // Game paused
  }
  else if (html_gameActive == 'a') {   // Game active
    db_spaceShip.moveTowards(mouse.x, mouse.y);
    db_spaceShip. rotateTowards (mouseX, mouseY);
  }
}

/**************************************************************/
// db_load()
// Called by db_game.html onload
// Update firebase I/O status from SessionStorage
// Input:  n/a
// Return: n/a
/**************************************************************/
function db_load() {
  console.log('%c db_load(): ',
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');
  
  // Get fb I/O status from SessionStorage
  p_fbLogin.textContent    = sessionStorage.getItem('fb_loginStatus');
  p_fbReadRec.textContent  = sessionStorage.getItem('fb_readRecStatus');
  p_fbReadAll.textContent  = sessionStorage.getItem('fb_readAllStatus');
  p_fbWriteRec.textContent = sessionStorage.getItem('fb_writeRecStatus');
}

/**************************************************************/
// db_admin()
// Called by game page ADMIN button
// Pause the game and goto admin page
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function db_admin() {
  console.log('%c db_admin(): ',
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  html_gameActive = 'a';
  db_startPause();
  ad_admin();
}

/**************************************************************/
// db_leaderboard(_opt)
// Called by game page LEADERBOARD button 
// Read the top DB score records & display in table
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function db_leaderboard(_opt) {
  console.log('%c db_leaderboard(): opt= ' + _opt +
              ' html_gameActive= ' + html_gameActive, 
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  if (_opt == 'd') {
    db_spaceSound.stop();
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(db_timer);

    if (html_gameActive != false) {
      b_startPause.style.backgroundColor = "lightgreen";
      b_startPause.textContent = "RE-START";
      html_gameActive = 'p';
    }
   
    html_swapPage(null, "s_leaderbPage");
    html_posElement("s_leaderbPage", "defaultCanvas0");
    html_swapPage("defaultCanvas0", null);
  
    db_scoreArray = [];
    fb_readSortedLimit(DB, fbR_procLeaderboard, db_scoreArray, 
                       'score', HTML_NUMLBOARD);
  }
  else {
    html_swapPage('s_leaderbPage', "defaultCanvas0");
    b_inst.classList.remove("w3-disabled");
    b_leaderboard.classList.remove("w3-disabled");
    b_startPause.classList.remove("w3-disabled");
    b_reset.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// db_instructions(_opt)
// Called by game page INSTRUCTIONS button
// Disable game buttons & display game instructions
// Input:  opt = 'd' to display instructions & 'r' return
// Return: n/a
/**************************************************************/
function db_instructions(_opt) {
  console.log('%c db_instructions(): opt= ' + _opt,
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  if (_opt == 'd') {
    db_spaceSound.stop();
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(db_timer);

    if (html_gameActive != false) {
      b_startPause.style.backgroundColor = "lightgreen";
      b_startPause.textContent = "RE-START";
      html_gameActive = 'p';
    }
    
    html_swapPage(null, "s_instPage");
    html_posElement("s_instPage", "defaultCanvas0");
    html_swapPage("defaultCanvas0", null);
  }
  else {
    html_swapPage('s_instPage', "defaultCanvas0");
    b_inst.classList.remove("w3-disabled");
    b_leaderboard.classList.remove("w3-disabled");
    b_startPause.classList.remove("w3-disabled");
    b_reset.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// db_startPause()
// Called by game page START/PAUSE button
// Enable RESET button
// If game; Currently active, pause it.
//          Currently paused, re-start it.
//          Over, pause it & clear timer
// Input:  n/a
// Return: n/a
/**************************************************************/
function db_startPause() {
  console.log('%c db_startPause(): html_gameActive= ' + html_gameActive +
              ' db_background= ' + db_background +
              ' db_level= ' + (db_level+1),
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  p_msg.textContent = '';
  b_reset.classList.remove("w3-disabled");
  db_resetActive = false;

  // Game is active so pause it
  if (html_gameActive == 'a') {
    // Game currently ACTIVE so PAUSE IT
    db_spaceSound.stop();
    html_gameActive = 'p';     
    clearInterval(db_timer);
    
    b_startPause.style.backgroundColor = "lightgreen";
    b_startPause.textContent = "RE-START";
  }

  // Game is paused so make it active
  else if (html_gameActive == 'p') {
    // Game currently PAUSED so make it ACTIVE
    db_spaceSound.play();
    db_spaceSound.loop();
    db_timer = setInterval(db_timerFunc, 1000);
    html_gameActive = 'a';
    loop();

    b_startPause.style.backgroundColor = "grey";
    b_startPause.textContent = "PAUSE";
  }

  // Game is over
  else if (html_gameActive == 'e') {
    html_gameActive = 'p';     
    clearInterval(db_timer);
  }
}

/**************************************************************/
// db_reset()
// Called by setup() & game page RESET button
// If RESET button disabled exit.
// If game has been running cancel it, create & start new game &
//  disable RESET button.
// If game not yet started, create a new game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function db_reset() {
    console.log('%c db_reset(): db_resetActive= ' + db_resetActive + 
                ' html_gameActive= ' + html_gameActive, 
                'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  if (db_resetActive) {
    return;
  }

  if (html_gameActive == 'a' || html_gameActive == 'p' || 
      html_gameActive == 'e') {
    // Game has been running so cancel it & disable RESET button.
    b_reset.classList.add("w3-disabled");
    db_resetActive = true;
    clearInterval(db_timer);
    db_spaceSound.stop();
    
    // Delete all previous sprites
    allSprites.remove();
  }
  
  // Create spaceShip, bacteria & wall sprites
  db_spaceShip = new Sprite(width/2, 30, db_levelArray[db_level].spaceShipDia/2, 'd');
  db_spaceShip.image = (db_imgSpaceship);
  //db_spaceShip.debug = true;
  db_createBacteriaSprites();
  db_createWalls();
  
  // Reset counters and update display
  db_background          = db_levelArray[db_level].bg;
  db_seconds             = db_levelArray[db_level].secs;    
  db_numBacteria         = db_levelArray[db_level].numBacteria;
  db_lives               = db_levelArray[db_level].lives;
  db_level               = 0;
  html_gameActive        = 'p';

  // Update display
  p_msg.textContent      = '';
  p_level.textContent    = (db_level+1);
  p_bacteria.textContent = db_numBacteria;
  p_lives.textContent    = db_lives;
  p_time.textContent     = db_seconds;
  p_ratio.textContent    = 0;
  p_score.textContent    = 0;
  
  b_startPause.style.backgroundColor = "green";
  b_startPause.textContent = "START";
  b_startPause.classList.remove("w3-disabled");
}

/**************************************************************/
// db_timerFunc()
// Called by timer event started by db_startPause
// Subtract 1 sec, if out of time level is over else 
//  update html timer paragraph.
// Input:  n/a
// Return: n/a
/**************************************************************/
function db_timerFunc() {
  if (html_gameActive) {
    db_seconds--; 
    if (db_seconds <= 0) {
      db_levelOver(0, 'You won level ' + (db_level+1), 'green');
    }
    p_time.textContent = db_seconds;
  }
}

/**************************************************************/
// db_createBacteriaSprites()
// Called by db_reset() when game is starting
// Create bacteria sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function db_createBacteriaSprites() { 
  console.log('%c db_createBacteriaSprites(): db_level= ' + (db_level+1) +
              ' num= ' + db_levelArray[db_level].numBacteria, 
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  db_bacteriaGroup = new Group();
  
  for (var i = 0; i < db_levelArray[db_level].numBacteria; i++) {
    db_x = random(db_levelArray[db_level].bacteriaDia/2, 
                  width-db_levelArray[db_level].bacteriaDia/2)
    db_y = random(db_levelArray[db_level].bacteriaDia/2, 
                  height-db_levelArray[db_level].bacteriaDia/2)
           
    db_bacteria = new Sprite(db_x, db_y, db_levelArray[db_level].bacteriaDia, 'd');
    db_bacteria.vel.x = random(DB_MINVEL, DB_MAXVEL) * random([-1, 1]) * db_levelArray[db_level].velScale;
    db_bacteria.vel.y = random(DB_MINVEL, DB_MAXVEL) * random([-1, 1]) * db_levelArray[db_level].velScale;
    //db_bacteria.vel.x = 0;
    //db_bacteria.vel.y = 0;
    db_bacteria.image = (db_imgBacteria);
    db_bacteriaGroup.add(db_bacteria);
  }
  
  db_bacteriaGroup.bounciness = 1;
  db_bacteriaGroup.friction   = 0;
  db_spaceShip.collides(db_bacteriaGroup, db_bacteriaHitYou);
}

/*******************************************************/
// db_bacteriaHitYou(db_bacteriaGroup)
// Called by event registered in db_createBacteriaSprites()
// Bacteria hit spaceShip so loose a life & 
//  end level if no more lives
// Input:  n/a
// Return: n/a
/*******************************************************/
function db_bacteriaHitYou(db_bacteriaGroup) {
  console.log('%c db_bacteriaHitYou(): db_numBacteria= ' + db_numBacteria,
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  db_explosion.play();
  db_lives--;
  if (db_lives <= 0) {
    db_levelOver(2, 'You ran out of lives', 'red');
  }
}

/**************************************************************/
// db_createWalls()
// Called by db_reset() when game is starting
// Create wall sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function db_createWalls() {
  console.log('%c db_createWalls(): ',
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  db_wallGroup = new Group();
  
  wallLH  = new db_wallGroup.Sprite(      0, height/2,     8, height, 'k');	
  wallRH  = new db_wallGroup.Sprite(  width, height/2,     8, height, 'k');
  wallTop = new db_wallGroup.Sprite(width/2,        0, width,      8, 'k');          
	wallBot = new db_wallGroup.Sprite(width/2,   height, width,      8, 'k');

  wallLH.shapeColor  = color("purple");
  wallRH.shapeColor  = color("purple");
  wallTop.shapeColor = color("purple");
  wallBot.shapeColor = color("purple");
}

/**************************************************************/
// db_levelOver(_reason, _msg, _colour)
// Called by db_bacteriaHitYou() if no more lives or 
//           db_timerFunc() if out of time
// Level is over, so deactivate game, If new high score, write to db
// Input:  _reason = 0 if no more balls, 
//                   1 if no more time
//                   2 if CLICKed on terminator
//         _msg is message to display
//         _colour is colour of message
// Return: n/a
/**************************************************************/
function db_levelOver(_reason, _msg, _colour) {
  console.log('%c db_levelOver(): reason= ' + _reason, 
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');
  
  clearInterval(db_timer);
  db_spaceSound.stop();
  b_startPause.classList.add("w3-disabled");
  
  // Delete any previous spaceShip & bacteria sprites
  db_spaceShip.remove();
  db_bacteriaGroup.remove();
  
  // Calc win or loss
  if (_reason == 0) {
    db_fb_score.wins++;
    db_levelSuccess.play()
  }
  else {
    db_fb_score.losses++;
    db_levelFail.play();
  }
  p_msg.textContent  = _msg
  p_msg.style.color  = _colour;
  
  // Calc new ratio & time taken
  db_ratio = Math.round((db_levelArray[db_level].numBacteria - 
                         db_numBacteria) / db_levelArray[db_level].numBacteria
                         * 1000) / 10;
  db_seconds = db_levelArray[db_level].secs - db_seconds;

  // Calc new score by concatenating level, lives, ratio & time
  db_score = Number("" + (db_level+1) + db_lives + db_ratio + (DB_BASETIME - db_seconds));
  
  if (db_score > db_fb_score.score) {
    db_fb_score.score    = db_score;
    db_fb_score.level    = db_level+1;
    db_fb_score.ratio    = db_ratio;
    db_fb_score.bacteria = db_numBacteria;
    db_fb_score.time     = db_seconds;
  }

  // Update session storage & write updated DB score object to fb
  //  even its only updated win/losses
  sessionStorage.setItem('game_score', JSON.stringify(db_fb_score));
  fb_writeRec(DB, fbD_userDetails.uid, db_fb_score, fbR_procWScore);

  html_gameActive = 'p'; 
  
  // Check for next level ONLY if won current level
  if (_reason == 0) {       // Won current level 
    if (db_level+1 < db_levelArray.length) {
      db_level++;           // Set to next level
      db_prepLevel();
    }
    else {                  // No more levels = game over
      db_gameOver(_reason);
    }
  }
    
  //else if (_reason == 2) {  // CLICKed on terminator = game over
  //   db_gameOver(_reason);
  //}
  else {                    // Got hit br bacteria = play same level
    db_prepLevel();
  }

  // Reset counters & update display
  db_seconds             = db_levelArray[db_level].secs;    
  db_numBacteria         = db_levelArray[db_level].numBacteria;

  p_level.textContent    = db_level+1;
  p_bacteria.textContent = db_numBacteria;
  p_lives.textContent    = db_lives;
  p_time.textContent     = db_seconds;
  p_ratio.textContent    = 0;
  p_score.textContent    = 0;

  /*----------------------------------------------------------*/
  // db_prepLevel()
  // Called by db_levelOver()
  // Prepare for level to play
  // Input:  n/a
  // Return: n/a
  /*----------------------------------------------------------*/
  function db_prepLevel() {
    console.log('%c db_prepLevel(): ', 
                'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');
    
    b_reset.classList.add("w3-disabled");
    db_resetActive = true;

    // Create new level's spaceShip & bacteria sprites
    db_spaceShip = new Sprite(width/2, 30, db_levelArray[db_level].spaceShipDia/2, 'd');
    db_spaceShip.image = (db_imgSpaceship);
    //db_spaceShip.debug = true;
    db_createBacteriaSprites();
     
    // Reset counters and update display
    db_background   = db_levelArray[db_level].bg;
    
    b_startPause.style.backgroundColor = "green";
    b_startPause.textContent = "START";
    b_startPause.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// db_gameOver(_reason)
// Called by db_levelOver() 
// Game is over, so deactivate game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function db_gameOver(_reason) {
  console.log('%c db_gameOver(): reason= ' + _reason,
              'color: ' + DB_COL_C + '; background-color: ' + DB_COL_B + ';');

  if ((db_level+1) < db_levelArray.length) {
    db_gameFail.play();
  }
  else {
    db_gameSuccess.play();
  }
  
  db_background   = db_gameOverImg;
  html_gameActive = 'e';
  b_startPause.classList.add("w3-disabled");
  db_resetActive  = false;
      
  db_level = 0;    // Set to 1st level
}

/**************************************************************/
//   END OF APP
/**************************************************************/