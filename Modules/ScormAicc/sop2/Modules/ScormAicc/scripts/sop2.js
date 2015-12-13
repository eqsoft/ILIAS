/**
 * script for managing offline slm experience
 */ 

var sop2;

var gui; // compatibility
$( document ).ready( function() {
	sop2 = (function() {
		var init = function () {
			log("player: init");
			gui = sop2;
			initPlayer();
		};
		
		var log = function(txt) {
			console.log(txt);
		};
		
		var getPlayerParams = function(win) { // getPlayerParams fromm window name
			log("player: getPlayerParams");
			var qs = {};
			var queryString;
			queryString = win.name;
			var re = /([^&=]+)=([^&]*)/g;
			var m;
			while (m = re.exec(queryString)) {
				qs[m[1]] = m[2];
			}
			return qs;
		};
		
		var getData = function(key,data) {
			log("getData");
			log("key: " + key);
			log("data: " + data);
			var ret = '';
			switch (key) {
				case "lmGetAllByClientAndObjIdAtInitOfPlayer" :
					log("lmGetAllByClientAndObjIdAtInitOfPlayer");
					ret = '{"data": "data"}';
				break;
				default :
					ret = '{}';
					log("no data key:" + key);
			}
			return ret;
		};
		
		var setData = function(key,data) {
			
		};
		
		return {
			init 				: init,
			log				: log,
			getPlayerParams			: getPlayerParams,
			getData				: getData,
			setData				: setData
		};
	}());
	sop2.init();
});
