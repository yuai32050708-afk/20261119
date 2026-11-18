// 設定畫布的背景顏色為粉色。
const BACKGROUND_COLOR = "#ffcad4";
// 設定角色顯示大小相對於原圖的放大倍率。
const SPRITE_SCALE = 2.5;
// 設定動畫每隔多少毫秒切換一格。
const FRAME_INTERVAL = 120;
// 設定待機動畫要循環播放的格數。
const IDLE_FRAME_COUNT = 8;
// 設定走路動畫要循環播放的格數。
const WALK_FRAME_COUNT = 4;
// 設定射擊精靈圖包含的格數。
const SHOOT_FRAME_COUNT = 6;

// 宣告待機動畫精靈圖變數。
let idleSheet;
// 宣告走路動畫精靈圖變數。
let walkSheet;
// 宣告射擊動畫精靈圖變數。
let shootSheet;
// 記錄角色在畫布上的水平位置。
let characterX;
// 記錄角色面向的方向，1 代表右方，-1 代表左方。
let facingDirection = 1;
// 記錄目前動畫類型。
let animationMode = "idle";
// 記錄目前動畫播放到哪一格。
let frameIndex = 0;
// 累積經過的動畫時間。
let frameTimer = 0;
// 記錄射擊動畫是否正在播放。
let isShooting = false;
// 設定角色每秒移動的像素數。
const MOVE_SPEED = 220;

// 在建立畫布前載入所有角色精靈圖。
function preload() {
  // 載入待機動畫精靈圖。
  idleSheet = loadImage("1119/小笨笨/小笨笨.png");
  // 載入走路動畫精靈圖。
  walkSheet = loadImage("1119/走路/走路.png");
  // 載入射擊動畫精靈圖。
  shootSheet = loadImage("1119/射擊/射擊.png");
}

// 建立畫布並初始化角色位置。
function setup() {
  // 建立符合瀏覽器視窗大小的畫布。
  createCanvas(windowWidth, windowHeight);
  // 將角色的起始位置設為畫布水平中央。
  characterX = width / 2;
  // 將畫布的繪圖模式設定為以座標作為圖像中心。
  imageMode(CENTER);
  // 設定每秒繪製的畫面數，讓動畫播放平順。
  frameRate(60);
}

// 每一個畫格更新角色狀態並繪製畫面。
function draw() {
  // 將背景填滿指定的粉色。
  background(BACKGROUND_COLOR);
  // 限制單次更新時間，避免切換分頁後角色突然移動過遠。
  const elapsedTime = min(deltaTime, 50);
  // 根據方向鍵更新角色位置、走路動畫與面向方向。
  updateCharacter(elapsedTime);
  // 更新動畫播放進度。
  updateAnimation(elapsedTime);
  // 繪製目前動畫中的角色。
  drawCharacter();
}

// 根據方向鍵更新角色位置、走路動畫與面向方向。
function updateCharacter(elapsedTime) {
  // 射擊動畫播放期間不移動角色。
  if (isShooting) {
    // 射擊時保留目前的動畫狀態。
    return;
  }

  // 按下左方向鍵時讓角色向左移動並面向左方。
  if (keyIsDown(LEFT_ARROW)) {
    // 將角色面向左方。
    facingDirection = -1;
    // 播放走路動畫。
    setAnimationMode("walk");
    // 根據經過時間讓角色向左移動。
    characterX -= MOVE_SPEED * elapsedTime / 1000;
  // 沒有按左鍵但按下右方向鍵時讓角色向右移動。
  } else if (keyIsDown(RIGHT_ARROW)) {
    // 將角色面向右方。
    facingDirection = 1;
    // 播放走路動畫。
    setAnimationMode("walk");
    // 根據經過時間讓角色向右移動。
    characterX += MOVE_SPEED * elapsedTime / 1000;
  // 沒有按方向鍵時播放待機動畫。
  } else {
    // 切換回待機動畫。
    setAnimationMode("idle");
  }

  // 取得目前動畫單格精靈圖的寬度。
  const frameWidth = getCurrentSheet().width / getCurrentFrameCount();
  // 限制角色不會移出畫布左側。
  characterX = max(frameWidth * SPRITE_SCALE / 2, characterX);
  // 限制角色不會移出畫布右側。
  characterX = min(width - frameWidth * SPRITE_SCALE / 2, characterX);
}

// 切換動畫類型，並在切換時從第一格開始播放。
function setAnimationMode(nextMode) {
  // 只有動畫類型改變時才重設播放進度。
  if (animationMode !== nextMode) {
    // 更新目前動畫類型。
    animationMode = nextMode;
    // 將動畫格數重設為第一格。
    frameIndex = 0;
    // 清除已累積的動畫時間。
    frameTimer = 0;
  }
}

// 依照目前動畫類型更新動畫格數。
function updateAnimation(elapsedTime) {
  // 累加這一畫格經過的時間。
  frameTimer += elapsedTime;

  // 時間足夠時切換到下一格動畫。
  while (frameTimer >= FRAME_INTERVAL) {
    // 扣除一格動畫所需的時間。
    frameTimer -= FRAME_INTERVAL;

    // 射擊動畫只播放一次，結束後回到待機狀態。
    if (animationMode === "shoot") {
      // 最後兩格同時顯示，因此射擊動畫共有五個播放階段。
      if (frameIndex >= SHOOT_FRAME_COUNT - 2) {
        // 標記射擊動畫已結束。
        isShooting = false;
        // 切換回待機動畫。
        setAnimationMode("idle");
        // 重設動畫格數，從待機動畫第一格開始。
        frameIndex = 0;
        // 清除射擊動畫累積的時間。
        frameTimer = 0;
        // 結束本次更新，避免多前進一格。
        return;
      }
      // 前進到下一個射擊動畫階段。
      frameIndex += 1;
    // 走路動畫在指定格數內循環播放。
    } else if (animationMode === "walk") {
      // 前進到下一格走路動畫並循環播放。
      frameIndex = (frameIndex + 1) % WALK_FRAME_COUNT;
    // 待機動畫只循環播放指定的八格。
    } else {
      // 前進到下一格待機動畫並循環播放。
      frameIndex = (frameIndex + 1) % IDLE_FRAME_COUNT;
    }
  }
}

// 取得目前動畫精靈圖的格數。
function getCurrentFrameCount() {
  // 射擊動畫包含六格。
  if (animationMode === "shoot") {
    // 回傳射擊動畫格數。
    return SHOOT_FRAME_COUNT;
  }
  // 走路動畫包含四格。
  if (animationMode === "walk") {
    // 回傳走路動畫格數。
    return WALK_FRAME_COUNT;
  }
  // 待機動畫包含八格。
  return IDLE_FRAME_COUNT;
}

// 取得目前動畫使用的精靈圖。
function getCurrentSheet() {
  // 射擊時使用射擊精靈圖。
  if (animationMode === "shoot") {
    // 回傳射擊動畫精靈圖。
    return shootSheet;
  }
  // 走路時使用走路精靈圖。
  if (animationMode === "walk") {
    // 回傳走路動畫精靈圖。
    return walkSheet;
  }
  // 其他情況使用待機精靈圖。
  return idleSheet;
}

// 根據目前方向與動畫格數繪製角色。
function drawCharacter() {
  // 取得目前動畫使用的精靈圖。
  const currentSheet = getCurrentSheet();
  // 依目前動畫格數計算每格來源寬度。
  const sheetFrameCount = getCurrentFrameCount();
  // 計算目前動畫格在精靈圖中的來源水平座標。
  const sourceX = frameIndex * currentSheet.width / sheetFrameCount;
  // 計算目前動畫格的來源寬度。
  const sourceWidth = currentSheet.width / sheetFrameCount;
  // 儲存畫布目前的座標與縮放狀態。
  push();
  // 將角色繪製在目前位置與畫布垂直中央。
  translate(characterX, height / 2);
  // 根據面向方向翻轉角色。
  scale(facingDirection * SPRITE_SCALE, SPRITE_SCALE);
  // 繪製目前動畫格並保留 PNG 的透明背景。
  image(currentSheet, 0, 0, sourceWidth, currentSheet.height, sourceX, 0, sourceWidth, currentSheet.height);
  // 射擊最後階段同時繪製最後兩格，讓子彈與角色一同出現。
  if (animationMode === "shoot" && frameIndex === SHOOT_FRAME_COUNT - 2) {
    // 取得子彈效果所在的最後一格來源座標。
    const effectSourceX = (SHOOT_FRAME_COUNT - 1) * sourceWidth;
    // 將子彈效果稍微往角色面向的方向移動。
    const effectOffsetX = sourceWidth * 0.12;
    // 疊加繪製射擊精靈圖最後一格的子彈效果。
    image(currentSheet, effectOffsetX, 0, sourceWidth, currentSheet.height, effectSourceX, 0, sourceWidth, currentSheet.height);
  }
  // 還原畫布的座標與縮放狀態。
  pop();
}

// 按下空白鍵時開始播放一次射擊動畫。
function keyPressed() {
  // 只在空白鍵按下且射擊動畫尚未播放時觸發。
  if (key === " " && !isShooting) {
    // 標記射擊動畫開始播放。
    isShooting = true;
    // 切換到射擊動畫。
    animationMode = "shoot";
    // 從射擊動畫第一格開始播放。
    frameIndex = 0;
    // 清除之前累積的動畫時間。
    frameTimer = 0;
    // 阻止空白鍵觸發瀏覽器預設的捲動畫面行為。
    return false;
  }
}

// 視窗大小改變時同步調整全螢幕畫布。
function windowResized() {
  // 將畫布調整為最新的視窗大小。
  resizeCanvas(windowWidth, windowHeight);
  // 將角色位置限制在新畫布的水平範圍內。
  characterX = constrain(characterX, 0, width);
}
