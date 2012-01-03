$(function(){

	var audio = new Audio();
	var canPlayMp4 = ("" != audio.canPlayType("audio/mp4"));
	var canPlayOgg = ("" != audio.canPlayType("audio/ogg"));
	var canPlayMp3 = ("" != audio.canPlayType("audio/mpeg"));
	
	var audioType = canPlayMp4? 'm4a' : canPlayMp3? 'mp3' : canPlayOgg? 'ogg' : null;
	if(audioType == null){
		alert('not supported mp3 or ogg audio');
		return;
	} 

	var dtmfs = [
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 's', 'h'
	];
	
	var $ul = $('#dtmflist');
	var tpl = $('#dtmfTpl').html();
	
	var dtmfObjs = {};
	var loadedCount = 0;
	$('#indicator .audioType').text(audioType);
	$('#indicator .number').text('0/' + dtmfs.length);
	
	function enablePlayButton(value){
		$('.playBtn').attr('disabled', !value);
	}
	
	
	for(var i = 0; i < dtmfs.length; ++i){
		(function(ch){
	
			var audio = $('.dtmf' + ch).get(0);
			$(audio).bind('loadeddata', function(){
				console.log('loadeddata:' + ch);
				loadedCount++;
				$('#indicator .number').text(loadedCount + '/' + dtmfs.length);
				if(loadedCount == dtmfs.length){
					//enablePlayButton(true)
				}
			});
			$(audio).bind('error', function(e){
				console.dir(e);
			});
			
			console.log('loadstart: ' + ch);
			audio.src = audioType + '/d' + ch + '.' + audioType;
			audio.load();
			
			dtmfObjs[ch] = {
				play: function(callback){
					
					var ended = function(){
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
	
	$('.playBtn').click(function(){
		var url = $('input[name=url]', '#mainForm').val();
		
		//play('459h2hss');
		var toTc = 'tc.php?url=' + url;
		console.log(toTc);
		$.get(toTc, function(str){
			play(str);
		});
		
	});
	
	
	function play(str, callback){
	
		function playChar(index, callback){
			if(index < str.length){
				
				setTimeout(function(){
					var ch = str.charAt(index);
					var dobj = dtmfObjs[ch];
					console.log('code:' + ch + '(' + index + ')');
					
					if(!dobj){
						console.log('code not found');
						playChar(++index, callback);
					}
					else{
						dobj.play(function(){
								playChar(++index, callback);
						});
					}
					
				}, 200);
			}else{
				if(callback) callback();
			}
		}
		
		playChar(0);
	}

	
});


