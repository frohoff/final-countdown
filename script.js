$(function(){
	var soundPath = "bower_components/ion-sound/sounds/";
	ion.sound({
	    sounds: [
	        {
	            name: "bell_ring"
	        },
	    ],
	    path: soundPath,
	    preload: true
	});

	function ding(){
		ion.sound.play('bell_ring');
	}	

	var clock = $('#clock').FlipClock({
		countdown: true
	});

	$('#clock').click(function(){
		ding();
		randomizeBg();
	})

	$('#time').val($.localStorage.get('time') || '07:15am');
	$('#time').timepicker({
		step: 5
	});
	$('#time').change(function(){
		$.localStorage.set('time', $(this).val());
		setTime();
	});
	setTime();

	var pages = {};
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

	function check() {
		var sec = clock.getTime();
		var hms = secToHms(sec);
		if (hms.min % 1 == 0 && hms.sec == 0 || hms.hour == 0 && hms.min == 0 && hms.sec < 20) {
			ding();
		}
		if (hms.hour == 0 && hms.min == 0 && hms.sec == 0) {
			clock.stop();
			clearInterval(checkInterval);
		}
	}

	function randomizeBg() {
		keywords = $("#tags").val().split(";") //["astrophotography", "pugs"] 
		randKeyword = keywords[Math.floor(Math.random()*keywords.length)]
		keywordPages = pages[randKeyword]
		page = keywordPages ? Math.floor(Math.random()*keywordPages) : 1
		console.info("randomizing bg")
           	$.getJSON("https://api.flickr.com/services/rest/",            	
            {
               	method: "flickr.photos.search",
               	api_key: "8c0309d84159f59009457f3c7ab5f79d",
               	per_page: 500,
               	page: page,
               	safe_search: 1,
               	extras: "o_dims,url_o",
                  tags: randKeyword,
                  format: "json",
                  nojsoncallback: 1,
                  sort: "interestingness-desc"
                },

                //The callback function
                function(data) {
					console.info('found total photos: ' + data.photos.total)
					pages[randKeyword] = data.photos.pages;
					photos = $.grep(data.photos.photo, function(p){
						return p.url_o && p.width_o < 3000 && p.width_o > 1920;
					})
					console.info('found photos on page ' + page + ': ' + photos.length)
                  //Get random photo from the api's items array
                    var randomPhoto = photos[Math.floor(Math.random() * photos.length)];  

                    console.info(JSON.stringify(randomPhoto));

                    /*
                    https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
                    https://alternativeto.net/software/cors-proxy/
                    */

                    //url = "https://crossorigin.me/" + randomPhoto.url_o
                    //url = "http://cors.io/?" + randomPhoto.url_o
                    //url = "https://cors-anywhere.herokuapp.com/" + randomPhoto.url_o
                    url = "https://galvanize-cors-proxy.herokuapp.com/" + randomPhoto.url_o.replace(/https?:\/\//g,"")

                    $('<img/>').attr('crossOrigin', 'Anonymous').attr('src', url).on('load', function() {

						console.info("loaded")

						// var canvas = document.createElement('canvas');
				  //       canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
				  //       canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

				  //       canvas.getContext('2d').drawImage(this, 0, 0);

				  //       imgDataURI = canvas.toDataURL('image/png')

					   $(this).remove(); // prevent memory leaks as @benweet suggested

						console.info("swapping in")

						//BackgroundCheck.destroy();

	                    $("body").css({
	                      position: "relative",
	                      height: "100vh",
	                      backgroundImage: 'url('+url+')',
	                      backgroundPosition: "center",
	                      backgroundRepeat: "no-repeat",
	                      backgroundSize: "cover"
	                    });
	                    console.info("done swapping in")

	                    window.requestIdleCallback(function(){
	                    	console.info('refreshing');
	                    	BackgroundCheck.init({
							  targets: 'div.container',
							  images: 'body',
							  windowEvents: false
							});
	                    	BackgroundCheck.refresh()
	                    	//BackgroundCheck.refresh($('div.container')[0], false, $('body')[0]);	
	                    	console.info('done refreshing')
	                    })

					});
                 }
             );			
	}

	var checkInterval = setInterval(check, 1000);
	var randomizeBgInterval = setInterval(randomizeBg, 30 * 1000);

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
