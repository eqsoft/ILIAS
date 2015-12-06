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
		
		var getPlayerParams = function(win) {
			log("player: getPlayerParams");
			var qs = {};
			var queryString;
			queryString = (typeof win === "string") ? win.split("\?")[1] : win.document.location.search.slice(1);
			var re = /([^&=]+)=([^&]*)/g;
			var m;
			while (m = re.exec(queryString)) {
				qs[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}
			return qs;
		};
		
		var getData = function(key,data) {
			log("getData");
			log("key: " + key);
			log("data: " + data);
			switch (key) {
				case "lmGetAllByClientAndObjIdAtInitOfPlayer" :
					
				break;
				default :
					log("no data key:" + key);
			}
		};
		
		var setData = function(key,data) {
			
		};
		
		return {
			init 				: init,
			getPlayerParams			: getPlayerParams,
			getData				: getData,
			setData				: setData
		};
	}());
	sop2.init();
});
