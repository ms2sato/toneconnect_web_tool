$(function() {

	var audio = new Audio();
	var canPlayMp4 = ("" != audio.canPlayType("audio/mp4"));
	var canPlayOgg = ("" != audio.canPlayType("audio/ogg"));
	var canPlayMp3 = ("" != audio.canPlayType("audio/mpeg"));
	
	var params = getParams();

	var audioType = canPlayMp4 ? 'm4a' : canPlayMp3 ? 'mp3' : canPlayOgg ? 'ogg' : null;
	if(audioType == null) {
		alert('not supported mp3 or ogg audio');
		return;
	}
	
	if(params['url']){
		$('input[name=url]', '#mainForm').val(params['url']);
	}

	var dtmfs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 's', 'h'];

	var $ul = $('#dtmflist');
	var tpl = $('#dtmfTpl').html();

	var dtmfObjs = {};
	var loadedCount = 0;
	$('#indicator .audioType').text(audioType);
	$('#indicator .number').text('0/' + dtmfs.length);

	function enablePlayButton(value) {
		$('.playBtn').attr('disabled', !value);
	}

	for(var i = 0; i < dtmfs.length; ++i) {(function(ch) {
			var className = 'dtmf' + ch;

			var atag = '<audio class="' + className + '"></audio>';
			$(atag).appendTo('#audios');

			var audio = $('.' + className).get(0);
			$(audio).bind('loadeddata', function() {
				console.log('loadeddata:' + ch);
				loadedCount++;
				$('#indicator .number').text(loadedCount + '/' + dtmfs.length);
				if(loadedCount == dtmfs.length) {
					//enablePlayButton(true)
				}
			});
			$(audio).bind('error', function(e) {
				console.dir(e);
			});

			console.log('loadstart: ' + ch);
			audio.src = audioType + '/d' + ch + '.' + audioType;

			dtmfObjs[ch] = {
				play : function(callback) {

					var ended = function() {
						callback();
						$(audio).unbind('ended', ended);
						callback = null;
						audio.currentTime = 0;
					};
					$(audio).bind('ended', ended);

					audio.play();

				}
			};
		})(dtmfs[i]);
	}

	$('.playBtn').click(function() {
		var url = $('input[name=url]', '#mainForm').val();

		//play('459h2hss');
		var toTc = 'tc.php?url=' + url;
		console.log(toTc);
		$.get(toTc, function(str) {
			play(str);
		});
	});
	function play(str, callback) {

		console.log('dtmf:' + str);

		function playChar(index, callback) {
			if(index < str.length) {

				setTimeout(function() {
					var ch = str.charAt(index);
					var dobj = dtmfObjs[ch];
					console.log('code:' + ch + '(' + index + ')');

					if(!dobj) {
						console.log('code not found');
						playChar(++index, callback);
					} else {
						dobj.play(function() {
							playChar(++index, callback);
						});
					}

				}, 200);
			} else {
				if(callback)
					callback();
			}
		}

		playChar(0);
	};

	function getParams() {
		var pairs = window.location.search.substr(1).split('&');
		var params = {};
		$.each(pairs, function() {
			var keyValue = this.split('=');

			var key = keyValue[0];
			var value = keyValue[1];
			var param = params[key];
			if(param !== undefined) {
				if(Array.isArray(param)) {
					params[key].push(value);
				} else {
					param = [param];
					param.push(value);
					params[key] = param;
				}
			} else {
				params[key] = value;
			}

		})
		return params;
	};

});
