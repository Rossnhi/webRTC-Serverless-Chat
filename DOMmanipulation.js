let messageBox = document.getElementById('messageBox');
messageBox.addEventListener('change', displayMessage);

let sendButton = document.getElementById('sendButton');
sendButton.addEventListener('click', displayMessage);

let chatWindow = document.getElementById('chatWindow');


let channel = null;

function displayMessage(e) {
	let message = e.target.value;
	
	if(!message) {
		return;
	}

	let textNode = document.createTextNode(message);
	
	let pTagSelf = document.createElement('p');
	pTagSelf.className = 'self';
	pTagSelf.appendChild(textNode);
	
	let li = document.createElement('li');
	li.appendChild(pTagSelf);
	
	chatWindow.appendChild(li);
	
	messageBox.value = '';

	channel.send(message);
}

let hostRadio = document.getElementById('host');
let joinRadio = document.getElementById('join');
let offerBox = document.getElementById('offerBox');
let answerBox = document.getElementById('answerBox');

hostRadio.addEventListener('click', displayOfferBox);
joinRadio.addEventListener('click', displayAnswerBox);

function displayOfferBox() {
	offerBox.style.display = 'block';
	answerBox.style.display = 'none';
}

function displayAnswerBox() {
	answerBox.style.display = 'block';
	offerBox.style.display = 'none';
}

let generateCodeButton = document.getElementById('generateCode');
generateCodeButton.addEventListener('click', generateCode);

let copyCodeButton = document.getElementById('copyCode');
copyCodeButton.addEventListener('click', copyCode);

let connecButton = document.getElementById('connectButton');
connectButton.addEventListener('click', connect);

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }};
const peerConnection = new RTCPeerConnection(configuration);

peerConnection.onconnectionstatechange = function(event) {
	if (peerConnection.connectionState == 'connected') {
    	let connStatus = document.getElementById('connStatus');
    	connStatus.style.color = '#4c8';
	}
}

peerConnection.ondatachannel = function(event) {
	channel = event.channel;
	channel.onmessage = function(event) {
		let message = event.data;

		let textNode = document.createTextNode(message);
	
		let pTagSelf = document.createElement('p');
		pTagSelf.className = 'other';
		pTagSelf.appendChild(textNode);
		
		let li = document.createElement('li');
		li.appendChild(pTagSelf);
		
		chatWindow.appendChild(li);
	};
};


async function generateCode() {
	channel = peerConnection.createDataChannel('messageChannel');
	channel.onmessage = function(event) {
		let message = event.data;

		let textNode = document.createTextNode(message);
	
		let pTagSelf = document.createElement('p');
		pTagSelf.className = 'other';
		pTagSelf.appendChild(textNode);
		
		let li = document.createElement('li');
		li.appendChild(pTagSelf);
		
		chatWindow.appendChild(li);

	};

    let offerCode = document.getElementById('offerCode');
    
	peerConnection.onicecandidate = function(candidate) {
		if(!candidate.candidate) {
			offerCode.innerText = JSON.stringify(peerConnection.localDescription);
		};
	};

	const offer = await peerConnection.createOffer();
	await peerConnection.setLocalDescription(offer);
}

function copyCode() {
	let offerCode = document.getElementById('offerCode');
	navigator.clipboard.writeText(offerCode.value);
}

async function connect() {
	let answer = JSON.parse(document.getElementById('answerRecieved').value);
	const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);
}


let generateAnswerButton = document.getElementById('generateAnswer');
generateAnswerButton.addEventListener('click', generateAnswer);

let copyAnswerButton = document.getElementById('copyAnswer');
copyAnswerButton.addEventListener('click', copyAnswer);


async function generateAnswer() {
	let offer = JSON.parse(document.getElementById('offerRecieved').value);

	peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

	let answerCode = document.getElementById('answerCode');

	peerConnection.onicecandidate = function(candidate) {
		if(!candidate.candidate) {
			answerCode.innerText = JSON.stringify(peerConnection.localDescription);
		};
	};

	const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
}

function copyAnswer() {
	let answerCode = document.getElementById('answerCode');
	navigator.clipboard.writeText(answerCode.value);
}

