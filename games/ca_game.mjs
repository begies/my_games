/**************************************************************/
// ca_game.js
//
// Written by Mr Bob, Term 4 2022
// Collect Aliens game
//
// All variables & function begin with ca_  all const with CA_
// Diagnostic code lines have a comment appended to them //DIAG
//
//  v01 Basic game.
//  v02 Rename all variable to ca_ and const to CA_
/**************************************************************/
const CA_COL_C = 'black';
const CA_COL_B = '#F0E68C';
console.log('%c ca_game.js',
            'color: blue; background-color: white;');

/**************************************************************/
// Import all external constants & functions required
/**************************************************************/
// Import all constants & functions required from html_manager module
import { HTML_NUMLBOARD, 
         html_buildCanvas, html_mouseTrail, html_volume, 
         html_swapPage, html_posElement }
from '/manager/html_manager.mjs';

// Import all constants & functions required from fb_io module
import { fb_readRec, fb_writeRec, fb_readSortedLimit } 
from '/fb/fb_io.mjs';

// Import all constants & functions required from fbR_manager module
import { fbR_procWScore, fbR_procRScore, fbR_procLeaderboard }
from '/fb/fbR_manager.mjs';

/**************************************************************/
// General game CONSTANTS
const CA_MINVEL        = 6;
const CA_MAXVEL        = 10;

const CA_BASETIME      = 300;

// General game variables
var   ca_gameActive    = false;
var   ca_background;
var   ca_resetActive   = false;
var   ca_timer;
var   ca_level         = 0;
var   ca_lives;
var   ca_numAliens;
var   ca_seconds;
var   ca_score;
var   ca_ratio;

var   ca_scoreArray    = [];

// Collect Aliens score
var ca_fb_score = {
  uid:      '?',
  gameName: '?',
  score:    '0',
  level:    '0',
  lives:    '0',
  aliens:   '0',
  time:     '0',
  ratio:    '0',
  wins:     '0',
  losses:   '0'
}; 

var   ca_spaceShip, ca_alienGroup, ca_terminatorGroup, ca_wallGroup;

var   ca_levelArray    = [];
class Level {
  // DEFINE LEVEL'S PROPERTIES
  constructor(_spaceShipDia,
              _alienDia,  _numAliens, 
              _terminatorDia, _numTerminators, 
              _lives, _secs, _velScale, _bg) {
    this.spaceShipDia	  = _spaceShipDia;
    this.alienDia	      = _alienDia;
    this.numAliens 	    = _numAliens;
    this.terminatorDia	= _terminatorDia;
    this.numTerminators	= _numTerminators;
    this.lives          = _lives;
    this.secs           = _secs;
    this.velScale 	    = _velScale;
    this.bg 	          = _bg;    
  }
}

// Define variables built in preload()
var ca_imgBGHubble, ca_imgBGUniverse, ca_imgBGStartTrek, ca_imgBGRomulan, ca_imgBGSpace;
var ca_imgAlien, ca_imgSpaceship, ca_imgEvilBacteria, ca_imgGameOver;
var ca_spaceSound, ca_collect, ca_explosion, ca_levelSuccess, ca_levelFail, ca_gameFail, ca_gameSuccess;

/**************************************************************/
// preload()
// Called by P5 before setup
/**************************************************************/
function preload() {
  console.log('%c CA preload(): ', 
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');
    
  ca_imgBGHubble     = loadImage('../assets/background/Hubble_NASA.jpg');
  ca_imgBGUniverse   = loadImage('../assets/background/scifi.jpg');
  ca_imgBGStartTrek  = loadImage('../assets/background/StarTrek.webp');
  ca_imgBGRomulan    = loadImage('../assets/background/Romulan.webp');
  ca_imgBGSpace      = loadImage('../assets/background/outerSpace.png');
  ca_imgAlien        = loadImage('../assets/images/cartoon-spaceship.png');
  ca_imgSpaceship    = loadImage('../assets/images/spaceship.png');
  ca_imgEvilBacteria = loadImage('../assets/images/evilBacteria.png');
  ca_imgGameOver     = loadImage('../assets/background/gameOver.png');

  ca_spaceSound      = loadSound('../assets/sounds/spaceAtmospheric.mp3');
  ca_collect         = loadSound('../assets/sounds/collect.mp3');
  ca_explosion       = loadSound('../assets/sounds/explosion.mp3');
  ca_levelSuccess    = loadSound('../assets/sounds/levelSuccess.mp3');
  ca_levelSuccess.setVolume(0.1);
  ca_levelFail       = loadSound('../assets/sounds/levelFail.mp3');
  ca_gameFail        = loadSound('../assets/sounds/gameFail.mp3');
  ca_gameSuccess     = loadSound('../assets/sounds/gameSuccess.mp3');
}

/**************************************************************/
// setup()
/**************************************************************/
function setup() {
  console.log('%c CA setup(): ',
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  html_buildCanvas();
  html_mouseTrail();         // Register mouse move event to build mouse trail
  // Register slider event to alter volume
  html_volume([ca_spaceSound, ca_collect, ca_explosion,
               ca_levelSuccess, ca_levelFail, ca_gameFail, ca_gameSuccess]);
  noLoop();                  // No point looping thru draw until START clicked

  ca_fb_score.uid        = fbD_userDetails.uid;
  ca_fb_score.gameName   = fbD_userDetails.gameName;
  p_gameName.textContent = fbD_userDetails.gameName;
  
  fb_readRec(CA, fbD_userDetails.uid, ca_fb_score, fbR_procRScore);
   
  // Construct levels array
  //Level(spaceShipDia, alienDia, numAliens, terminatorDia, numTerminators, 
  //  lives, secs, velScale, bg)
  ca_levelArray[0] = new Level(30, 50, 1, 30, 1, 4, 20, 0.1, ca_imgBGHubble);
  ca_levelArray[1] = new Level(30, 50, 2, 30, 2, 4, 20, 0.2, ca_imgBGUniverse);
  ca_levelArray[2] = new Level(30, 50, 3, 30, 3, 4, 20, 0.3, ca_imgBGRomulan);
  ca_levelArray[3] = new Level(30, 50, 4, 30, 4, 4, 20, 0.4, ca_imgBGStartTrek);
  ca_levelArray[3] = new Level(30, 50, 5, 30, 5, 4, 20, 0.5, ca_imgBGSpace);
    
  ca_imgSpaceship.resize(ca_levelArray[ca_level].spaceShipDia, 
                         ca_levelArray[ca_level].spaceShipDia);
  ca_imgAlien.resize(ca_levelArray[ca_level].alienDia, 
                     ca_levelArray[ca_level].alienDia);
  ca_imgEvilBacteria.resize(ca_levelArray[ca_level].terminatorDia, 
                            ca_levelArray[ca_level].terminatorDia);

  // Build game screen & enable buttons
  ca_reset();
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
  background(ca_background);

  if(ca_gameActive == 'p') {
    noLoop();                          // Game paused
  }
  else if (ca_gameActive == 'a') {   // Game active
    ca_spaceShip.moveTowards(mouse.x, mouse.y);
    ca_spaceShip. rotateTowards (mouseX, mouseY);
  }
}

/**************************************************************/
// ca_admin()
// Called by game page ADMIN button
// Pause the game and goto admin page
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function ca_admin() {
  console.log('%c ca_admin(): ',
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  ca_gameActive = 'a';
  ca_startPause();
  ad_admin();
}

/**************************************************************/
// ca_leaderboard(_opt)
// Called by game page LEADERBOARD button 
// Read the top CA score records & display in table
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function ca_leaderboard(_opt) {
  console.log('%c ca_leaderboard(): opt= ' + _opt +
              ' ca_gameActive= ' + ca_gameActive, 
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  if (_opt == 'd') {
    ca_spaceSound.stop();
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(ca_timer);

    if (ca_gameActive != false) {
      b_startPause.style.backgroundColor = "lightgreen";
      b_startPause.textContent = "RE-START";
      ca_gameActive = 'p';
    }
   
    html_swapPage(null, "s_leaderbPage");
    html_posElement("s_leaderbPage", "defaultCanvas0");
    html_swapPage("defaultCanvas0", null);
  
    ca_scoreArray = [];
    fb_readSortedLimit(CA, fbR_procLeaderboard, ca_scoreArray, 
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
// ca_instructions(_opt)
// Called by game page INSTRUCTIONS button
// Disable game buttons & display game instructions
// Input:  opt = 'd' to display instructions & 'r' return
// Return: n/a
/**************************************************************/
function ca_instructions(_opt) {
  console.log('%c ca_instructions(): opt= ' + _opt, 
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  if (_opt == 'd') {
    ca_spaceSound.stop();
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(ca_timer);

    if (ca_gameActive != false) {
      b_startPause.style.backgroundColor = "lightgreen";
      b_startPause.textContent = "RE-START";
      ca_gameActive = 'p';
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
// ca_startPause()
// Called by game page START/PAUSE button
// Enable RESET button
// If game; Currently active, pause it.
//          Currently paused, re-start it.
//          Over, pause it & clear timer
// Input:  n/a
// Return: n/a
/**************************************************************/
function ca_startPause() {
  console.log('%c ca_startPause(): ca_gameActive= ' + ca_gameActive +
              ' ca_background= ' + ca_background +
              ' ca_level= ' + (ca_level+1),
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  p_msg.textContent = '';
  b_reset.classList.remove("w3-disabled");
  ca_resetActive = false;

  // Game is active so pause it
  if (ca_gameActive == 'a') {
    // Game currently ACTIVE so PAUSE IT
    ca_spaceSound.stop();
    ca_gameActive = 'p';     
    clearInterval(ca_timer);
    
    b_startPause.style.backgroundColor = "lightgreen";
    b_startPause.textContent = "RE-START";
  }

  // Game is paused so make it active
  else if (ca_gameActive == 'p') {
    // Game currently PAUSED so make it ACTIVE
    ca_spaceSound.play();
    ca_spaceSound.loop();
    ca_timer = setInterval(ca_timerFunc, 1000);
    ca_gameActive = 'a';
    loop();

    b_startPause.style.backgroundColor = "grey";
    b_startPause.textContent = "PAUSE";
  }

  // Game is over
  else if (ca_gameActive == 'e') {
    ca_gameActive = 'p';     
    clearInterval(ca_timer);
  }
}

/**************************************************************/
// ca_reset()
// Called by setup() & game page RESET button
// If RESET button disabled exit.
// If game has been running cancel it, create & start new game &
//  disable RESET button.
// If game not yet started, create a new game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function ca_reset() {
    console.log('%c ca_reset(): ca_resetActive= ' + ca_resetActive + 
                ' ca_gameActive= ' + ca_gameActive, 
                'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  if (ca_resetActive) {
    return;
  }

  if (ca_gameActive == 'a' || ca_gameActive == 'p' || 
      ca_gameActive == 'e') {
    // Game has been running so cancel it & disable RESET button.
    b_reset.classList.add("w3-disabled");
    ca_resetActive = true;
    clearInterval(ca_timer);
    ca_spaceSound.stop();
    
    // Delete all previous sprites
    allSprites.remove();
  }
  
  // Create spaceShip, terminators, aliens & wall sprites
  ca_spaceShip = new Sprite(width/2, 30, ca_levelArray[ca_level].spaceShipDia/2, 'd');
  ca_spaceShip.image = (ca_imgSpaceship);
  //ca_spaceShip.debug = true;
  ca_createTerminators();
  ca_createAlienSprites();
  ca_createWalls();
  
  // Reset counters and update display
  ca_background        = ca_levelArray[ca_level].bg;
  ca_seconds           = ca_levelArray[ca_level].secs;    
  ca_numAliens         = ca_levelArray[ca_level].numAliens;
  ca_lives             = ca_levelArray[ca_level].lives;
  ca_level             = 0;
  ca_gameActive      = 'p';

  // Update display
  p_msg.textContent    = '';
  p_level.textContent  = (ca_level+1);
  p_aliens.textContent = ca_numAliens;
  p_lives.textContent  = ca_lives;
  p_time.textContent   = ca_seconds;
  p_ratio.textContent  = 0;
  p_score.textContent  = 0;
  
  b_startPause.style.backgroundColor = "green";
  b_startPause.textContent = "START";
  b_startPause.classList.remove("w3-disabled");
}

/**************************************************************/
// ca_timerFunc()
// Called by timer event started by ca_startPause
// Subtract 1 sec, if out of time level is over else 
//  update html timer paragraph.
// Input:  n/a
// Return: n/a
/**************************************************************/
function ca_timerFunc() {
  if (ca_gameActive) {
    ca_seconds--; 
    if (ca_seconds <= 0) {
      ca_levelOver(1, 'You ran out of time', 'fuchsia');
    }
    p_time.textContent = ca_seconds;
  }
}

/**************************************************************/
// ca_createAlienSprites()
// Called by ca_reset() when game is starting
// Create alien sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function ca_createAlienSprites() { 
  console.log('%c ca_createAlienSprites(): ca_level= ' + (ca_level+1) +
              ' num= ' + ca_levelArray[ca_level].numAliens, 
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  ca_alienGroup = new Group();
  
  for (var i = 0; i < ca_levelArray[ca_level].numAliens; i++) {
    var ca_x = random(ca_levelArray[ca_level].alienDia/2, 
                      width-ca_levelArray[ca_level].alienDia/2)
    var ca_y = random(ca_levelArray[ca_level].alienDia/2, 
                      height-ca_levelArray[ca_level].alienDia/2)
           
    var ca_alien = new Sprite(ca_x, ca_y, ca_levelArray[ca_level].alienDia, 'd');
    ca_alien.vel.x = random(CA_MINVEL, CA_MAXVEL) * random([-1, 1]) * ca_levelArray[ca_level].velScale;
    ca_alien.vel.y = random(CA_MINVEL, CA_MAXVEL) * random([-1, 1]) * ca_levelArray[ca_level].velScale;
    //ca_alien.vel.x = 0;
    //ca_alien.vel.y = 0;
    ca_alien.image = (ca_imgAlien);
    ca_alienGroup.add(ca_alien);
  }
  
  ca_alienGroup.bounciness = 1;
  ca_alienGroup.friction   = 0;
  ca_spaceShip.collides(ca_alienGroup, ca_alienCaught);
}

/*******************************************************/
// ca_alienCaught(ca_terminator, ca_alienGroup)
// Called by event registered in ca_createAlienSprites()
// Spaceship caught an alien so delete the alien
// Input:  n/a
// Return: n/a
/*******************************************************/
function ca_alienCaught(ca_terminator, ca_alienGroup) {
  console.log('%c ca_alienCaught(): ca_numAliens= ' + ca_numAliens,
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  ca_collect.play();
  ca_alienGroup.remove();
  
  ca_numAliens--;
  p_aliens.textContent = ca_numAliens;
  // Calc new ratio 
  ca_ratio = Math.round((ca_levelArray[ca_level].numAliens - 
                         ca_numAliens) / ca_levelArray[ca_level].numAliens
                         * 1000) / 10;
  p_ratio.textContent = ca_ratio;
  if (ca_numAliens <= 0) {
    ca_levelOver(0, 'You won level ' + (ca_level+1), 'green');
  }
}

/**************************************************************/
// ca_createTerminators()
// Called by ca_reset() when game is starting
// Create terminator sprites - out of the way of the spaceShip...
// Input:  n/a
// Return: n/a
/**************************************************************/
function ca_createTerminators() { 
  console.log('%c ca_createTerminators(): ca_level= ' + (ca_level+1) + 
              ' num= ' + ca_levelArray[ca_level].numTerminators, 
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  ca_terminatorGroup = new Group();
  
  for (var i = 0; i < ca_levelArray[ca_level].numTerminators; i++) {
    var ca_x = random(ca_levelArray[ca_level].alienDia/2, 
                      width-ca_levelArray[ca_level].alienDia/2)
    var ca_y = random((height-ca_levelArray[ca_level].alienDia/2)/2, 
                       height-ca_levelArray[ca_level].alienDia/2)
           
    var ca_terminator = new Sprite(ca_x, ca_y, ca_levelArray[ca_level].alienDia/2, 'd');
    ca_terminator.vel.x = random(CA_MINVEL, CA_MAXVEL) * random([-1, 1]) * ca_levelArray[ca_level].velScale;
    ca_terminator.vel.y = random(CA_MINVEL, CA_MAXVEL) * random([-1, 1]) * ca_levelArray[ca_level].velScale;
    //ca_terminator.vel.x = 0;
    //ca_terminator.vel.y = 0;
    //ca_terminator.debug = true;
    ca_terminator.image = (ca_imgEvilBacteria);  
    ca_terminatorGroup.add(ca_terminator);
  }
  
  ca_terminatorGroup.bounciness = 1;
  ca_terminatorGroup.friction   = 0;
  ca_spaceShip.collides(ca_terminatorGroup, ca_terminatorHitSpaceShip);
}

/*******************************************************/
// ca_alienCaught(ca_terminator, ca_alienGroup)
// Called by event registered in ca_createAlienSprites()
// Terminator hit spaceShip so loose a life & 
//  end level if no more lives
// Input:  n/a
// Return: n/a
/*******************************************************/
function ca_terminatorHitSpaceShip(ca_terminator, ca_alienGroup) {
  console.log('%c ca_terminatorHitSpaceShip(): ca_lives= ' + ca_lives,
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  ca_explosion.play();
  ca_lives--;
  if (ca_lives <= 0) {
    ca_levelOver(2, 'You ran out of lives', 'red');
  }
}

/**************************************************************/
// ca_createWalls()
// Called by ca_reset() when game is starting
// Create wall sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function ca_createWalls() {
  console.log('%c ca_createWalls(): ',
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  ca_wallGroup = new Group();
  
  var wallLH  = new ca_wallGroup.Sprite(      0, height/2,     8, height, 'k');	
  var wallRH  = new ca_wallGroup.Sprite(  width, height/2,     8, height, 'k');
  var wallTop = new ca_wallGroup.Sprite(width/2,        0, width,      8, 'k');          
	var wallBot = new ca_wallGroup.Sprite(width/2,   height, width,      8, 'k');

  wallLH.shapeColor  = color("purple");
  wallRH.shapeColor  = color("purple");
  wallTop.shapeColor = color("purple");
  wallBot.shapeColor = color("purple");
}

/**************************************************************/
// ca_levelOver(_reason, _msg, _colour)
// Called by ca_alienCaught() if no more aliens or
//           ca_terminatorHitSpaceShip() if out of lives or
//           ca_timerFunc() if out of time
// Level is over, so deactivate game, If new high score, write to db
// Input:  _reason = 0 if no more balls, 
//                   1 if no more time
//                   2 if CLICKed on terminator
//         _msg is message to display
//         _colour is colour of message
// Return: n/a
/**************************************************************/
function ca_levelOver(_reason, _msg, _colour) {
  console.log('%c ca_levelOver(): reason= ' + _reason, 
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');
  
  clearInterval(ca_timer);
  ca_spaceSound.stop();
  b_startPause.classList.add("w3-disabled");
  
  // Delete any previous spaceShip, alien & terminator sprites
  ca_spaceShip.remove();
  ca_alienGroup.remove();
  ca_terminatorGroup.remove();
  
  // Calc win or loss
  if (_reason == 0) {
    ca_fb_score.wins++;
    ca_levelSuccess.play()
  }
  else {
    ca_fb_score.losses++;
    ca_levelFail.play();
  }
  p_msg.textContent  = _msg
  p_msg.style.color  = _colour;
  
  // Calc new ratio & time taken
  ca_ratio = Math.round((ca_levelArray[ca_level].numAliens - 
                         ca_numAliens) / ca_levelArray[ca_level].numAliens
                         * 1000) / 10;
  ca_seconds = ca_levelArray[ca_level].secs - ca_seconds;

  // Calc new score by concatenating level, lives, ratio & time
  ca_score = Number("" + (ca_level+1) + ca_lives + ca_ratio + (CA_BASETIME - ca_seconds));
  
  if (ca_score > ca_fb_score.score) {
    ca_fb_score.score  = ca_score;
    ca_fb_score.level  = ca_level+1;
    ca_fb_score.ratio  = ca_ratio;
    ca_fb_score.aliens = ca_numAliens;
    ca_fb_score.time   = ca_seconds;
  }

  // Update session storage & write updated CA score object to fb
  //  even its only updated win/losses
  sessionStorage.setItem('game_score', JSON.stringify(ca_fb_score));
  fb_writeRec(CA, fbD_userDetails.uid, ca_fb_score, fbR_procWScore);

  ca_gameActive = 'p'; 
  
  // Check for next level ONLY if won current level
  if (_reason == 0) {       // Won current level 
    if (ca_level+1 < ca_levelArray.length) {
      ca_level++;           // Set to next level
      ca_prepLevel();
    }
    else {                  // No more levels = game over
      ca_gameOver(_reason);
    }
  }
    
  else if (_reason == 2) {  // CLICKed on terminator = game over
     ca_gameOver(_reason);
  }
  else {                    // Ran out of time = play same level
    ca_prepLevel();
  }

  // Reset counters & update display
  ca_seconds           = ca_levelArray[ca_level].secs;    
  ca_numAliens         = ca_levelArray[ca_level].numAliens;

  p_level.textContent  = ca_level+1;
  p_aliens.textContent = ca_numAliens;
  p_lives.textContent  = ca_lives;
  p_time.textContent   = ca_seconds;
  p_ratio.textContent  = 0;
  p_score.textContent  = 0;

  /*----------------------------------------------------------*/
  // ca_prepLevel()
  // Called by ca_levelOver()
  // Prepare for level to play
  // Input:  n/a
  // Return: n/a
  /*----------------------------------------------------------*/
  function ca_prepLevel() {
    console.log('%c ca_prepLevel(): ',
                'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');
    
    b_reset.classList.add("w3-disabled");
    ca_resetActive = true;

    // Create new level's spaceShip, terminators & aliens sprites
    ca_spaceShip = new Sprite(width/2, 30, ca_levelArray[ca_level].spaceShipDia/2, 'd');
    ca_spaceShip.image = (ca_imgSpaceship);
    //ca_spaceShip.debug = true;
    ca_createTerminators();
    ca_createAlienSprites();
     
    // Reset counters and update display
    ca_background   = ca_levelArray[ca_level].bg;
    
    b_startPause.style.backgroundColor = "green";
    b_startPause.textContent = "START";
    b_startPause.classList.remove("w3-disabled");
  }
}

/**************************************************************/
// ca_gameOver(_reason)
// Called by ca_levelOver() 
// Game is over, so deactivate game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function ca_gameOver(_reason) {
  console.log('%c ca_gameOver(): reason= ' + _reason,
              'color: ' + CA_COL_C + '; background-color: ' + CA_COL_B + ';');

  if ((ca_level+1) < ca_levelArray.length) {
    ca_gameFail.play();
  }
  else {
    ca_gameSuccess.play();
  }
  
  ca_background   = ca_imgGameOver;
  ca_gameActive = 'e';
  b_startPause.classList.add("w3-disabled");
  ca_resetActive  = false;
      
  ca_level = 0;    // Set to 1st level
}

/**************************************************************/
// ASSIGN P5.JS FUNCTIONS TO THE GLOBAL WINDOW OBJECT
/**************************************************************/
window.preload = preload;
window.setup = setup;
window.draw = draw;

/**************************************************************/
// EXPORT FUNCTIONS
// List all the functions called by code or html outside of this module
/**************************************************************/
export { 
  preload, setup, draw, 
  ca_admin, ca_leaderboard, ca_instructions, ca_startPause, ca_reset
}
/**************************************************************/
//   END OF APP
/**************************************************************/