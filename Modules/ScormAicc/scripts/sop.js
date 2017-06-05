/**
 * script for managing the export and import from within ILIAS
 */ 

var sop;

$( document ).ready( function() {
	sop = (function() {
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
		 * init sop
		 */ 
		var init = function () {
			log("sop: init");
			msgs = [];
			progress = false;
			iliasPhp = document.URL.substring(0,document.URL.indexOf('?'));
			webroot = iliasPhp.replace(/ilias.php/,"");
			lmCmdUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&ref_id='+sopGlobals.refId+'&client_id='+sopGlobals.ilClient+'&cmd=';
			sopCmdUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&client_id='+sopGlobals.ilClient+'&cmd=offlineMode_sop';
			sopFrame = '<iframe id="sopAppCacheDownloadFrame" src="' + sopCmdUrl + '" onload="sop.createSopAppCacheEventHandler(this);"></iframe>';
			lmFrame = '<iframe id="lmAppCacheDownloadFrame" src="' + lmCmdUrl + 'offlineMode_il2sop" onload="parent.sop.createLmAppCacheEventHandler(this);"></iframe>';
			trackingUrl = iliasPhp+'?baseClass=ilSAHSPresentationGUI&client_id='+sopGlobals.ilClient+'&cmd=offlineMode_tracking2sop&ref_id='+sopGlobals.refId;
			sopOfflineUrl = webroot + "Modules/ScormAicc/sop/player/player12.html";
			somOfflineUrl = webroot + "Modules/ScormAicc/sop/manager/som.html";
			$('#onlineForm').hide();
			$('#offlineForm').hide();
			isPurgeCookieRegEx = new RegExp(sopGlobals.sop_purge_cookie_1);
			document.cookie = sopGlobals.sop_purge_cookie_0;
			checkSystem();
		};
		
		/**
		 * checks HTML5 features and sop is already in appcache
		 */ 
		var checkSystem = function() {
			log("sop: checkSystem");
			msg(sopGlobals.sop_check_system_requirements,true,true);
			if (typeof window.applicationCache !== 'object') {
				msg(sopGlobals.sop_system_check_error,true);
			}
			inProgress();
			$('#iliasOfflineManager').after(sopFrame); // catch the appcache events
		};
		
		var showForm = function() {
			log("show form: " + sopGlobals.mode);
			switch (sopGlobals.mode) {
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
				location.replace(lmCmdUrl+"offlineMode_sop2ilOk");
			}, 2000);
		};
		
		var loadOfflineMode = function () {
			window.setTimeout(function() {
				location.replace(lmCmdUrl+"offlineMode_il2sopOk");
			}, 2000);
		};
		
		var exportLm = function () {
			log("sop: exportLm");
			inProgress();
			$.getJSON( trackingUrl, function( data ) { // trigger trackingdata
				if (typeof data == 'object') {
					//var d = JSON.stringify(data);
					//log(d);
					//log(JSON.stringify(data));
					// var ok = tracking2sop(data);

					if (tracking2sop(data) != false) {
					
						localStorage.setItem(sopGlobals.lmId, JSON.stringify(transformTrackingData(data)));
						$('#iliasOfflineManager').after(lmFrame); // trigger appcache download
					}
				}
				else {
					log('fetching trackingdata failed!');
					outProgress();
				}
			});
		};
		
		var startOffline = function () {
			log("startOffline: " +sopOfflineUrl);
			open(sopOfflineUrl,"client="+sopGlobals.ilClient+"&obj_id="+sopGlobals.lmId);
		};
		
		var startSom = function () {
			log("startSom");
			open(somOfflineUrl,"client="+sopGlobals.ilClient);
		};
		
		var pushTracking = function () {
			log("sop: pushTracking");
			msg("push tracking data", true);
			var purgeCache = $('#chkPurgeCache').is(':checked');
			inProgress();
			var timer = 0;
			var dummyInterval = setInterval(dummy,1000);
			function dummy() {
				timer += 1000;
				if (timer > 3000) {
					clearInterval(dummyInterval);
					localStorage.removeItem(sopGlobals.lmId);
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
			log("add " + sopGlobals.sop_purge_cookie_1);
			document.cookie = sopGlobals.sop_purge_cookie_1;
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
			msg("sop appcache on error: ",true,true);
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
			if (sopGlobals.mode == "online") {
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
			if (sopGlobals.mode == "online") {
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
			if (sopGlobals.mode == "online") {
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
					log("add " + sopGlobals.sop_purge_cookie_0);
					document.cookie = sopGlobals.sop_purge_cookie_0;
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
			msg("lm appcache on error: ",true,true);
		};
		
		var createSopAppCacheEventHandler = function(iframe) {
			log("sop: createSopAppCacheEventHandler: " + iframe);
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
			log("sop: createLmAppCacheEventHandler: " + iframe);
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
		var removeTrackingData = function () {
			var db = new PouchDB('lm',{auto_compaction:true, revs_limit: 1});
			var remoteCouch = false;
			var id = ""+sopGlobals.ilClient+'_'+sopGlobals.lmId;
			db.bulkDocs([{_id: id, _deleted:true}]).then(function (result) {
				console.log('Successfully deleted a lm!');
				db.close();
				return true;
			}).catch(function (err) {
				console.log(err);
				db.close();
				return false;
			});
		}
		
		var tracking2sop = function(d) {
			
			var usrid = d.user_data[6];

			var tracking2sopclient = function(client_data) {
				var db = new PouchDB('client_data',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				db.bulkDocs([{
					_id: sopGlobals.ilClient,
					support_mail: client_data[0]
				}]).then(function (result) {
					console.log('Successfully posted to client_data!');
					db.close();
					return true;
				}).catch(function (err) {
					console.log(err);
					db.close();
					return false;
				});
			}

			var tracking2sopuser = function(user_data) {
				var db = new PouchDB('user_data',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				db.bulkDocs([{
					_id: ""+sopGlobals.ilClient+user_data[6],
					client: sopGlobals.ilClient,
					user_id: user_data[6],
					login: user_data[0],
					passwd: "",
					firstname: user_data[2],
					lastname: user_data[3],
					title: user_data[4],
					gender: user_data[5]
				}]).then(function (result) {
					console.log('Successfully posted to user_data!');
					db.close();
					return true;
				}).catch(function (err) {
					console.log(err);
					db.close();
					return false;
				});
			}

			var tracking2soplm = function(lm) {
				var db = new PouchDB('lm',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				var id = ""+sopGlobals.ilClient+'_'+sopGlobals.lmId;
				db.bulkDocs([{
					_id: id,
					client: sopGlobals.ilClient,
					obj_id: sopGlobals.lmId,
					title: lm[0],
					description: lm[1],
					scorm_version: ""+lm[2],
					active: lm[3],
					init_data: JSON.parse(lm[4]),
					resources: lm[5],
					scorm_tree: lm[6],
					last_visited: (JSON.parse(lm[4])).launchId.toString(),
					module_version: lm[7],
					offline_zip_created: lm[8],
					learning_progress_enabled: lm[9],
					certificate_enabled: lm[10],
					max_attempt: 0,
					adlact_data: "null",
					ilias_version: lm[13]
				}]).then(function (result) {
					console.log('Successfully posted to lm!');
					db.close();
					return true;
				}).catch(function (err) {
					console.log(err);
					db.close();
					return false;
				});
			}
			
			var tracking2sopsahs = function(sahs_user) {
				var db = new PouchDB('sahs_user',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				var id = ""+sopGlobals.ilClient+'_'+sopGlobals.lmId+'_'+usrid;
				db.bulkDocs([{
					_id: id,
					client: sopGlobals.ilClient,
					obj_id: sopGlobals.lmId,
					user_id: usrid,
					package_attempts: sahs_user[0],
					module_version: sahs_user[1],
					last_visited: sahs_user[2],
					first_access: sahs_user[3],
					last_access: sahs_user[4],
					last_status_change: "",
					total_time_sec: sahs_user[5],
					sco_total_time_sec: sahs_user[6],
					status: sahs_user[7],
					percentage_completed: sahs_user[8],
					user_data: ""
				}]).then(function (result) {
					console.log('Successfully posted to sahs_user!');
					db.close();
					return true;
				}).catch(function (err) {
					console.log(err);
					db.close();
					return false;
				});
			}
			//cmi

			var tracking2sopcmi = function(cmi) {
				var db = new PouchDB(
					'scorm_tracking_'+sopGlobals.ilClient+'_'+sopGlobals.lmId+'_'+usrid,
					{auto_compaction:true, revs_limit: 1}
				);
				var remoteCouch = false;
				dat = [];
				for (var i=0; i<cmi.length; i++) {
					dat[i]={_id: cmi[i][0]+'_'+cmi[i][1], rvalue: cmi[i][2]};
				}
				db.bulkDocs(dat).then(function (result) {
					console.log('Successfully posted to scorm_tracking!');
					db.close();
					return true;
				}).catch(function (err) {
					console.log(err);
					db.close();
					return false;
				});
				
			}

			if (removeTrackingData() != false) {
				if (tracking2sopclient(d.client_data) != false) {
					if (tracking2sopuser(d.user_data) != false) {
						if (tracking2soplm(d.lm) != false) {
							if (tracking2sopsahs(d.sahs_user) != false) {
								return tracking2sopcmi(d.cmi);
							}
						}
					}
				}
			}
			// return tracking2soplm(d.lm);
			// var ok=removeTrackingData();
			// var ok=false;
		
			// var db = new PouchDB('lm',{auto_compaction:true, revs_limit: 1});
			// var remoteCouch = false;
			// var id = ""+sopGlobals.ilClient+'_'+sopGlobals.lmId;

			// var lm = {
				// _id: id,
				// client: sopGlobals.ilClient,
				// obj_id: sopGlobals.lmId,
				// title: d.lm[0],
				// description: d.lm[1],
				// scorm_version: ""+d.lm[2],
				// active: d.lm[3],
				// init_data: JSON.parse(d.lm[4]),
				// resources: d.lm[5],
				// scorm_tree: d.lm[6],
				// last_visited: (JSON.parse(d.lm[4])).launchId.toString(),
				// module_version: d.lm[7],
				// offline_zip_created: d.lm[8],
				// learning_progress_enabled: d.lm[9],
				// certificate_enabled: d.lm[10],
				// max_attempt: 0,
				// adlact_data: "null",
				// ilias_version: d.lm[13]
			// };
			// db.bulkDocs([lm]).then(function (result) {
				// console.log('Successfully posted a lm!');
				// db.close();
				// return true;
			// }).catch(function (err) {
				// console.log(err);
				// db.close();
				// return false;
			// });
			
			// return ok;
		}


		
		var transformTrackingData = function (d) {
				var ret = [{
						"init_data":false,
						"resources":false,
						"scorm_tree":false,
						"module_version":1,
						"user_data":null,
						"last_visited":"0",
						"title" : "",
						"status":1,
						"adlact_data":"null"	
					}];
				ret[0].init_data = JSON.parse(d.lm[4]);
				ret[0].resources = d.lm[5];
				ret[0].scorm_tree = d.lm[6];
				ret[0].last_visited = ret[0].init_data.launchId.toString();
				ret[0].title = d.lm[0];
				ret[0].client = sopGlobals.ilClient;
				
				return ret;
					
				// try {
					// var response = await db.put(lm);
					// log('Successfully posted a lm!');
					// return ret;
				// } catch (err) {
					// log('NOT successfully posted a lm!');
					// log(JSON.stringify(ret[0]));
				// }
				// db.get(id).then(function(doc){
					// lm._rev = doc._rev;
				// });

				// db.put(lm,{_deleted: true}).then(function (response) { //,{_deleted: true}
					// console.log('Successfully posted a lm!');
					// db.close();
					// return ret;
				// }).catch(function (err) {
						// console.log(err);
						// db.close();
						// return false;
				// });
				// db.bulkDocs([lm]).then(function (result) {
					// console.log('Successfully posted a lm!');
					// ok=ret;
				// }).catch(function (err) {
					// console.log(err);
					// db.close();
					// ok = false;
				// });
				// db.close();
				
				// return ok;
				
				

				// log(JSON.stringify(ret[0]));
				// return ret;
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
				$('#sopMessage').html(msgs.join("<br/>"));
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
			var m = $('#sopProgress').text() + " .";
			$('#sopProgress').text(m);
		}
		
		var msgProgressTimeout = function() {
			$('#sopProgress').text(sopGlobals.sop_progress_timeout);
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
			$('#sopProgress').text("");
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
	sop.init();
});
