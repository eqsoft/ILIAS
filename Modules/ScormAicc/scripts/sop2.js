var sop2;

$( document ).ready( function() {
	sop2 = (function() {
		//var offline = true;
		var iliasPhp = "";
		var sopCmdUrl = "";
		var lmCmdUrl = "";
		var webroot = "";
		var sopAppCache;
		var lmAppCache;
		var init = function () {
			log("sop2: init");
			iliasPhp = document.URL.substring(0,document.URL.indexOf('?'));
			webroot = iliasPhp.replace(/ilias.php/,"");
			lmCmdUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&ref_id='+sop2Globals.refId+'&client_id='+sop2Globals.ilClient+'&cmd=';
			sopCmdUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&client_id='+sop2Globals.ilClient+'&cmd=offlineMode2_sop2';
			// disable import button 
			$("#btnImport").prop('disabled', true);
			// reset messages
			//load sop resources into appcache if not exists
			
			$('#iliasOfflineManager').after('<iframe id="sopAppCacheDownloadFrame" src="' + sopCmdUrl + '" onload="sop2.createSopAppCacheEventHandler(this);"></iframe>');
			
			//log("sop2: cmdUrl = " + sopCmdUrl);
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
			$('#iliasOfflineManager').after('<iframe id="lmAppCacheDownloadFrame" src="' + lmCmdUrl + 'offlineMode2_il2sop" onload="parent.sop2.createLmAppCacheEventHandler(this);"></iframe>');
		};
		
		// AppCache Event Handler for Sop
		var sopAppCacheChecking = function() {
			log("sop appcache on checking...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Checking for sop appcache update...");
		};
		
		var sopAppCacheNoupdate = function() {
			log("sop appcache on noupdate...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("sop is already cached, no updated needed. Now you can import the SCORM Learning Module.");
			$('#ilAppCacheEventProgress').text("");
			$("#btnImport").prop('disabled', false);
		};
		
		var sopAppCacheDownloading = function() {
			log("sop appcache on downloading");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Downloading sop appcache manifest");
			$('#ilAppCacheEventProgress').text("");
		};
		
		var sopAppCacheProgress = function(evt) {
			log("sop appcache on progress...");
			var msg = "Downloading sop appcache content";
			if ($('#ilAppCacheEvent').text() != msg) {
				$('#ilAppCacheEvent').text(msg); 
			}
			var progress = $('#ilAppCacheEventProgress').text() + ". ";
			$('#ilAppCacheEventProgress').text(progress);
		};
		
		var sopAppCacheCached = function() {
			log("sop appcache on cached...");
			$("#btnImport").prop('disabled', false);
			var finished = $('#ilAppCacheEventProgress').text() + " sop files are downloaded into the browsers application cache! Now you can import the SCORM Learning Module."
			$('#ilAppCacheEventProgress').text(finished);
		};
		
		var sopAppCacheUpdateready = function() { //ToDo: prevent multiple progress endings (4x events)
			log("sop appcache on updateready...");
			sopAppCache.swapCache();
			$("#btnImport").prop('disabled', false);
			var finished = $('#ilAppCacheEventProgress').text() + " sop files are downloaded into the browsers application cache! Now you can import the SCORM Learning Module."
			$('#ilAppCacheEventProgress').text(finished);
		};
		
		var sopAppCacheObsolete = function() {
			log("sop appcache on obsolete...");
		};
		
		var sopAppCacheError = function(evt) {
			log("sop appcache on error: " + evt);
		};
		
		
		// AppCache Event Handler for LearningModule
		var lmAppCacheChecking = function() {
			log("lm appcache on checking...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Checking for lm appcache update...");
		};
		
		var lmAppCacheNoupdate = function() {
			log("lm appcache on noupdate...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("lm content is already cached, no updated needed.");
			$('#ilAppCacheEventProgress').text("");
		};
		
		var lmAppCacheDownloading = function() {
			log("lm appcache on downloading");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Downloading lm appcache manifest");
			$('#ilAppCacheEventProgress').text("");
		};
		
		var lmAppCacheProgress = function(evt) {
			log("lm appcache on progress...");
			
			var msg = "Downloading lm appcache content";
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
		
		var lmAppCacheCached = function() {
			log("lm appcache on cached...");
			var finished = $('#ilAppCacheEventProgress').text() + " lm files are downloaded into the browsers application cache!"
			$('#ilAppCacheEventProgress').text(finished);
		};
		
		var lmAppCacheUpdateready = function() { //ToDo: prevent multiple progress endings (4x events)
			log("lm appcache on updateready...");
			lmAppCache.swapCache();
			var msg = "lm appcache updated successfully";
			$('#ilAppCacheEvents').show();
			var progress = $('#ilAppCacheEventProgress').text() + "lm appcache updated successfully";
			$('#ilAppCacheEventProgress').text(progress);
		};
		
		var lmAppCacheObsolete = function() {
			log("lm appcache on obsolete...");
			$('#ilAppCacheEvents').show();
			$('#ilAppCacheEvent').text("Failed to load the lm appcache manifest from server!");
		};
		
		var lmAppCacheError = function(evt) {
			console.dir(evt);
			log("lm appcache on error: " + evt);
			//log(evt.originalEvent.message);
		};
		
		// gui events
		var resetAppCacheGUI = function() {
			$('#ilAppCacheEvent').text("");
			$('#ilAppCacheEventProgress').text("");
			$('#ilAppCacheEvents').hide();
		};
		
		var createSopAppCacheEventHandler = function(iframe) {
			log("sop2: createSopAppCacheEventHandler: " + iframe);
			sopAppCache = iframe.contentWindow.applicationCache;
			$(sopAppCache).on('checking', sopAppCacheChecking);
			$(sopAppCache).on('noupdate', sopAppCacheNoupdate);
			$(sopAppCache).on('downloading', sopAppCacheDownloading);
			$(sopAppCache).on('progress', sopAppCacheProgress);
			$(sopAppCache).on('cached', sopAppCacheCached);
			$(sopAppCache).on('updateready', sopAppCacheUpdateready);
			$(sopAppCache).on('obsolete', sopAppCacheObsolete);
			$(sopAppCache).on('error', sopAppCacheError);
		};
		
		var createLmAppCacheEventHandler = function(iframe) {
			log("sop2: createLmAppCacheEventHandler: " + iframe);
			lmAppCache = iframe.contentWindow.applicationCache;
			$(lmAppCache).on('checking', lmAppCacheChecking);
			$(lmAppCache).on('noupdate', lmAppCacheNoupdate);
			$(lmAppCache).on('downloading', lmAppCacheDownloading);
			$(lmAppCache).on('progress', lmAppCacheProgress);
			$(lmAppCache).on('cached', lmAppCacheCached);
			$(lmAppCache).on('updateready', lmAppCacheUpdateready);
			$(lmAppCache).on('obsolete', lmAppCacheObsolete);
			$(lmAppCache).on('error', lmAppCacheError);
		};
		
		return {
			init 				: init,
			importLm 			: importLm,
			createSopAppCacheEventHandler 	: createSopAppCacheEventHandler,
			createLmAppCacheEventHandler 	: createLmAppCacheEventHandler	
		};
	}());
	sop2.init();
});
