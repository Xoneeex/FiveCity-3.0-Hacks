$('html').hide();

const hackBox = document.querySelector('.hack-box');
const hackFunction = document.querySelector('.hack-fn');
const hackFunction2 = document.querySelector('.hack-fn2');
const hackInfoBox = document.querySelector('.hack-info');
const hackInfo = document.getElementById('hack-info-text');
const startButton = document.querySelector('.start-hack');
const buttons = document.querySelector('.play-buttons');
const progressBarBox = document.querySelector('.hack-progress');
const progressBarFn = document.getElementById('progress-bar-fn');
const hackOptions = document.querySelector('.hack-options');
const modal = document.querySelector('.modal-mask');
const rightAnswer = document.querySelector('.right-answer');
const input = document.getElementById('input');

const shuffleArray = (array) =>
	array
		.map((a) => ({ random: Math.random(), value: a }))
		.sort((a, b) => a.random - b.random)
		.map((a) => a.value);

var progressBarInterval, timerInterval;
var playTime = 10;
var rememberTime = 5;
var defaultSquaresCount = 4;
var squaresCount = document.querySelector('.tile-input');
var defaultLevels = 2;
var levels = document.querySelector('.level-input');
var level = 0;
var antiSolverMode = false;
var colors = [
	'czarny',
	'bialy',
	'czerwony',
	'zolty',
	'niebieski',
	'pomaranczowy',
	'fioletowy',
	'zielony',
];
var shapes = ['kwadrat', 'trojkat', 'prostokat', 'kolo'];
var questionTypes = [
	{ type: 'backgroundColor', text: 'kolor tla' },
	{ type: 'textColorColor', text: 'kolor napisanego koloru' },
	{ type: 'numberColor', text: 'kolor numeru' },
	{ type: 'shape', text: 'ksztalt pod tekstem' },
	{ type: 'shapeColor', text: 'kolor ksztaltu pod tekstem' },
	{ type: 'textShape', text: 'napisany ksztalt' },
	{ type: 'textShapeColor', text: 'kolor tekstu napisanego ksztaltu' },
	{ type: 'textColor', text: 'napisany kolor' },
];
var realNumbers;
var items = [];
var questions;
var answersArr;

function hack() {
	hackInfoBox.style.display = 'none';
	hackFunction.style.display = 'none';
	hackFunction2.style.display = 'none';
	progressBarBox.style.display = 'none';
	modal.style.display = 'none';
	document.getElementById('level').textContent = String(defaultLevels);
	document.getElementById('tile').textContent = String(defaultSquaresCount);
}

function startHack() {
	$('html').fadeIn();
	isOver = false;
	lastPosition = 0;
	wrong = 0;
	level = 0;
	let start = new Date();
	let updateTime = () => {
		let now = new Date();
		let diff = new Date();

		diff.setTime(now - start);
	};
	clearInterval(timerInterval);
	generateElements();
	input.value = '';
	timerInterval = setInterval(updateTime, 1000);
	hackOptions.style.display = 'none';
	buttons.style.display = 'none';
	hackInfoBox.style.display = '';
	hackInfo.textContent = 'Przygotuj się...';
	progressBarBox.style.display = 'block';
	progressBar('start', 9);
}

function gameWin() {
	hackFunction.style.display = 'none';
	hackFunction2.style.display = 'none';
	hackInfoBox.style.display = '';
	hackInfo.textContent = 'Hack udany';
	progressBarBox.style.display = 'block';
	progressBar('end', 9);
	setTimeout(() => {
		$('html').hide();
		$.post(`https://${GetParentResourceName()}/gameWin`, JSON.stringify({}));
	}, 3000);
}

function gameOver() {
	hackFunction.style.display = 'none';
	hackFunction2.style.display = 'none';
	progressBarBox.style.display = 'block';
	hackInfoBox.style.display = '';
	hackInfo.textContent = 'Hack nieudany';
	progressBar('end', 9);
	setTimeout(() => {
		$('html').hide();
		$.post(`https://${GetParentResourceName()}/gameFailed`, JSON.stringify({}));
	}, 3000);
}

function progressBar(w, t) {
	let width = 1000;
	function updateProgress() {
		if (width > 0) {
			if (w === 'start' || w === 'end') width -= 3;
			else width--;
			progressBarFn.style.width = (width * 100) / 1000 + '%';
		} else {
			if (w === 'start') {
				hackFunction.style.display = '';
				hackInfoBox.style.display = 'none';
				generateSquares();
				generateQuestions();
				for (let i = 1; i <= squaresCount.value; i++) {
					const group = document.querySelector('.g' + i);
					const el1 = group.querySelector('.real-number');
					const el2 = group.querySelector('.text-color');
					const el3 = group.querySelector('.shape');
					const el4 = group.querySelector('.text-shape');
					const el5 = group.querySelector('.number');

					el1.classList.remove('hidden');
					el2.classList.add('hidden');
					el3.classList.add('hidden');
					el4.classList.add('hidden');
					el5.classList.add('hidden');
				}
				const number = document.querySelectorAll('.real-number');
				setTimeout(() => {
					for (let el of number) {
						el.style.fontSize = '0';
					}
				}, rememberTime * 1000 - (rememberTime * 1000) / 3);
				progressBar('remember', rememberTime);
				return;
			}
			if (w === 'remember') {
				for (let i = 1; i <= squaresCount.value; i++) {
					const group = document.querySelector('.g' + i);
					const el1 = group.querySelector('.real-number');
					const el2 = group.querySelector('.text-color');
					const el3 = group.querySelector('.shape');
					const el4 = group.querySelector('.text-shape');
					const el5 = group.querySelector('.number');

					el1.classList.add('hidden');
					el2.classList.remove('hidden');
					el3.classList.remove('hidden');
					el4.classList.remove('hidden');
					el5.classList.remove('hidden');
				}
				hackInfoBox.style.display = 'none';
				hackFunction2.style.display = '';
				document.getElementById('close').addEventListener('click', gameOver);
				progressBar('game', playTime);
				return;
			}
			if (w === 'game') {
				gameOver();
				return;
			}
			if (w === 'end') {
				hackFunction.style.display = 'none';
				hackFunction2.style.display = 'none';
				hackOptions.style.display = '';
				buttons.style.display = '';
				progressBarBox.style.display = 'none';
				hackInfoBox.style.display = 'none';
				document.getElementById('close').removeEventListener('click', gameOver);
			}
		}
	}

	clearInterval(progressBarInterval);
	progressBarInterval = setInterval(updateProgress, t);
}

function generateElements() {
	hackFunction.innerHTML = '';

	for (let i = 0; i < squaresCount.value; i++) {
		const group = document.createElement('div');

		group.classList.add('g' + (i + 1));
		hackFunction.appendChild(group);

		const el1 = document.createElement('div');
		const el2 = document.createElement('div');
		const el3 = document.createElement('div');
		const el4 = document.createElement('div');
		const el5 = document.createElement('div');

		el1.classList.add('real-number');
		group.appendChild(el1);

		el2.classList.add('shape');
		group.appendChild(el2);

		el3.classList.add('text-color');
		group.appendChild(el3);

		el4.classList.add('text-shape');
		group.appendChild(el4);

		el5.classList.add('number');
		group.appendChild(el5);
	}
}

function generateSquares() {
	let numbers = [];
	for (let i = 1; i <= squaresCount.value; i++) numbers.push(i);

	realNumbers = shuffleArray(numbers);
	let randomNumbers = shuffleArray(numbers);
	items = [];

	for (let i = 0; i < squaresCount.value; i++) {
		const el1 = document.querySelector('.g' + (i + 1));
		const el2 = document.querySelectorAll('.real-number')[i];
		const el3 = document.querySelectorAll('.text-color')[i];
		const el4 = document.querySelectorAll('.shape')[i];
		const el5 = document.querySelectorAll('.text-shape')[i];
		const el6 = document.querySelectorAll('.number')[i];

		let background = colors[Math.floor(Math.random() * colors.length)];
		let textColor = colors[Math.floor(Math.random() * colors.length)];
		let textColorColor = colors[Math.floor(Math.random() * colors.length)];
		let numberColor = colors[Math.floor(Math.random() * colors.length)];
		let shape = shapes[Math.floor(Math.random() * shapes.length)];
		let shapeColor = colors[Math.floor(Math.random() * colors.length)];
		let textShape = shapes[Math.floor(Math.random() * shapes.length)];
		let textShapeColor = colors[Math.floor(Math.random() * colors.length)];

		if (background === shapeColor)
			colors.indexOf(shapeColor) < colors.length
				? colors[colors.indexOf(shapeColor) + 1]
				: colors[colors.indexOf(shapeColor) - 1];
		if (textColorColor === 'czerwony') textColorColor = 'pomaranczowy';
		if (textShapeColor === 'czerwony') textShapeColor = 'pomaranczowy';

		el1.classList.add('bg-' + background);

		el2.textContent = realNumbers[i];

		el3.textContent = textColor;
		el3.classList.add(textColorColor);

		el4.classList.add(shape);
		el4.classList.add('bg-' + shapeColor);

		el5.textContent = textShape;
		el5.classList.add(textShapeColor);

		el6.textContent = randomNumbers[i];
		el6.classList.add(numberColor);

		items.push(realNumbers[i], {
			backgroundColor: background,
			textColorColor: textColorColor,
			numberColor: numberColor,
			shape: shape,
			shapeColor: shapeColor,
			textShape: textShape,
			textShapeColor: textShapeColor,
			textColor: textColor,
			number: randomNumbers[i],
		});
	}
}

function generateQuestions() {
	let questionType = shuffleArray(questionTypes);
	questions = questionType.slice(0, squaresCount.value <= 4 ? 2 : 3);
	answers = [];

	document.querySelector('.questions').innerHTML = '';

	for (let i = 0; i < questions.length; i++) {
		const question = document.createElement('div');
		let random = realNumbers[Math.floor(Math.random() * squaresCount.value)];

		question.textContent = questions[i].text + ' ' + '(' + random + ')';
		question.classList.add('question', 'q' + (i + 1));
		document.querySelector('.questions').appendChild(question);

		answers.push(items[items.indexOf(random) + 1][questions[i].type]);
	}

	rightAnswer.innerHTML = `<div>Poprawne rozwiązanie:</div> <div>${answers.join(
		' '
	)}</div>`;
}

function checkAnswer() {
	let typedAnswer = input.value;

	if (typedAnswer === answers.join(' ')) {
		level++;
		if (level < levels.value) {
			hackFunction2.style.display = 'none';
			input.value = '';
			generateElements();
			generateSquares();
			generateQuestions();
			for (let i = 1; i <= squaresCount.value; i++) {
				const group = document.querySelector('.g' + i);
				const el1 = group.querySelector('.real-number');
				const el2 = group.querySelector('.text-color');
				const el3 = group.querySelector('.shape');
				const el4 = group.querySelector('.text-shape');
				const el5 = group.querySelector('.number');

				el1.classList.remove('hidden');
				el2.classList.add('hidden');
				el3.classList.add('hidden');
				el4.classList.add('hidden');
				el5.classList.add('hidden');
			}
			const number = document.querySelectorAll('.real-number');
			setTimeout(() => {
				for (let el of number) {
					el.style.fontSize = '0';
				}
			}, rememberTime * 1000 - (rememberTime * 1000) / 3);
			progressBar('remember', rememberTime);
		} else {
			gameWin();
		}
	} else {
		modal.style.display = '';
		progressBar('game', 3);
	}
}

function random(max, min) {
	return Math.floor(Math.random() * (max - min)) + min;
}

document.addEventListener('keyup', (e) => {
	let key = e.key;

	if (key === 'Enter') {
		checkAnswer();
	}
});

function modalClose() {
	modal.style.display = 'none';
}

function levelChangeFunction() {
	document.getElementById('level').textContent =
		document.querySelector('.level-input').value;
}

function tileChangeFunction() {
	document.getElementById('tile').textContent =
		document.querySelector('.tile-input').value;
}

window.addEventListener('message', function (event) {
	if (event.data.action == 'openHack') {
		document.querySelector('.level-input').value = event.data.level;
		document.querySelector('.tile-input').value = event.data.tile;
		startHack();
	}
});
