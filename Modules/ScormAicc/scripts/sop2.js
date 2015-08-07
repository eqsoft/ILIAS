var sop2;

$( document ).ready( function() {
	sop2 = (function() {
		//var offline = true;
		var cmdUrl = "";
		var init = function () {
			log("sop2: init");
			$('#ilDownloadedFiles').hide();
			cmdUrl = document.URL.substring(0,document.URL.indexOf('?'))+'?baseClass=ilSAHSPresentationGUI&ref_id='+sop2Globals.refId+'&client_id='+sop2Globals.ilClient+'&cmd=',
			log("sop2: cmdUrl = " + cmdUrl);
			resetAppCacheGUI();
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
			resetAppCacheGUI();
			$('#iliasOfflineManager').after('<iframe id="appCacheDownloadFrame" src="' + cmdUrl + 'offlineMode2_il2sop" onload="parent.sop2.createAppCacheEventHandler(this);"></iframe>');
		};
		
		// AppCache Event Handler
		
		var acChecking = function() {
			log("sop2: appcache on checking...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Checking for appcache update...");
		};
		
		var acNoupdate = function() {
			log("sop2: appcache on noupdate...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Content is already cached, no updated needed.");
			$('#ilAppCacheEventProgress').text("");
		};
		
		var acDownloading = function() {
			log("sop2: appcache on downloading");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Downloading appcache manifest");
			$('#ilAppCacheEventProgress').text("");
		};
		
		var acProgress = function(evt) {
			log("sop2: appcache on progress...");
			var msg = "Downloading appcache content";
			if ($('#ilAppCacheEvent').text() != msg) {
				$('#ilAppCacheEvent').text(msg); 
			}
			var progress = $('#ilAppCacheEventProgress').text() + ". ";
			$('#ilAppCacheEventProgress').text(progress);
			//log($('#filesLoaded').text());
			//log(evt.total);
			//log(evt.lengthComputable);
			//$('#filesLoaded').text(evt.loaded);
			/*
			if (parseInt($('#filesTotal').text()) == 0) {
				$('#filesTotal').text(evt.total);
			}
			$('#filesLoaded').text(evt.loaded);
			*/
		};
		
		var acCached = function() {
			log("sop2: appcache on cached...");
			var finished = $('#ilAppCacheEventProgress').text() + " Files are downloaded into the browsers application cache!"
			$('#ilAppCacheEventProgress').text(finished);
		};
		
		var acUpdateready = function() { //ToDo: prevent multiple progress endings (4x events)
			log("sop2: appcache on updateready...");
			var msg = "Appcache updated successfully";
			$('#ilAppCacheEvents').show();
			var progress = $('#ilAppCacheEventProgress').text() + "Appcache updated successfully";
			$('#ilAppCacheEventProgress').text(progress);
		};
		
		var acObsolete = function() {
			log("sop2: appcache on obsolete...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Failed to load the appcache manifest from server!");
		};
		
		var acError = function(evt) {
			log("sop2: appcache on error: " + evt);
			//log(evt.originalEvent.message);
		};
		
		// gui events
		var resetAppCacheGUI = function() {
			$('#ilAppCacheEvent').text("");
			$('#ilAppCacheEventProgress').text("");
			$('#ilAppCacheEvents').hide();
		}
		
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
