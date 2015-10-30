$(function(){
	var clock = $('#clock').FlipClock({
		countdown: true
	});
	$('#clock').click(sayTime);

	$('#time').val($.localStorage.get('time') || '07:15am');
	$('#time').timepicker({
		step: 5
	});
	$('#time').change(function(){
		$.localStorage.set('time', $(this).val());

		setTime();
	});
	setTime();

	function setTime() {
		clock.stop();
		var endTime = $('#time').timepicker('getTime');
		var time = getTimer(endTime);
		clock.setTime(time / 1000);
		clock.start();
	}

	function sayTime() {
		var sec = clock.getTime();
		var str = secToStr(sec);
		say(str);
	}

	function check() {
		var sec = clock.getTime();
		var hms = secToHms(sec);
		if (hms.min % 5 == 0 && hms.sec == 0) {
			sayTime();
		}
	}

	say('hi');
	setInterval(check, 1000);
	
});

var dayInMs = 24 * 60 * 60 * 1000;

function getTimer(time) {
	var now = new Date();
	if (time.getTime() < now.getTime()) { // if time in the past
		time = new Date(time.getTime() + dayInMs); // set to next day
	}
	var diff = time.getTime() - now.getTime();
	return diff;
}

function secToHms(sec) {
	sec = Math.floor(sec);
	min = Math.floor(sec / 60);
	sec = sec % 60;
	hour = Math.floor(min / 60);
	min = min % 60;
	return { hour: hour, min: min, sec: sec };
}

function secToStr(sec) {
	hms = secToHms(sec)
	return ('' + (hms.hour > 0 ? hms.hour + ' hours ' : '') + (hms.min > 0 ? hms.min + ' minutes ' : '') + (hms.sec > 0 ? hms.sec + ' seconds ' : '')).trim();
}

function say(s) {
	var speechSynthesis = window.getSpeechSynthesis();
	var speechSynthesisUtterance = window.getSpeechSynthesisUtterance();

	var u = new speechSynthesisUtterance(s);
	u.lang = 'en-US';
	u.volume = 1.0;
	u.rate = 1.0;
	u.onend = function(event) { };
	speechSynthesis.speak(u);
	console.info('said ' + s);
}