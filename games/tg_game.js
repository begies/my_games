/**************************************************************/
// tg_game.js
// 2 Player tank game
// Written by mr Bob Term 4 2022
/**************************************************************/
const TG_COL_C = 'black';
const TG_COL_B = '#F0E68C';
console.log('%c tg_game.js',
            'color: blue; background-color: white;');

// General game CONSTANTS
const TG_BGCOLOUR          = 'cyan';
const TG_NORMALCOLOUR      = 'purple';
const TG_ENDCOLOUR         = 'white';
const TG_TEXTSIZE          = 16;
const TG_SIDEBORDER        = 0;
const TG_TOPBORDER         = 80;
const TG_SPEED             = 2;
const TG_TANKROTATIONSPEED = 1.25;
const TG_TANKROUNDSPEED    = 10;
const TG_TANKROUNDINTERVAL = 2;
const TG_ROUNDS            = 10;
const TG_LIVES             = 3;

// General game variables
var tg_background          = TG_BGCOLOUR;
var tg_textColour          = TG_NORMALCOLOUR;
var tg_xTxt;
var tg_yTxt; 
var tg_incr                = 16;
var tg_origWidth;
var tg_origHeight;
var tg_timer;
//var html_gameActive        = false;
var tg_resetActive         = false;
var tg_seconds             = 0;

// Player 1 tank variables
var tg_p1Disabled          = false;
var tg_p1Speed             = 0;
var tg_p1Rotation          = TG_TANKROTATIONSPEED;
var tg_p1RoundTime         = TG_TANKROUNDINTERVAL;
var tg_p1RoundTimer;
var tg_p1CanFire           = true;
var tg_p1Hits              = 0;
var tg_p1Lives             = TG_LIVES;
var tg_p1Rounds            = TG_ROUNDS;
let tg_p1iconRoundGroup;

// Player 2 tank variables
var tg_p2Disabled          = false;
var tg_p2speed             = 0;
var tg_p2Rotation          = TG_TANKROTATIONSPEED;
var tg_p2RoundTime         = TG_TANKROUNDINTERVAL;
var tg_p2RoundTimer;
var tg_p2CanFire           = true;
var tg_p2Hits              = 0;
var tg_p2Lives             = TG_LIVES;
var tg_p2Rounds            = TG_ROUNDS;
let tg_p2iconRoundGroup;
let tg_warSound;

var tg_scoreArray = [];

// Tank Game score
var tg_fb_score = {
  uid:      '?',
  gameName: '?',
  score:    '0',
  level:    '0',
  lives:    '0',
  rounds:   '0',
  time:     '0',
  ratio:    '0',
  wins:     '0',
  losses:   '0'
};

/**************************************************************/
// preload()
/**************************************************************/
function preload() {
  console.log('%c TG preload(): ', 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p1Img           = loadImage('../assets/tg/grey_tank.png');
  tg_p2Img           = loadImage('../assets/tg/green_tank.png');
  tg_tankRoundImg    = loadImage('../assets/tg/tankRound.png');
  tg_lifeImg         = loadImage('../assets/tg/life.png');
  tg_armyBaseImg     = loadImage('../assets/tg/armyBase.png');
  tg_castleWallImg   = loadImage('../assets/tg/castleWall.png');
  tg_gameOverImg     = loadImage('../assets/tg/gameOver.png');

  tg_warSound        = loadSound('../assets/tg/war.mp3');
  tg_warSound.setVolume(0.1);
  tg_tankRoundSound  = loadSound('../assets/tg/tankRound.mp3');
  tg_gameOverSound   = loadSound('../assets/tg/gameOver.mp3');
}

/**************************************************************/
// setup()
/**************************************************************/
function setup() {
  console.log('%c TG setup(): ', 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  fbD_userDetails = JSON.parse(sessionStorage.getItem('googleLoginData'));
  img_photoURL.src      = fbD_userDetails.photoURL;
  b_admin.style.display = sessionStorage.getItem('fb_adminStatus');
  tg_fb_score.gameName   = fbD_userDetails.gameName;
   
  fb_readRec(TG, fbD_userDetails.uid, tg_fb_score, fbR_procRTG);
  
  tg_buildCanvas();

  textFont('Tahoma');
  textSize(TG_TEXTSIZE);
  tg_p1Img.resize(50, 20);
  tg_p2Img.resize(50, 20);

  //frameRate(10);
  tg_reset();
}

/**************************************************************/
// tg_buildCanvas() 
// Called by setup()
// Build P5 canvas, position over & make it same size as 
//  d_canvasPlaceHolder  html div
// Input:  n/a
// Return: n/a
/**************************************************************/
function tg_buildCanvas() {
  console.log('%c tg_buildCanvas(): ',
              'color: ' + COLHT_C + '; background-color: ' + COLHT_B + ';');
  
  clearInterval(html_interval);    // Clear any slideshow timer

  tg_canvasBuilt = true;
  var tg_cnvPos = document.getElementById("d_canvasPlaceHolder");
  console.log(tg_cnvPos);

  var width = tg_cnvPos.offsetWidth;
  var height = tg_cnvPos.offsetHeight;

  gameArea = new Canvas(tg_cnvPos.offsetWidth + 16,
                        tg_cnvPos.offsetHeight);
  console.log('%c tg_buildCanvas(): width/height = ' + width + '/' + height, 
              'color: ' + COLHT_C + '; background-color: ' + COLHT_B + ';');
  tg_cnv = document.getElementById('defaultCanvas0');
  tg_cnv.style.position = "absolute";
  tg_cnv.style.left     = tg_cnvPos.offsetLeft + 'px';
  tg_cnv.style.top      = tg_cnvPos.offsetTop  + 'px'; 
}

/**************************************************************/
// draw()
/**************************************************************/
function draw() {
  clear();
  background(tg_background);

  if(html_gameActive == 'p') {
    noLoop();                                // Game paused
  }
  
  else if (html_gameActive =='a') {          // Game active
    if (tg_p1Disabled == false) {
      tg_p1KeyInput();
    }
    if (tg_p2Disabled == false) {
      tg_p2KeyInput();
    }

    if (tg_p1.collides(tg_p2ArmyBase)) {
      tg_p2Sprite.remove();
      tg_gameOver(tg_fb_score.gameName);
    }
    if (tg_p2.collides(tg_p1ArmyBase)) {
      tg_p1Sprite.remove();
      tg_gameOver('Player 2');
    }
  }
  /*
  if (kb.pressing('e')) {
    if (html_gameActive =='a') {
      tg_p1Fire();
    }
  }
  */
  
  allSprites.debug = mouse.pressing();
  allSprites.draw();
  
  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++*/
  // TEXT
  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++*/
  // Display Player 1 game score
  fill(tg_textColour);
  textAlign(LEFT);
  text(tg_fb_score.gameName + ' hits: ' + tg_p1Hits, 20, 20);

  // Display Player 1 high score values
  textSize(TG_TEXTSIZE - 4);
    
  text(tg_fb_score.gameName + "'s",   tg_xTxt,     tg_yTxt-tg_incr);
  text('HIGH SCORE ',                 tg_xTxt,     tg_yTxt);
  text('ratio:               lives:', tg_xTxt,     tg_yTxt+tg_incr);
  text('wins:               rounds:', tg_xTxt,     tg_yTxt+2*+tg_incr);
  text('losses:             time:',   tg_xTxt,     tg_yTxt+3*+tg_incr);
  textAlign(RIGHT);
  text(tg_fb_score.ratio,             tg_xTxt+60,  tg_yTxt+tg_incr);
  text(tg_fb_score.wins,              tg_xTxt+60,  tg_yTxt+2*+tg_incr);
  text(tg_fb_score.losses,            tg_xTxt+60,  tg_yTxt+3*+tg_incr);
  text(tg_fb_score.lives,             tg_xTxt+150, tg_yTxt+tg_incr);
  text(tg_fb_score.rounds,            tg_xTxt+150, tg_yTxt+2*+tg_incr);
  text(tg_fb_score.time,              tg_xTxt+150, tg_yTxt+3*+tg_incr);

  // Display game time
  textSize(TG_TEXTSIZE);
  textAlign(CENTER);
  text('Time: ' + tg_seconds, width / 2, 20);

  // Display Player 2 game score
  textAlign(RIGHT);
  text('Player 2 hits: ' + tg_p2Hits, width - 20, 20);

  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++*/
  // GREY TANK (WASD)
  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++*/
  function tg_p1KeyInput() {
    //console.log('%c tg_p1KeyInput(): ', 
    //            'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');
    
    // Detect forward & reverse
    if (kb.pressing('w')) {
      tg_p1Speed = TG_SPEED;
    }
    else if ((kb.pressing("s"))) {
      tg_p1Speed = -TG_SPEED;
    }
    // No key input so reset tank TG_SPEED to 0
    else {
      tg_p1Speed = 0;
    }

    // Detect turning
    if (kb.pressing("a")) {
      tg_p1.rotation = tg_p1.rotation - tg_p1Rotation;
    }

    if (kb.pressing("d")) {
      tg_p1.rotation = tg_p1.rotation + tg_p1Rotation;
    }
    
    // Move sprite in direction of the sprite is pointing at
    tg_p1.rotationSpeed = 0;
    tg_p1.direction = tg_p1.rotation;
    tg_p1.speed = tg_p1Speed;

    /*+++++++++++++++++++++++++++++++++++++++++++++++++++*/
    // Detect firing of rounds
    /*+++++++++++++++++++++++++++++++++++++++++++++++++++*/
    if (kb.pressing('e')) {
      tg_p1Fire();
    }
  }
  
  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++*/
  // GREEN TANK (IJKL)
  /*+++++++++++++++++++++++++++++++++++++++++++++++++++++*/
  function tg_p2KeyInput() {
    //console.log('%c tg_p2KeyInput(): ', 
    //            'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');
  
    // Detect forward & reverse
    if (kb.pressing("i")) {
      tg_p2speed = TG_SPEED;
    }
    else if (kb.pressing("k")) {
      tg_p2speed = -TG_SPEED;
    }
    // No key input so reset tank speed to 0
    else {
      tg_p2speed = 0;
    }

    // Detect turning
    if (kb.pressing("j")) {
      tg_p2.rotation = tg_p2.rotation - tg_p2Rotation;
    }

    if (kb.pressing("l")) {
      tg_p2.rotation = tg_p2.rotation + tg_p2Rotation;
    }

    // Move sprite in direction of the sprite is pointing at
    tg_p2.rotationSpeed = 0;
    tg_p2.direction = tg_p2.rotation;
    tg_p2.speed = tg_p2speed;

    /*+++++++++++++++++++++++++++++++++++++++++++++++++++*/
    // Detect firing of rounds
    /*+++++++++++++++++++++++++++++++++++++++++++++++++++*/
    if (kb.pressing("o")) {
      tg_p2Fire();
    }
  }
}

/**************************************************************/
// tg_createWalls()
// Called by tg_reset() when game is starting
// Create wall sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function tg_createWalls() {
  console.log('%c tg_createWalls():  width= ' + width +
              '  height= ' + height,
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_wallLH  = new Sprite(0, height / 2, 8, height, 'kc');
  tg_wallRH  = new Sprite(width, height / 2, 8, height, 'k');
  tg_wallTop = new Sprite(width / 2, 0, width, 8, 'k');
  tg_wallBot = new Sprite(width / 2, height, width, 8, 'k');

  // Create wall group
  tg_wallGroup = new Group();
  tg_wallGroup.add(tg_wallLH);
  tg_wallGroup.add(tg_wallRH);
  tg_wallGroup.add(tg_wallTop);
  tg_wallGroup.add(tg_wallBot);
}

/**************************************************************/
// tg_createTankSprites()
// Called by tg_reset() when game is starting
// Create Player 1 & 2 tank sprites
// Input:  n/a
// Return: n/a
/**************************************************************/
function tg_createTankSprites() {
  console.log('%c tg_createTankSprites(): ', 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  // Create Player 1 tank sprite
  tg_p1 = new Sprite(130, height-120, 45, 20);
  tg_p1.rotation= -90;
  tg_p1.image = (tg_p1Img);
  

  // Create Player 2 tank sprite
  tg_p2 = new Sprite(width-130, 150, 45,20);
  tg_p2.rotation= 90;
  tg_p2.image = (tg_p2Img);

  // Create tank group
  tg_tankGroup = new Group();
  tg_tankGroup.add(tg_p1);
  tg_tankGroup.add(tg_p2);

  // Create round group & set up collides
  tg_p1roundGroup = new Group();
  tg_p2roundGroup = new Group();
  tg_wallGroup.collides(tg_p1roundGroup, tg_p1RoundDestroyed);
  tg_wallGroup.collides(tg_p2roundGroup, tg_p2RoundDestroyed);

  tg_p1.collides(tg_p2roundGroup, tg_p1destroyed);
  tg_p2.collides(tg_p1roundGroup, tg_p2destroyed);
}

/**************************************************************/
// tg_buildMaze()
// Called by tg_reset() when game is starting
// Input:  n/a
// Return: n/a
/**************************************************************/
function tg_buildMaze() {
  console.log('%c tg_buildMaze(): ', 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');
  
  // define position variables & groups  
  tg_mazeGroup = new Group();

  // Left & right hand horizontals
  tg_sprite = new Sprite(width/4 + 10, 90, (width/2) - 70, 5, 'kinematic');
  tg_mazeGroup.add(tg_sprite);
  tg_sprite = new Sprite(3*(width/4) - 10, 90, (width/2) - 70, 5, 'kinematic');
  tg_mazeGroup.add(tg_sprite);
  
  tg_sprite = new Sprite(width/4 + 10, height-50, (width/2) - 70, 5, 'kinematic');
  tg_mazeGroup.add(tg_sprite);
  tg_sprite = new Sprite(3*(width/4) - 10, height-50, (width/2) - 70, 5, 'kinematic');
  tg_mazeGroup.add(tg_sprite);

  // Left, centre & right hand verticals
  tg_sprite = new Sprite(50, height/2, 5, (height/2) - 70, 'kinematic');
  tg_mazeGroup.add(tg_sprite);
  tg_sprite = new Sprite(width/2, height/2, 5, (height/2) - 70, 'kinematic');
  tg_mazeGroup.add(tg_sprite);
  tg_sprite = new Sprite(width-50, height/2+20, 5, (height/2) - 70, 'kinematic');
  tg_mazeGroup.add(tg_sprite);

  tg_mazeGroup.color = color('black');
  
  // Center circles
  tg_castleWallImg.resize(300, 300);
  tg_circleLH = new Sprite(width/4, height/2, 280, 'k');
  tg_circleLH.rotationSpeed = 0.5;
  tg_circleLH.image = (tg_castleWallImg);
  tg_mazeGroup.add(tg_circleLH);
  tg_circleRH = new Sprite(3*(width/4), height/2, 280, 'k');
  tg_circleRH.rotationSpeed = -0.5;
  tg_circleRH.image = (tg_castleWallImg);
  tg_mazeGroup.add(tg_circleRH);

  // Left hand centre corcle also used to display High Score text
  tg_xTxt = tg_circleLH.x - 75;
  tg_yTxt = tg_circleLH.y - 20;

  // Player 1 army base horizontal & vertical protection
  tg_sprite = new Sprite(50, height-160, 100, 5, 'kinematic');
  tg_mazeGroup.add(tg_sprite);
  tg_sprite = new Sprite(150, height-100, 5, 100, 'kinematic');
  tg_mazeGroup.add(tg_sprite);

  // Player 2 army base horizontal & vertical protection
  tg_sprite = new Sprite(width-50, 180, 100, 5, 'kinematic');
  tg_mazeGroup.add(tg_sprite);
  tg_sprite = new Sprite(width-150, 140, 5, 100, 'kinematic');
  tg_mazeGroup.add(tg_sprite);

  // Player 1 army base
  tg_p1ArmyBase = new Sprite(80, height-84, 60, 60, 'kinematic');
  tg_p1Sprite   = new Sprite(80, height-80, 60, 60, 'kinematic');
  tg_p1Sprite.image = (tg_armyBaseImg);
  tg_p1Sprite.rotation = -43;

  // Player 2 army base
  tg_p2ArmyBase = new Sprite(width-80, 120, 55, 55, 'kinematic');
  tg_p2Sprite   = new Sprite(width-80, 120, 60, 60, 'kinematic');
  tg_p2Sprite.image = (tg_armyBaseImg);
  tg_p2Sprite.rotation = -43;
  
  //tg_p1.collides(tg_p2ArmyBase, tg_gameOver(tg_fb_score.gameName));
  //tg_p2.collides(tg_p1ArmyBase, tg_gameOver('Player 2'));
}

/*******************************************************/
// tg_p1RoundIcons(_num, _xPos, _yPos)
// Called by tg_reset() when game starting & on firing a round
// Create tank shell icons representing available tank rounds
// Input:  num tank shell icons & their X/Y pos
// Return: n/a
/*******************************************************/
function tg_p1RoundIcons(_num, _xPos, _yPos) { 
  console.log('%c tg_p1RoundIcons(): num= ' + _num, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p1iconRoundGroup = new Group();

  for (i = 0; i < _num; i++) {
    tg_IconRound = new Sprite(_xPos + (i * 5), _yPos, 4, 20, 'static');
    tg_IconRound.image = (tg_tankRoundImg);
    tg_p1iconRoundGroup.add(tg_IconRound);
  }
}

/*******************************************************/
// tg_p2RoundIcons(_num, _xPos, _yPos)
// Called by tg_reset() when game starting & on firing a round
// Create tank shell icons representing available tank rounds
// Input:  num tank shell icons & their X/Y pos
// Return: n/a
/*******************************************************/
function tg_p2RoundIcons(_num, _xPos, _yPos) {
  console.log('%c tg_p2RoundIcons(): num= ' + _num, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p2iconRoundGroup = new Group();

  for (i = 0; i < _num; i++) {
    tg_IconRound = new Sprite(_xPos + (i * 5), _yPos, 4, 20, 'static');
    tg_IconRound.image = (tg_tankRoundImg);
    tg_p2iconRoundGroup.add(tg_IconRound);
  }
}

/*******************************************************/
// tg_p1LifeIcons(_num, _xPos, _yPos)
// Called by tg_reset() when game starting & on firing a round
// Create life icons representing lives
// Input:  num lives icons & their X/Y pos
// Return: n/a
/*******************************************************/
function tg_p1LifeIcons(_num, _xPos, _yPos) {
  console.log('%c tg_p1LifeIcons(): num= ' + _num, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p1IconLifeGroup = new Group();

  for (i = 0; i < _num; i++) {
    tg_IconLife = new Sprite(_xPos + (i * 12), _yPos, 10, 10, 'static');
    tg_IconLife.image = (tg_lifeImg);
    tg_p1IconLifeGroup.add(tg_IconLife);
  }
}

/*******************************************************/
// tg_p2LifeIcons(_num, _xPos, _yPos)
// Called by tg_reset() when game starting & on firing a round
// Create life icons representing lives
// Input:  num lives icons & their X/Y pos
// Return: n/a
/*******************************************************/
function tg_p2LifeIcons(_num, _xPos, _yPos) {
  console.log('%c tg_p2LifeIcons(): num= ' + _num, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p2IconLifeGroup = new Group();

  for (i = 0; i < _num; i++) {
    tg_IconLife = new Sprite(_xPos + (i * 12), _yPos, 10, 10, 'static');
    tg_IconLife.image = (tg_lifeImg);
    tg_p2IconLifeGroup.add(tg_IconLife);
  }
}

/*******************************************************/
// tg_p1RoundDestroyed()
// Called by collide event
// Player 1 tank round hits tg_wall so destroy round
// Input:  n/a
// Return: n/a
/*******************************************************/
function tg_p1RoundDestroyed(tg_wallGroup, tg_p1roundGroup) {
  console.log('%c tg_p1RoundDestroyed(): ',
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p1roundGroup.remove();
}

/*******************************************************/
// tg_p2RoundDestroyed()
// Called by collide event
// Player 2 tank round hits tg_wall so destroy round
// Input:  n/a
// Return: n/a
/*******************************************************/
function tg_p2RoundDestroyed(tg_wallGroup, tg_p2roundGroup) {
  console.log('%c tg_p2RoundDestroyed(): ',
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p2roundGroup.remove();
}

/*******************************************************/
// tg_p1destroyed()
// Called by collide event
// Round hits Player 1 tank.
// So add 1 to Player 2 hits & take away a Player 1 life.
// If no lives remaining, tank is disabled
// Input:  n/a
// Return: n/a
/*******************************************************/
function tg_p1destroyed(tg_p1, tg_roundGroup) {
  console.log('%c tg_p1destroyed(): ',
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p2Hits++;
  tg_p1Lives--;
  
  tg_roundGroup.remove();
  tg_p1IconLifeGroup.remove();
  tg_p1LifeIcons(tg_p1Lives, 25, 65);
  
  if (tg_p1Lives <= 0) {
    tg_p1Rounds = 0;
    tg_p1Disabled = true;
  }
  else {
    tg_p1.x = random(50, width - 50);
    tg_p1.y = random(50, height - 50);
  }
}

/*******************************************************/
// tg_p2destroyed(tg_p2, tg_roundGroup)
// Called by collide event
// Round hits Player 2 tank.
// So add 1 to Player 1 hits & take away a Player 2 life.
// If no lives remaining, tank is disabled
// Input:  n/a
// Return: n/a
/*******************************************************/
function tg_p2destroyed(tg_p2, tg_roundGroup) {
  console.log('%c tg_p2destroyed(): ',
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p1Hits++;
  tg_p2Lives--;
  
  tg_roundGroup.remove();
  tg_p2IconLifeGroup.remove();
  tg_p2LifeIcons(tg_p2Lives, (width - 20 - (tg_p2Lives*12)), 65);
  
  if (tg_p2Lives <= 0) {
    tg_p2Rounds = 0;
    tg_p2Disabled = true;
  }
  else {
    tg_p2.x = random(50, width - 50);
    tg_p2.y = random(50, height - 50);
  }
}

/********************************************************/
// tg_p1Fire()
// Called by draw()
// If rounds remain you can only fire a round once per second
// Input:  n/a
// Return: n/a
/********************************************************/
function tg_p1Fire() {
  console.log('%c tg_p1Fire(): g_p1CanFire= ' + tg_p1CanFire, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  if (tg_p1Rounds > 0) {
    if (tg_p1CanFire == true) {
      tg_tankRoundSound.play();
      tg_p1CanFire = false;
      tg_p1Rounds--;
      tg_p1iconRoundGroup.remove();
      tg_p1RoundIcons(tg_p1Rounds, 22, 40);

      tg_p1RoundTime  = TG_TANKROUNDINTERVAL;
      tg_p1RoundTimer = setInterval(tg_p1RoundTimerFunc, 1000);
      tg_p1round = new Sprite(tg_p1.x + (tg_p1.w / 2 + 0), tg_p1.y, 5);
      tg_p1round.friction = 0;
      tg_p1roundGroup.add(tg_p1round);
      tg_p1round.rotation  = tg_p1.rotation;
      tg_p1round.direction = tg_p1round.rotation;
      tg_positionRound(tg_p1, tg_p1round);
      tg_p1round.speed = TG_TANKROUNDSPEED;
    }
  }
}

/********************************************************/
// tg_p2Fire()
// Called by draw()
// If rounds remain you can only fire a round once per second
// Input:  n/a
// Return: n/a
/********************************************************/
function tg_p2Fire() {
  console.log('%c tg_p2Fire(): g_p2CanFire= ' + tg_p2CanFire, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  if (tg_p2Rounds > 0) {
    if (tg_p2CanFire == true) {
      tg_tankRoundSound.play();
      tg_p2CanFire = false;
      tg_p2Rounds--;
      tg_p2iconRoundGroup.remove();
      tg_p2RoundIcons(tg_p2Rounds, (width - 20 - (tg_p2Rounds*5)), 40);

      tg_p2RoundTime  = TG_TANKROUNDINTERVAL;
      tg_p2RoundTimer = setInterval(tg_p2RoundTimerFunc, 1000);
      tg_p2round = new Sprite(tg_p2.x + (tg_p2.w / 2 + 0), tg_p2.y, 5);
      tg_p2round.friction = 0;
      tg_p2roundGroup.add(tg_p2round);
      tg_p2round.rotation  = tg_p2.rotation;
      tg_p2round.direction = tg_p2round.rotation;
      tg_positionRound(tg_p2, tg_p2round);
      tg_p2round.speed = TG_TANKROUNDSPEED;
    }
  }
}

/********************************************************/
// tg_p1RoundTimerFunc()
// timer event, called every second
// Player 1 tank can only fire a round once per second
// Input:  n/a
// Return: n/a
/********************************************************/
function tg_p1RoundTimerFunc() { 
  console.log('%c tg_p1RoundTimerFunc(): tg_p1RoundTime= ' + tg_p1RoundTime, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p1RoundTime--;
  // if secs are up, clear round 1 timer & set to fire again
  if (tg_p1RoundTime <= 0) {
    clearInterval(tg_p1RoundTimer);
    tg_p1CanFire = true;
  }
}

/********************************************************/
// tg_p2RoundTimerFunc()
// timer event, called every second
// Player 2 tank can only fire a round once per second
// Input:  n/a
// Return: n/a
/********************************************************/
function tg_p2RoundTimerFunc() {
  console.log('%c tg_p2RoundTimerFunc(): tg_p2RoundTime= ' + tg_p2RoundTime, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  tg_p2RoundTime--;
  // if secs are up, clear round 1 timer & set to fire again
  if (tg_p2RoundTime <= 0) {
    clearInterval(tg_p2RoundTimer);
    tg_p2CanFire = true;
  }
}

/********************************************************/
// tg_positionRound(_base, _round)
// Called by a fireRound 
// Calculate rotated position of barrel
// Input:  sprite projectile i fired from, projectile sprite
// Return: n/a
/********************************************************/
function tg_positionRound(_base, _round) {
  console.log('%c tg_positionRound(): ',
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  deg = _base.rotation;
  rads = deg * Math.PI / 180;  // Convert degrees to radians

  h = _base.w / 2;
  offsetX  = h * Math.cos(rads);
  offsetY  = h * Math.sin(rads);
  _round.x = _base.x + offsetX;
  _round.y = _base.y + offsetY;
}

/*******************************************************/
// tg_timerFunc() 
// Timer event called by tg_startTimer()
// Input:  
// Return:
/*******************************************************/
function tg_timerFunc() {
  if (html_gameActive =='a') {
    tg_seconds++;
  }
}

/**************************************************************/
// tg_startPause()
// Called by game page START/PAUSE button
// Enable RESET button
// If game; Currently active, pause it.
//          Currently paused, re-start it.
//          Not yet started, call tg_reset() to start game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function tg_startPause() {
  console.log('%c tg_positionRound(): html_gameActive= ' + html_gameActive,
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  b_reset.classList.remove("w3-disabled");
  tg_resetActive = false;
    
  if (html_gameActive == 'a') {
    // Game currently ACTIVE so PAUSE IT
    tg_warSound.stop();
    //noLoop();
    html_gameActive = 'p';
    clearInterval(tg_timer);

    b_startPause.style.backgroundColor = "lightgreen";
    b_startPause.textContent = "RE-START";
  }
    
  else if (html_gameActive == 'p') {
    // Game currently PAUSED so make it ACTIVE
    tg_warSound.play();
    tg_warSound.loop();
    tg_timer = setInterval(tg_timerFunc, 1000);
    html_gameActive = 'a';
    loop();

    b_startPause.style.backgroundColor = "grey";
    b_startPause.textContent = "PAUSE";
  }
    
  else {
    // Game has not started yet, so create one
    tg_reset();

    b_startPause.style.backgroundColor = "grey";
    b_startPause.textContent = "PAUSE";

    // Start the timer, set game flags & set draw to loop
    tg_timer = setInterval(tg_timerFunc, 1000);
    html_gameActive = 'a';
    loop();
  }
}

/**************************************************************/
// tg_reset()
// Called by tank game page RESET button, setUP() & tg_startPause()
// If RESET button disabled exit.
// If game has been running cancel it, create & start new game &
//  disable RESET button.
// If game not yet started, create a new game.
// Input:  n/a
// Return: n/a
/**************************************************************/
function tg_reset() { 
  console.log('%c tg_reset(): tg_resetActive= ' + tg_resetActive,
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  if (tg_resetActive) {
    return;
  }
  
  if (html_gameActive == 'a' || html_gameActive == 'p' || html_gameActive == 'e') {
    // Game has been running so cancel it & disable RESET button.
    b_reset.classList.add("w3-disabled");
    tg_resetActive = true;
    //noLoop();
    clearInterval(tg_timer);
    tg_warSound.stop();

    // Delete any previous wall, tank, rounds, maze & icon sprites
    tg_wallGroup.remove();
    tg_tankGroup.remove();
    tg_mazeGroup.remove();
    tg_p1roundGroup.remove();
    tg_p2roundGroup.remove();
    tg_p1iconRoundGroup.remove();
    tg_p2iconRoundGroup.remove();
    tg_p1IconLifeGroup.remove();
    tg_p2IconLifeGroup.remove();
  }
  
  // Reset counters, etc
  tg_seconds    = 0;
  html_gameActive     = 'p';
    
  tg_p1Hits     = 0;
  tg_p1Rounds   = TG_ROUNDS
  tg_p1Lives    = TG_LIVES;
  tg_p1CanFire  = true;
  tg_p1Disabled = false;
  
  tg_p2Hits     = 0;
  tg_p2Rounds   = TG_ROUNDS
  tg_p2Lives    = TG_LIVES
  tg_p2CanFire  = true;
  tg_p1Disabled = false;

  // Create wall, tank & maze sprites
  tg_createWalls();
  tg_createTankSprites();
  tg_buildMaze();
  
  tg_p1RoundIcons(tg_p1Rounds, 22, 40);
  tg_p2RoundIcons(tg_p2Rounds, (width - 20 - (tg_p2Rounds*5)), 40);
  tg_p1LifeIcons(tg_p1Lives, 25, 65);
  tg_p2LifeIcons(tg_p2Lives, (width - 20 - (tg_p2Lives*12)), 65);
  
  var b_startPauseElmt = document.getElementById("b_startPause");
  b_startPauseElmt.style.backgroundColor = 'green';
  b_startPauseElmt.textContent = 'START';
  b_startPauseElmt.classList.remove("w3-disabled");
  tg_background = TG_BGCOLOUR;
  tg_textColour = TG_NORMALCOLOUR;
}

/**************************************************************/
// tg_gameOver(_winner)
// Called by draw()
// Game is over, so deactivate game, set start button to END and
//  freeze screen (noLoop)
// Input:  n/a
// Return: n/a
/**************************************************************/
function tg_gameOver(_winner) {
  console.log('%c tg_gameOver(): winner= ' + _winner + 
              ', p1 hits/p2 hits= ' + tg_p1Hits + '/' + tg_p2Hits, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  clearInterval(tg_timer);
  clearInterval(tg_p1RoundTimer);
  clearInterval(tg_p2RoundTimer);
  tg_background = tg_gameOverImg;
  tg_warSound.stop();
  tg_gameOverSound.play();

  var b_startPauseElmt = document.getElementById("b_startPause");
  b_startPauseElmt.style.backgroundColor = 'red';
  b_startPauseElmt.style.color = 'white';
  b_startPauseElmt.textContent = _winner + ' WON';
  b_startPauseElmt.classList.add("w3-disabled");

  tg_textColour = TG_ENDCOLOUR;
  tg_xTxt = 100;
  tg_yTxt = 100;

  html_gameActive = 'e';

  // Delete any previous wall, tank, rounds, maze & army base sprites
  tg_wallGroup.remove();
  tg_tankGroup.remove();
  tg_p1roundGroup.remove();
  tg_p2roundGroup.remove();
  tg_mazeGroup.remove();
  tg_p1ArmyBase.remove();
  tg_p2ArmyBase.remove();

  // Check if Player 1 won
  if (_winner !='Player 2') {
    tg_fb_score.wins++;   
    // Calc new ratio
    tg_fb_score.ratio = Math.round(tg_fb_score.wins / 
                        (tg_fb_score.wins + tg_fb_score.losses) * 1000) / 10;
    lg_console('tg_gameOver', 'wins = ' + tg_fb_score.wins + ', losses = ' + 
               tg_fb_score.losses + ', ratio = ' + tg_fb_score.ratio + '\n',
               COL_INFO); 
    
    // If new user time record update fb array & Session Storage
    if (tg_seconds < tg_fb_score.time) {
      tg_fb_score.hits   = tg_p1Hits;
      tg_fb_score.lives  = tg_p1Lives;
      tg_fb_score.rounds = tg_p1Rounds;
      tg_fb_score.time   = tg_seconds;
    }
  }
  // Player 1 lost
  else {
    tg_fb_score.losses++;
  }
  // Update session storage & write updated tank score object to fb
  sessionStorage.setItem('tg_score', JSON.stringify(tg_fb_score));
  fb_writeRec(TG, fbD_userDetails.uid, tg_fb_score, null);
}

/**************************************************************/
// tg_instructions(_opt)
// Called by game page INSTRUCTIONS button
// Disable game buttons & display game instructions
// Input:  opt = 'd' to display instructions & 'r' return
// Return: n/a
/**************************************************************/
function tg_instructions(_opt) {
  console.log('%c tg_instructions(): opt= ' + _opt, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  if (_opt == 'd') {
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(tg_timer);
    tg_warSound.stop();
     
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
// tg_leaderboard(_opt)
// Called by game page LEADERBOARD button 
// Read the top TG score records & display in table
// Input:  opt = 'd' to display leaderboard & 'r' return
// Return: n/a
/**************************************************************/
function tg_leaderboard(_opt) {
  console.log('%c tg_leaderboard(): opt= ' + _opt +
              ' html_gameActive= ' + html_gameActive, 
              'color: ' + TG_COL_C + '; background-color: ' + TG_COL_B + ';');

  if (_opt == 'd') {
    b_leaderboard.classList.add("w3-disabled");
    b_inst.classList.add("w3-disabled");
    b_startPause.classList.add("w3-disabled");
    b_reset.classList.add("w3-disabled");
    
    noLoop();     
    clearInterval(tg_timer);
    tg_warSound.stop();
  
    if (html_gameActive != false) {
      b_startPause.style.backgroundColor = "lightgreen";
      b_startPause.textContent = "RE-START";
      html_gameActive = 'p';
    }
   
    html_swapPage(null, "s_leaderbPage");
    html_posElement("s_leaderbPage", "defaultCanvas0");
    html_swapPage("defaultCanvas0", null);
  
    tg_scoreArray = [];
    fb_readSortedLimit(TG, fbR_procLeaderboard, tg_scoreArray, 
                      'wins', HTML_NUMLBOARD);
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
// tg_leaderBoard()
// Called by tank game page LEADERBOARD button 
// Read the top TG score records & display in table
// Input:  n/a
// Return: n/a
/**************************************************************/
function xtg_leaderboard() {
  console.log('%c tg_leaderboard(): ', 
              'color: ' + COLTG_C + '; background-color: ' + COLTG_B + ';');

  fbD_userDetails = JSON.parse(sessionStorage.getItem('googleLoginData'));
  //img_photoURL.src = fbD_userDetails.photoURL;
  tg_scoreArray = [];
  fb_readSortedLimit(TG, fbR_procLeaderboard, tg_scoreArray, 
                    'wins', HTML_NUMLBOARD);
}

/**************************************************************/
// windowResized()
// Input event; called when user resizes window
// Resize canvas to match
// Input:  n/a
// Return: n/a
/**************************************************************/
/*
function windowResized() {
  resizeCanvas(windowWidth - TG_SIDEBORDER, windowHeight - TG_TOPBORDER);

  if (html_gameActive == 'a' || html_gameActive == 'p') {
    tg_wallLH = (tg_origWidth - width)/2;
    tg_wallRH = width;
    //tg_wallGroup.remove();
    //tg_createWalls(newWidth,height);
  }
}
*/
/*******************************************************/
//  END OF APP
/*******************************************************/