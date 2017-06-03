var som;

$( document ).ready( function() {
	som = (function() {
		
		var init = function() {
			log("som init");
			listLm();
		};
		
		var listLm = function() {
			log("listLm");
			for (var k in localStorage) {
				//console.log(a, ' = ', localStorage[k]);
				var $a = $( "<div class='lm' id='" + k +"' onclick='som.openLm(this.id)'>"+JSON.parse(localStorage[k])[0].title+"</div>");
				$('#lmList').append($a);
			}
		};
		
		var openLm = function(lm) {
			log("openLm: "+lm);
			open("../player/player12.html","client="+JSON.parse(localStorage[lm])[0].client+"&obj_id="+lm);
		};
		
		var log = function(txt) {
			console.log(txt);
		};
		
		return {
			init : init,
			openLm : openLm,
			log : log
		};
	}());
	som.init();
});
