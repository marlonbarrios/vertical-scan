//Soft-space #2:  Vertical scan
// Sound is influenced by the pixel colours at the current scan point
// concept and programming: Marlon Barrios Solano
// interactive audio programming: Cristian Vogel ( @neverenginelabs )

var video, sample;
let x = 0, y = 0;
let running = false;
let bufferPos
let playButton, playBG

function preload() {

  soundFormats('mp3');
  sample = loadSound('assets/mp3/3DPrinterSynthetic.mp3')
}

function setup() {
  getAudioContext().suspend();
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1)
  video = createCapture(VIDEO)
  video.size(windowWidth,windowHeight);


  background(51);
  playButton = createDiv().class('playButtonOuter')
  playBG = createDiv('').class('playButtonInner')
  playBG.parent(playButton)
  video.hide();
  bufferPos = ( n ) => min(1, abs(n)) * sample.duration() ;

}

function draw() {
  if (!running) {
    playButton.center();
    return
  } else {
    playButton.hide()
  }

  video.loadPixels();

  //image(video,0,0)
  let w = video.width;
  let h = video.height;

  copy(video, 0, y, w , 1,  0, y, w , 1,)

  y = ( y > h) ? 0 : y + 1
  newGrain()
}

function normAverageFromRGBat(i) {
  if ( i >= video.pixels.length - 3) return 0
  const res = norm((video.pixels[i] + video.pixels [i + 1] + video.pixels [i + 2]) / 3, 0, 255)
  return res
}

function newGrain( pos = y ){
  if (!running) return;
  const influence = pixelAt( video.width/2, pos );
  const grainDur = max(0.1, noise( pos * 0.1))
  const extent = (sample.duration() * 0.99) - grainDur
  const mapping = map( influence, 0 , 1 , 0, bufferPos( pos / video.height ) )
  const newPos = min(  extent, mapping )
  // console.log ( `grain dur: ${grainDur} max dur: ${extent} -> new pos: ${newPos}`)
  sample.jump( newPos, grainDur )
  sample.rate(max(0.1, influence))
}

/**
 * @param x
 * @param y
 * @returns {number} normalised average 0 to 1 range, derived from RGB value at x,y
 */
function pixelAt( x, y = video.height / 2 ){
  const index = 4 * ((y * video.width) + x);
  const pixelValue = normAverageFromRGBat(index)
  return pixelValue
}

let initSound = function () {
  userStartAudio();
  running = true;
  sample.play(0.25);
  sample.setVolume(0.7, 0.1)
};

function mousePressed(){
  if (getAudioContext().state !== 'running') {
    initSound();
    return;
  }
  saveFrames('vertical-slitscan', 'png', 1, 1);
}
