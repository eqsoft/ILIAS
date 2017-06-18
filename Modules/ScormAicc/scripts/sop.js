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
					if (tracking2sop(data) != false) {
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
			if (sop2il() != false) {
				var timer = 0;
				var dummyInterval = setInterval(dummy,1000);
			} else {
				//Fehlermeldung
				outProgress();
			}
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
		var removeTable = function(table) {
			var db = new PouchDB(table);
			db.destroy().then(function(response){
				console.log("destroyed: "+table);
				return true;
			}).catch(function(err){
				log(err);
				// db.close();
				return false;
			});
		}
		
		var removeAllTables = function() {
			//except scorm_tracking
			removeTable('client_data');
			removeTable('user_data');
			removeTable('lm');
			removeTable('sahs_user');
		}
		var removeTrackingData = function () {
		
			var removerow = function(table,id,rev) {
				var db = new PouchDB(table,{auto_compaction:true, revs_limit: 1});
				db.bulkDocs([{_id: id, _rev: rev, _deleted:true}]).then(function (result) {
					console.log('Successfully deleted a row in table '+table);
					db.close();
					return true;
				}).catch(function (err) {
					console.log('Issue deleting a row with _id='+id+' in table '+table+': '+err);
					db.close();
					return false;
				});
			}

			// if (removerow('user_data','isam6','1-3a953f9a87dc7baf617a0a3da69252d7') != false) {
				// return true;
			// }
		}
		
		var data2console = function() {

			var remoteCouch = false;
			var db = new PouchDB('client_data',{auto_compaction:true, revs_limit: 1});
			db.allDocs({include_docs: true, descending: true}).then(function(result){
				console.log('client_data'+': '+JSON.stringify(result));
			}).catch(function (err) {
				console.log(err);
			});

			db = new PouchDB('user_data',{auto_compaction:true, revs_limit: 1});
			db.allDocs({include_docs: true, descending: true}).then(function(result){
				console.log('user_data'+': '+JSON.stringify(result));
			}).catch(function (err) {
				console.log(err);
			});

			db = new PouchDB('lm',{auto_compaction:true, revs_limit: 1});
			db.allDocs({include_docs: true, descending: true}).then(function(result){
				console.log('lm'+': '+JSON.stringify(result));
			}).catch(function (err) {
				console.log(err);
			});

			db = new PouchDB('sahs_user',{auto_compaction:true, revs_limit: 1});
			db.allDocs({include_docs: true, descending: true}).then(function(result){
				console.log('sahs_user'+': '+JSON.stringify(result));
			}).catch(function (err) {
				console.log(err);
			});

			var dbname = 'scorm_tracking_'+sopGlobals.ilClient+'_'+sopGlobals.lmId;
			db = new PouchDB(dbname,{auto_compaction:true, revs_limit: 1});
			db.allDocs({include_docs: true, descending: true}).then(function(result){
				console.log(dbname+': '+JSON.stringify(result));
			}).catch(function (err) {
				console.log(err);
			});
			db.close();
		}
		
		var sop2il = function() {
			
			var remoteCouch = false;
			var cmi = [];
			var db = new PouchDB('sahs_user');
			db.get(sopGlobals.ilClient+'_'+sopGlobals.lmId).then(function(res){
				var o_data={
					"cmi":[],
					"saved_global_status":0,//iv.status.saved_global_status,aus init_data
					"now_global_status":res.status,
					"percentageCompleted":res.percentage_completed,
					// "lp_mode":6,
					"hash":"",
					"p":res.user_id,
					"totalTimeCentisec":(res.sco_total_time_sec*100)
				};
				db = new PouchDB('scorm_tracking_'+sopGlobals.ilClient+'_'+sopGlobals.lmId);
				db.allDocs({include_docs: true, descending: true}).then(function(result){
					for (var i=0; i<result.total_rows; i++) {
						var left = result.rows[i].doc._id;
						var ileft = left.indexOf('_');
						cmi[i] = [ left.substr(0,ileft) , left.substr(ileft+1) , result.rows[i].doc.rvalue ];
					}
					o_data.cmi = cmi;
					// console.log('o_data: '+JSON.stringify(o_data));
					s_s=toJSONString(o_data);
					sendRequest ("./Modules/ScormAicc/sahs_server.php?cmd=storeJsApi&package_id="+sopGlobals.lmId+"&ref_id="+sopGlobals.refId, s_s);
					db.close();
					return true;
				});
			}).catch(function (err) {
				db.close();
				console.log(err);
				return false;
			});
		}
		
		var tracking2sop = function(d) {
			
			var usrid = d.user_data[6];

			var tracking2sopclient = function(client_data) {
				var db = new PouchDB('client_data',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				var id = sopGlobals.ilClient;

				db.get(id).then(function(doc){
					db.remove(doc._id, doc._rev);
				}).then(function (result) {
					insertrow();
				}).catch(function (err) {
					// log("new entry");
					insertrow();
				});

				var insertrow = function(){
					db.put({
						_id: id,
						support_mail: client_data[0]
					}).then(function (result) {
						console.log('Successfully posted to client_data!');
						db.close();
						return true;
					}).catch(function (err) {
						console.log(err);
						db.close();
						return false;
					});
				}
			}

			var tracking2sopuser = function(user_data) {
				var db = new PouchDB('user_data',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				var id = ""+sopGlobals.ilClient;//'+_'+user_data[6];

				db.get(id).then(function(doc){
					db.remove(doc._id, doc._rev);
				}).then(function (result) {
					insertrow();
				}).catch(function (err) {
					// log("new entry");
					insertrow();
				});

				var insertrow = function(){
					db.put({
						_id: id,
						client: sopGlobals.ilClient,
						user_id: user_data[6],
						login: user_data[0],
						passwd: "",
						firstname: user_data[2],
						lastname: user_data[3],
						title: user_data[4],
						gender: user_data[5]
					}).then(function (result) {
						console.log('Successfully posted to user_data!');
						db.close();
						return true;
					}).catch(function (err) {
						console.log(err);
						db.close();
						return false;
					});
				}
			}

			var tracking2soplm = function(lm) {
				var db = new PouchDB('lm',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				var id = ""+sopGlobals.ilClient+'_'+sopGlobals.lmId;

				db.get(id).then(function(doc){
					db.remove(doc._id, doc._rev);
				}).then(function (result) {
					insertrow();
				}).catch(function (err) {
					// log("new entry");
					insertrow();
				});

				var insertrow = function(){
					db.put({
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
					}).then(function (result) {
						console.log('Successfully posted to lm!');
						db.close();
						return true;
					}).catch(function (err) {
						console.log(err);
						db.close();
						return false;
					});
				}
			}
			
			var tracking2sopsahs = function(sahs_user) {
				var db = new PouchDB('sahs_user',{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;
				var id = ""+sopGlobals.ilClient+'_'+sopGlobals.lmId;//+'_'+usrid;
				toInsert = {
					_id: id,
					client: sopGlobals.ilClient,
					obj_id: sopGlobals.lmId,
					user_id: usrid,
					package_attempts: sahs_user[0],
					module_version: sahs_user[1],
					last_visited: sahs_user[2],
					first_access: sahs_user[3],
					last_access: sahs_user[4],
					last_status_change: sahs_user[5],
					total_time_sec: sahs_user[6],
					sco_total_time_sec: sahs_user[7],
					status: sahs_user[8],
					percentage_completed: sahs_user[9],
					user_data: ""
				};
				
				db.get(id).then(function(doc){
					db.remove(doc._id, doc._rev);
				}).then(function (result) {
					insertrow();
				}).catch(function (err) {
					log("new entry");
					insertrow();
				});
				
				var insertrow = function(){
					db.put(toInsert).then(function (result) {
						console.log('Successfully put to sahs_user! '+sahs_user+' sco_total_time_sec: '+sahs_user[7]+' ; status: '+sahs_user[8]);
						db.close();
						return true;
					}).catch(function (err) {
						console.log(err);
						db.close();
						return false;
					});
				}
			}

			var tracking2sopcmi = function(cmi) {
				var dbname = 'scorm_tracking_'+sopGlobals.ilClient+'_'+sopGlobals.lmId;
				var db = new PouchDB(dbname,{auto_compaction:true, revs_limit: 1});
				var remoteCouch = false;

				var dat = [];
				for (var i=0; i<cmi.length; i++) {
					dat[i]={_id: cmi[i][0]+'_'+cmi[i][1], rvalue: cmi[i][2]}; //id=sco_id+lvalue
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

			if (removeTable('scorm_tracking_'+sopGlobals.ilClient+'_'+sopGlobals.lmId) != false) {
				if (tracking2sopclient(d.client_data) != false) {
					if (tracking2sopuser(d.user_data) != false) {
						if (tracking2soplm(d.lm) != false) {
							if (tracking2sopsahs(d.sahs_user) != false) {
								if(tracking2sopcmi(d.cmi) != false) {
									return true;
								} else {
									return false;
								}
							}
						}
					}
				}
			}
		}


		
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

/* XMLHHTP functions */
function sendRequest (url, data, callback, user, password, headers) {		

	function sendAndLoad(url, data, callback, user, password, headers) {
		function createHttpRequest() {
			try 
			{
				return window.XMLHttpRequest 
					? new window.XMLHttpRequest()
					: new window.ActiveXObject('MSXML2.XMLHTTP');
			} 
			catch (e) 
			{
				throw new Error('cannot create XMLHttpRequest');
			}
		}
		function HttpResponse(xhttp) 
		{
			this.status = Number(xhttp.status);
			this.content = String(xhttp.responseText);
			this.type = String(xhttp.getResponseHeader('Content-Type'));
		}
		function onStateChange() 
		{
			if (xhttp.readyState === 4) { // COMPLETED
				if (typeof callback === 'function') {
					callback(new HttpResponse(xhttp));
				} else {
					return new HttpResponse(xhttp);
				} 
			}
		}		
		var xhttp = createHttpRequest();
		var async = !!callback;
		var post = !!data; 
		xhttp.open(post ? 'POST' : 'GET', url, async, user, password);
		if (typeof headers !== 'object') 
		{
			headers = new Object();
		}
		if (post) 
		{
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}
		if (headers && headers instanceof Object) 
		{
			for (var k in headers) {
				xhttp.setRequestHeader(k, headers[k]);
			}
		}
		if (async) 
		{
			xhttp.onreadystatechange = onStateChange;
//				xhttp.send(data ? String(data) : '');				
			xhttp.send(data);				
		} else 
		{
			xhttp.send(data ? String(data) : '');				
			return onStateChange();
		}
	}

	if (typeof headers !== "object") {headers = {};}
	headers['Accept'] = 'text/javascript';
	headers['Accept-Charset'] = 'UTF-8';
	var r = sendAndLoad(url, data, callback, user, password, headers);
	
	if (r.content) {
		if (r.content.indexOf("login.php")>-1) {
			window.location.href = "./Modules/Scorm2004/templates/default/session_timeout.html";
		}
	}
	
	if ((r.status===200 && (/^text\/javascript;?.*/i).test(r.type)) || r.status===0)
	{
		return r.content;
	}
	else
	{
		return r.content;
	}
}

function toJSONString (v, tab) {
	tab = tab ? tab : "";
	var nl = tab ? "\n" : "";
	function fmt(n) {
		return (n < 10 ? '0' : '') + n;
	}
	function esc(s) {
		var c = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'};
		return '"' + s.replace(/[\x00-\x1f\\"]/g, function (m) {
			var r = c[m];
			if (r) {
				return r;
			} else {
				r = m.charAt(0);
				return "\\u00" + (r < 16 ? '0' : '') + r.toString(16);
			}
		}) + '"';
	}
	switch (typeof v) {
	case 'string':
		return esc(v);
	case 'number':
		return isFinite(v) ? String(v) : 'null';
	case 'boolean':
		return String(v);
	case 'object':
		if (v===null) {
			return 'null';
		} else if (v instanceof Date) {
			return '"' + v.getValue(v) + '"'; // msec not ISO
		} else if (v instanceof Array) {
			var ra = new Array();
			for (var i=0, ni=v.length; i<ni; i+=1) {
				ra.push(v[i]===undefined ? 'null' : toJSONString(v[i], tab.charAt(0) + tab));
			}
			return '[' + nl + tab + ra.join(',' + nl + tab) + nl + tab + ']';
		} else {
			var ro = new Array();
			for (var k in v) {	
				if (v.hasOwnProperty && v.hasOwnProperty(k)) {
					ro.push(esc(String(k)) + ':' + toJSONString(v[k], tab.charAt(0) + tab));
				}
			}
			return '{' + nl + tab + ro.join(',' + nl + tab) + nl + tab + '}';
		}
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
