let net = null;

const width = 600;    // We will scale the photo width to this
let height = 0;
const video = document.querySelector('#video');
const contentDiv = document.querySelector('.content');

video.addEventListener('canplay', function(){
    height = video.videoHeight / (video.videoWidth/width);
    canplay();
}, false);

function appendPoint(x, y, text) {
	const point = document.createElement('div');
	point.style.left = `${x}px`;
	point.style.top = `${y}px`;
	point.className = 'point';
	point.innerText = text;
	contentDiv.appendChild(point);
}

const points = [];

function transformXY(x, y){
	const [p1, p2] = points;
	const { width, height } = window.oCanvas.canvas;
	const sx = x - p1.x + 5;
	const sy = y - p1.y - 15;
	if(sx <= 0 || sy <= 0) return [0, 0]
	const w = p2.x - p1.x;
	const h = p2.y - p1.y;
	return [ sx*width/w, sy*height/h ];
}
async function getWrist(image) {
    const pose = await net.estimateSinglePose(image, {
        flipHorizontal: false
	});
	const parts = ['rightWrist']
	// const parts = ['nose']

	const [ right ] = pose.keypoints.filter(p => parts.includes(p.part));
	
	const { x, y } = right.position;
	const [ tx, ty ] = transformXY(x, y);
	window.oCanvas.updateMouse({
		clientX: tx,
		clientY: ty
	});
	// appendPoint(x, y, right.part);
}

function canplay(){
	function click(e) {
		const x = e.clientX;
		const y = e.clientY;
		if(points.length >= 2) return;
		const { x: vx, y: vy } = video.getBoundingClientRect();
		points.push({ x: x - vx, y: y - vy });
		if(points.length === 2) {
			video.removeEventListener('click', click);
			video.style.opacity = 0;
			const point = document.querySelector('.point');
			const div = document.querySelector('.back');
			point.parentElement.removeChild(point);
			div.parentElement.removeChild(div);
			startUp();
			return;
		}
		appendPoint(x, y, '');
	}
	video.addEventListener('click', click);
}

async function startUp() {
		fireInit();
		while (true) {
			await getWrist(video);
		}
}

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  video.width = width;
  video.height = width;

	const stream = await navigator.mediaDevices.getUserMedia({
		'audio': false,
		'video': {
			facingMode: 'user',
			width: width,
			height: width,
		},
	});
	video.srcObject = stream;
	return new Promise((resolve) => {
		video.onloadedmetadata = () => {
			resolve(video);
		};
	});
}

async function loadVideo() { // 加载并播放视频
  const video = await setupCamera();
	video.play();
  return video;
}

async function init(){
	console.log('启动')
	net = await posenet.load({
		architecture: 'MobileNetV1',
		outputStride: 16,
		inputResolution: 513,
		multiplier: 0.75
	});
	log('模型已经成功启动');
	// document.body.requestFullscreen();
	loadVideo();
}

init();
