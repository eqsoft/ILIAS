var sop2;

$( document ).ready( function() {
	sop2 = (function() {
		//var offline = true;
		var cmdUrl = "";
		var init = function () {
			log("sop2: init");
			cmdUrl = document.URL.substring(0,document.URL.indexOf('?'))+'?baseClass=ilSAHSPresentationGUI&ref_id='+sop2Globals.refId+'&client_id='+sop2Globals.ilClient+'&cmd=',
			log("sop2: cmdUrl = " + cmdUrl);
			//offline = !navigator.onLine;
			//log("offline: " + offline);
		};
		
		var log = function(txt) {
			console.log(txt);
		};
		
		var checkSystem = function() {
			log("sop2: checkSystem");
			// ToDo
		};
		
		var importLm = function () {
			log("sop2: importLm");
			$('#iliasOfflineManager').after('<iframe id="appCacheDownloadFrame" src="' + cmdUrl + 'offlineMode2_il2sop" onload="parent.sop2.createAppCacheEventHandler(this);"></iframe>');
			//alert("importLm");
		};
		
		// AppCache Event Handler
		
		var acChecking = function() {
			log("sop2: appcache on checking...");
		};
		
		var acNoupdate = function() {
			log("sop2: appcache on noupdate...");
		};
		
		var acDownloading = function() {
			log("sop2: appcache on downloading...");
		};
		
		var acProgress = function() {
			log("sop2: appcache on progress...");
		};
		
		var acCached = function() {
			log("sop2: appcache on cached...");
		};
		
		var acUpdateready = function() {
			log("sop2: appcache on updateready...");
		};
		
		var acObsolete = function() {
			log("sop2: appcache on obsolete...");
		};
		
		var acError = function() {
			log("sop2: appcache on error...");
		};
		
		var createAppCacheEventHandler = function(iframe) {
			log("sop2: createAppCacheEventHandler: " + iframe);
			$(iframe.contentWindow.applicationCache).on('checking', acChecking);
			$(iframe.contentWindow.applicationCache).on('noupdate', acNoupdate);
			$(iframe.contentWindow.applicationCache).on('downloading', acDownloading);
			$(iframe.contentWindow.applicationCache).on('progress', acProgress);
			$(iframe.contentWindow.applicationCache).on('cached', acCached);
			$(iframe.contentWindow.applicationCache).on('updateready', acUpdateready);
			$(iframe.contentWindow.applicationCache).on('obsolete', acObsolete);
			$(iframe.contentWindow.applicationCache).on('error', acError);
		};
		
		return {
			init 				: init,
			importLm 			: importLm,
			acChecking 			: acChecking,
			acNoupdate 			: acNoupdate,
			acDownloading 			: acDownloading,
			acProgress 			: acProgress,
			acCached			: acCached,
			acUpdateready			: acUpdateready,
			acObsolete			: acObsolete,
			acError				: acError,
			createAppCacheEventHandler 	: createAppCacheEventHandler	
		};
	}());
	sop2.init();
});
