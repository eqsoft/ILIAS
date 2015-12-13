/**
 * script for managing the export and import from within ILIAS
 */ 

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
		var sopFrame = "";
		var lmFrame = "";
		var msgs;
		var progress;
		var progressTime;
		var progressInterval = 1000;
		var progressMaxtime = 20000;
		var isPurgeCookieRegEx;
		/**
		 * init sop2
		 */ 
		var init = function () {
			log("sop2: init");
			msgs = [];
			progress = false;
			iliasPhp = document.URL.substring(0,document.URL.indexOf('?'));
			webroot = iliasPhp.replace(/ilias.php/,"");
			lmCmdUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&ref_id='+sop2Globals.refId+'&client_id='+sop2Globals.ilClient+'&cmd=';
			sopCmdUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&client_id='+sop2Globals.ilClient+'&cmd=offlineMode2_sop2';
			sopFrame = '<iframe id="sopAppCacheDownloadFrame" src="' + sopCmdUrl + '" onload="sop2.createSopAppCacheEventHandler(this);"></iframe>';
			lmFrame = '<iframe id="lmAppCacheDownloadFrame" src="' + lmCmdUrl + 'offlineMode2_il2sop" onload="parent.sop2.createLmAppCacheEventHandler(this);"></iframe>';
			trackingUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&client_id='+sop2Globals.ilClient+'&cmd=offlineMode2_tracking2sop&ref_id='+sop2Globals.refId;
			sopOfflineUrl = webroot + "Modules/ScormAicc/sop2/player/player12.html";
			$('#onlineForm').hide();
			$('#offlineForm').hide();
			isPurgeCookieRegEx = new RegExp(sop2Globals.sop_purge_cookie_1);
			document.cookie = sop2Globals.sop_purge_cookie_0;
			checkSystem();
		};
		
		/**
		 * checks HTML5 features and sop2 is already in appcache
		 */ 
		var checkSystem = function() {
			log("sop2: checkSystem");
			msg(sop2Globals.sop_check_system_requirements,true,true);
			if (typeof window.applicationCache !== 'object') {
				msg(sop2Globals.sop_system_check_error,true);
			}
			inProgress();
			$('#iliasOfflineManager').after(sopFrame); // catch the appcache events
		};
		
		var showForm = function() {
			log("show form: " + sop2Globals.mode);
			switch (sop2Globals.mode) {
				case "online" :
					showOnlineForm();
				break;
				case "offline" :
					showOfflineForm();
				break;
			}
		};
		
		var showOnlineForm = function() {
			$('#offlineForm').hide();
			$('#onlineForm').show();
		};
		
		var showOfflineForm = function() {
			// first hide all and load and check the offline lm without purge cookie
			$('#offlineForm').hide();
			$('#onlineForm').hide();
			msg("check offline slm");
			inProgress();
			$('#iliasOfflineManager').after(lmFrame);
		};
		
		var _showOfflineForm = function() {
			$('#offlineForm').show();
		}
		
		var loadOnlineMode = function () {
			window.setTimeout(function() {
				location.replace(lmCmdUrl+"offlineMode2_sop2ilOk");
			}, 2000);
		};
		
		var loadOfflineMode = function () {
			window.setTimeout(function() {
				location.replace(lmCmdUrl+"offlineMode2_il2sopOk");
			}, 2000);
		};
		
		var exportLm = function () {
			log("sop2: exportLm");
			inProgress();
			$.getJSON( trackingUrl, function( data ) { // trigger trackingdata
				if (typeof data == 'object') {
					//var d = JSON.stringify(data);
					//log(d);
					//transformTrackingData(data);
					localStorage.setItem(sop2Globals.lmId, JSON.stringify(transformTrackingData(data)));
					$('#iliasOfflineManager').after(lmFrame); // trigger appcache download
				}
				else {
					log('fetching trackingdata failed!');
					outProgress();
				}
			});
		};
		
		var startOffline = function () {
			log("startOffline: " +sopOfflineUrl);
			open(sopOfflineUrl,"client="+sop2Globals.ilClient+"&obj_id="+sop2Globals.lmId);
		};
		
		var startSom = function () {
			log("startSom");
		};
		
		var pushTracking = function () {
			log("sop2: pushTracking");
			msg("push tracking data", true);
			var purgeCache = $('#chkPurgeCache').is(':checked');
			inProgress();
			var timer = 0;
			var dummyInterval = setInterval(dummy,1000);
			function dummy() {
				timer += 1000;
				if (timer > 3000) {
					clearInterval(dummyInterval);
					localStorage.removeItem(sop2Globals.lmId);
					if (purgeCache) {
						purgeAppCache();
					}
					else {
						outProgress();
						loadOnlineMode();
					}
				}
			}
		};
		
		var purgeAppCache = function () {
			msg("purge application cache for slm",true);
			inProgress();
			log("add " + sop2Globals.sop_purge_cookie_1);
			document.cookie = sop2Globals.sop_purge_cookie_1;
			log("cookies: " + document.cookie);
			lmAppCache.update();
			//$('#iliasOfflineManager').after(lmFrame); // old version
		}
		
		/*********************
		 * sop appcache events
		 *********************/ 
		
		
		var sopAppCacheChecking = function() {
			log("sop appcache on checking...");
		};
		
		/**
		 * sop is already in appcache and the appcache manifest did not changed
		 */ 
		var sopAppCacheNoupdate = function() {
			log("sop appcache on noupdate...");
			showForm();
			outProgress();
		};
		
		var sopAppCacheDownloading = function() {
			log("sop appcache on downloading");
		};
		
		var sopAppCacheProgress = function(evt) {
			log("sop appcache on progress...");
		};
		
		var sopAppCacheCached = function() {
			log("sop appcache on cached...");
			showForm();
			outProgress();
		};
		
		var sopAppCacheUpdateready = function() { //ToDo: prevent multiple progress endings (4x events)
			log("sop appcache on updateready...");
			showForm();
			outProgress();
		};
		
		var sopAppCacheObsolete = function() {
			log("sop appcache on obsolete...");
		};
		
		var sopAppCacheError = function(evt) {
			log("sop appcache on error: " + evt);
			msg(sop_download_failed,true,true);
			outProgress();
		};
		
		
		/*********************
		 * lm appcache events
		 *********************/ 
		var lmAppCacheChecking = function() {
			log("lm appcache on checking...");
		};
		
		var lmAppCacheNoupdate = function() {
			log("lm appcache on noupdate...");
			if (sop2Globals.mode == "online") {
				outProgress();
				loadOfflineMode();
			}
			else {
				if (isPurgeCookieRegEx.test(document.cookie)) { //purge: should not occure
					log("noupdate purge"); // ready
				}
				else { // initial standard 
					log("noupdate initial");
					outProgress();
					_showOfflineForm();
				}
			}
		};
		
		var lmAppCacheDownloading = function() {
			log("lm appcache on downloading");
		};
		
		var lmAppCacheProgress = function(evt) {
			log("lm appcache on progress...");
		};
		
		var lmAppCacheCached = function() {
			log("lm appcache on cached...");
			if (sop2Globals.mode == "online") {
				outProgress();
				loadOfflineMode();
			}
			else { 
				if (isPurgeCookieRegEx.test(document.cookie)) { //purge
					log("oncached purge");
					outProgress();
					loadOnlineMode();
				}
				else { // initial check
					log("oncached initial");
					outProgress();
					_showOfflineForm();
				}
			}
		};
		
		var lmAppCacheUpdateready = function() { //ToDo: prevent multiple progress endings (4x events)
			log("lm appcache on updateready...");
			if (sop2Globals.mode == "online") {
				outProgress();
				lmAppCache.swapCache();
				loadOfflineMode();
			}
			else { 
				if (isPurgeCookieRegEx.test(document.cookie)) { //purge
					log("updateready purge");
					outProgress();
					lmAppCache.swapCache(); // don't think its nessessary because a new site is loaded
					//log("remove purgeCookie");
					//removeCookie("purgeCookie");
					//log("cookies: " + document.cookie);
					log("add " + sop2Globals.sop_purge_cookie_0);
					document.cookie = sop2Globals.sop_purge_cookie_0;
					log("cookies: " + document.cookie);
					loadOnlineMode();
				}
				else {
					log("updateready initial");
					outProgress();
					lmAppCache = document.getElementById('lmAppCacheDownloadFrame').contentWindow.applicationCache;
					lmAppCache.swapCache();
					_showOfflineForm();
				}
			}
		};
		
		var lmAppCacheObsolete = function() {
			log("lm appcache on obsolete...");
		};
		
		var lmAppCacheError = function(evt) {
			log("lm appcache on error: " + evt);
			outProgress();
			msg(sop_lm_download_failed,true);
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
		
		/**
		 * utils
		 */
		
		var transformTrackingData = function (d) {
				var ret = [{
						"init_data":false,
						"resources":false,
						"scorm_tree":false,
						"module_version":1,
						"user_data":null,
						"last_visited":"0",
						"status":1,
						"adlact_data":"null"	
					}];
				ret[0].init_data = JSON.parse(d.lm[4]);
				ret[0].resources = d.lm[5];
				ret[0].scorm_tree = d.lm[6];
				ret[0].last_visited = ret[0].init_data.launchId.toString();
				//log(JSON.stringify(ret[0]));
				return ret;
		};
		
		var removeCookie = function removeCookie(sKey, sPath, sDomain) {
			document.cookie = encodeURIComponent(sKey) + 
			"=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + 
			(sDomain ? "; domain=" + sDomain : "") + 
			(sPath ? "; path=" + sPath : "");
		};

		var log = function(txt) {
			console.log(txt);
		};
		
		var msg = function(txt,flush,reset) {
			flush = typeof flush !== 'undefined' ? flush : false;
			reset = typeof reset !== 'undefined' ? reset : false;
			if (reset) {
				msgs = [txt];
			}
			else {
				msgs.push(txt);
			}
			if (flush) {
				$('#sop2Message').html(msgs.join("<br/>"));
				msgs = [];
			}
		};
		
		var msgShow = function() {
			msg("",true);
		};
		
		var msgReset = function() {
			msg("",true,true);
		}
		
		var msgProgress = function() {
			var m = $('#sop2Progress').text() + " .";
			$('#sop2Progress').text(m);
		}
		
		var msgProgressTimeout = function() {
			$('#sop2Progress').text(sop2Globals.sop_progress_timeout);
		}
		
		var inProgress =  function() {
			progress = true;
			progressTime = 0;
			var funcid = setInterval(inc, progressInterval);
			function inc() {
				if (!progress) {
					clearInterval(funcid);
					return;
				}
				if (progressTime > progressMaxtime) {
					clearInterval(funcid);
					msgProgressTimeout();
					return;
				}
				msgProgress();
				progressTime += progressInterval;
			}
		}
		
		var outProgress = function(keepMsg) {
			progress = false;
			$('#sop2Progress').text("");
			if (!keepMsg) {
				msgReset();
			}
		}
		
		return {
			init 				: init,
			exportLm 			: exportLm,
			startOffline			: startOffline,
			startSom			: startSom,
			pushTracking 			: pushTracking,
			createSopAppCacheEventHandler 	: createSopAppCacheEventHandler,
			createLmAppCacheEventHandler 	: createLmAppCacheEventHandler
		};
	}());
	sop2.init();
});
