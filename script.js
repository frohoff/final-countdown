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

	$('#tags').val($.localStorage.get('tags') || 'yosemite');
	$('#tags').change(function(){
		$.localStorage.set('tags', $(this).val());

		randomizeBg();
	});	

	function setTime() {
		clock.stop();
		var endTime = $('#time').timepicker('getTime', new Date());
		console.log(endTime)
		var time = getTimer(endTime);
		console.log(time)
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
		if (hms.min % 1 == 0 && hms.sec == 0 || hms.hour == 0 && hms.min == 0 && hms.sec < 20) {
			sayTime();
		}
		if (hms.hour == 0 && hms.min == 0 && hms.sec == 0) {
			clock.stop();
			say('time up');
			clearInterval(checkInterval);
		}
	}

	function randomizeBg() {
		keywords = $("#tags").val().split(";") //["astrophotography", "pugs"] 
		//keywords = ["pugs"]
		randKeyword = keywords[Math.floor(Math.random()*keywords.length)]
		console.info("randomizing bg")
//https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=15aea8f087339a8e285d5dd71be8bfc1&tags=landscape&extras=o_dims%2C+url_o&format=json
            //$.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
           	$.getJSON("https://api.flickr.com/services/rest/",            	
            {
               	method: "flickr.photos.search",
               	api_key: "8c0309d84159f59009457f3c7ab5f79d",
               	extras: "o_dims,url_o",
                  tags: randKeyword,
                  format: "json",
                  nojsoncallback: 1,
                  sort: "interestingness-desc"
                },

                //The callback function
                function(data) {
					console.info(data)	
					photos = $.grep(data.photos.photo, function(p){
						return p.url_o;
					})
                  //Get random photo from the api's items array
                    var randomPhoto = photos[Math.floor(Math.random() * photos.length)];  

                    console.info(randomPhoto)

                    /*
                    https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
                    https://alternativeto.net/software/cors-proxy/
                    */

                    //url = "https://crossorigin.me/" + randomPhoto.url_o
                    //url = "http://cors.io/?" + randomPhoto.url_o
                    //url = "https://cors-anywhere.herokuapp.com/" + randomPhoto.url_o
                    url = "https://galvanize-cors-proxy.herokuapp.com/" + randomPhoto.url_o.replace(/https?:\/\//g,"")

                    $('<img/>').attr('crossOrigin', 'Anonymous').attr('src', url).on('load', function() {

						var canvas = document.createElement('canvas');
				        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
				        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

				        canvas.getContext('2d').drawImage(this, 0, 0);

				        // Get raw image data
				        imgDataURI = canvas.toDataURL('image/png')


					   $(this).remove(); // prevent memory leaks as @benweet suggested

						console.info("loaded")

	                    $("body").css({


	                      position: "relative",
	                      height: "100vh",
	                    //Use the randomPhoto's link
	                      backgroundImage: 'url("'+imgDataURI+'")',
	                      backgroundPosition: "center",
	                      backgroundRepeat: "no-repeat",
	                      backgroundSize: "cover"
	                    });

						BackgroundCheck.init({
						  targets: 'div.container',
						  images: 'body'
						});

	                    //BackgroundCheck.refresh();

// $('.target').blurjs({
//     source: 'body',
//     radius: 7,
//     overlay: 'rgba(255,255,255,0.4)'
// });	                    

					});

                    

                    
                 }
             );			
	}

	say('hi');




	var checkInterval = setInterval(check, 1000);
	var checkInterval = setInterval(randomizeBg, 60 * 1000);

randomizeBg();


	
});

var dayInMs = 24 * 60 * 60 * 1000;

function getTimer(time) {
	var now = new Date();
	console.log('now: ' + now);
	if (time.getTime() < now.getTime()) { // if time in the past
		time = new Date(time.getTime() + dayInMs); // set to next day
	}
	var diff = time.getTime() - now.getTime();
	console.log('diff: ' + diff);
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




