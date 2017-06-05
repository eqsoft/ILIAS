var lms = {};
//{"L3d3dy5zaW1wbGUub3JnOjk0NDMvaWxpYXNfbHRpO2xlaWZvc0x0aQ_327":{"client":"L3d3dy5zaW1wbGUub3JnOjk0NDMvaWxpYXNfbHRpO2xlaWZvc0x0aQ","obj_id":327,"title":"SCORM Diagnostic SCO multi 20110926","description":"","scorm_version":"1.2","active":1,"learning_progress_enabled":1,"certificate_enabled":null,"offline_zip_created":null,"max_attempt":null,"package_attempts":5,"first_access":1496481715000,"last_access":1496651913851,"total_time_sec":null,"sco_total_time_sec":0,"status":1,"percentage_completed":0},"L3d3dy5zaW1wbGUub3JnOjk0NDMvaWxpYXNfbHRpO2xlaWZvc0x0aQ_328":{"client":"L3d3dy5zaW1wbGUub3JnOjk0NDMvaWxpYXNfbHRpO2xlaWZvc0x0aQ","obj_id":328,"title":"TitreConsultationEval","description":"","scorm_version":"1.2","active":1,"learning_progress_enabled":1,"certificate_enabled":null,"offline_zip_created":null,"max_attempt":null,"package_attempts":null,"first_access":"","last_access":"","total_time_sec":null,"sco_total_time_sec":0,"status":0,"percentage_completed":0}};

// var dummy_lm = {"client":"XXX","obj_id":000,"title":"XXX","description":"","scorm_version":"1.2","active":1,"learning_progress_enabled":1,"certificate_enabled":null,"offline_zip_created":null,"max_attempt":null,"package_attempts":5,"first_access":1496481715000,"last_access":1496651913851,"total_time_sec":2987,"sco_total_time_sec":345,"status":1,"percentage_completed":0};

var lmstatus = {
	0 : "not_attempted",
	1 : "in_progress",
	2 : "completed",
	3 : "failed"
};

var som;


Number.prototype.toHHMMSS = function () {
	var 	seconds = Math.floor(this),
		hours = Math.floor(seconds / 3600);
		seconds -= hours*3600;
    
	var minutes = Math.floor(seconds / 60);
	seconds -= minutes*60;

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	return hours+':'+minutes+':'+seconds;
}

$( document ).ready( function() {
	som = (function() {
		var _ = function(txt) { // ToDo: language support
			return txt;
		};
		
		var mts = {
				lms : '<div class="accordion-group" id="acgLm"><div class="accordion-heading"><img id="status___#VAR_CRSID__" class="status" src="__#VAR_STATUSICON__" title="__#VAR_STATUSTITLE__"/><a href="#" onclick="som.openLm(this.id);return false" id="__#VAR_CRSID__" class="somCourseTitle" target="_blank">__#VAR_TITLE__</a><button id="lp___#VAR_CRSID__" style="display:__#VAR_SHOWLP__" type="button" class="btn btn-small" data-toggle="collapse" data-target="#__#VAR_CRSDETAILS__"><span>__#LNG_learningprogress__</span>&nbsp;<b class="caret"></b></button><br /><span id="somCourseDescription">__#VAR_DESCRIPTION__</span></div><div id="__#VAR_CRSDETAILS__" class="accordion-body collapse"><div class="accordion-inner" id="aciLm">__#VAR_LM__</div></div></div>',
				lm : '<table><thead></thead><tbody><tr><th>__#LNG_totaltime__</th><td>__#VAR_TOTALTIME__</td></tr><tr><th>__#LNG_attempts__</th><td>__#VAR_ATTEMPTS__</td></tr><tr><th>__#LNG_firstaccess__</th><td>__#VAR_FIRSTACCESS__</td></tr><tr><th>__#LNG_lastaccess__</th><td>__#VAR_LASTACCESS__</td></tr><tr><th>__#LNG_percentagecompleted__</th><td>__#VAR_PERCENTAGECOMPLETED__</td></tr><tr><th>__#LNG_status__</th><td>__#VAR_STATUS__</td></tr></tbody></table>'
			};
		
		var init = function() {
			log("som init");
			
			getLms();
			
				// log(JSON.stringify(lms));
			setTimeout(function(){som.renderAllLm()}, 2000);
			
		};
		
		var getLms = function() {
			log("getLms");
			lms = {};

			var db = new PouchDB('lm',{auto_compaction:true, revs_limit: 1});
			var remoteCouch = false;
			db.allDocs({include_docs: true, descending: true}, function(err, doc) {
				for (var i=0; i<doc.total_rows; i++) {
					// console.log("lmrow"+i+": "+doc.rows[i].doc.title);
					var lm_id = doc.rows[i].doc._id;
					var lm={};
					lm['obj_id'] = lm_id;
					lm['client'] = doc.rows[i].doc.client;
					lm['title'] = doc.rows[i].doc.title;
					lm['description'] = doc.rows[i].doc.description;
					lm['scorm_version'] = doc.rows[i].doc.scorm_version;
					log(JSON.stringify(lm));
					lms[doc.rows[i].doc.client+'_'+lm_id] = lm;
				}
			});
			db.close();

			db = new PouchDB('sahs_user',{auto_compaction:true, revs_limit: 1});
			db.allDocs({include_docs: true, descending: true}, function(err, doc) {
				for (var i=0; i<doc.total_rows; i++) {
					for (var z=0; z<lms.length; z++){
						if (lms[z].client_id == doc.rows[i].doc.client_id && lms[z].obj_id == doc.rows[i].doc.obj_id) {
							lms[z]['first_access'] = doc.rows[i].doc.first_access;
							lms[z]['last_access'] = doc.rows[i].doc.last_access;
							lms[z]['total_time_sec'] = doc.rows[i].doc.total_time_sec;
							lms[z]['sco_total_time_sec'] = doc.rows[i].doc.sco_total_time_sec;
							lms[z]['status'] = doc.rows[i].doc.status;
						}
					}
				}
			});
			db.close();
			
			return true;

		};
		
		var openLm = function(lm) {
			lmtmp = lm.split('_');
			log("openLm: "+lm);
			open("../player/player12.html","client="+JSON.parse(lmtmp[0]+"&obj_id="+lmtmp[1]));
		};
		
		var renderAllLm = function () {
			var str = "";
			var tmp = mts.lms;
			
			for (var _lm in lms) {
				var lm = lms[_lm];
				var id = lm.client + "_" + lm.obj_id; 
				// var id = lm.obj_id;
				
				// var player = (lm.scorm_version == "1.2") ? "player12.html" : "player2004.html"
				// var url = "http://localhost:50012/" + player + "?client=" + lm.client + "&obj_id=" + lm.obj_id;
				
				var stat = (undefined===lm.status || lm.status===null || lm.status == "") ? 0 : lm.status;
				var st = lmstatus[stat];
				var showlp = (lm.learning_progress_enabled == 1) ? "inline" : "none"; 
				//utils.log(JSON.stringify(lm));
				
				//// var link = som.getOfflineUrl(id);
				var link = "sdfsfsdfsdf";
				var data = {
					LINK 		: link,
					CRSID 		: id,
					SHOWLP		: showlp,
					TITLE 		: lm.title,
					DESCRIPTION	: lm.description,
					CRSDETAILS 	: "detail_" + lm.client + "_" + lm.obj_id,
					STATUSICON	: "images/" + st + ".png",
					STATUSTITLE	: st
				}
				str += getTemplateContent(tmp,data);
				str = renderLm(id,str);
			}
			
			if (str == "") {
				str = _("no_data");
			}
			$('#acLm').html(str);
		};
		
		var renderLm = function renderLm(id,str=false) {
			
			var lm = lms[id];
			var tmp = mts.lm;
			var time = secondsToTime(lm.sco_total_time_sec);
			var attempts = (lm.status == 0) ? "" : lm.package_attempts;
			var firstaccess = lm.first_access;
			var lastaccess =  lm.last_access;
			if (typeof firstaccess == "number") {
				var dl = new Date(firstaccess);
				firstaccess = dl.toLocaleString(); // ToDo: Safari Compat
			}
			if (typeof lastaccess == "number") {
				var dl = new Date(lastaccess);
				lastaccess = dl.toLocaleString(); // ToDo: Safari Compat
			}
			
			var status = _(lmstatus[lm.status]);
			var data = {
				TOTALTIME 			: time + " (hh:mm:ss)",
				ATTEMPTS			: attempts,
				FIRSTACCESS			: firstaccess,
				LASTACCESS			: lastaccess,
				PERCENTAGECOMPLETED		: lm.percentage_completed+"%",
				STATUS				: status
			};
			tmp = getTemplateContent(tmp,data);
			if (str) { // comming from renderAllLm
				data = { LM : tmp };
				return getTemplateContent(str,data);
			}
			else {
				try {
					$("#aciLm").html(tmp);
				}
				catch(e) {
					log(e);
				}
			}
		};
		
		// utils
		var getTemplateContent = function (str,data) {
			return str.replace(/__\#VAR_([a-zA-Z]+)__/g, function(a,b){return(undefined===data[b])?a:data[b]}).replace(/__\#LNG_([a-zA-Z]+)__/g,function(a,b){return _(b);});
		};
		
		var log = function(txt) {
			console.log(txt);
		};
		
		var secondsToTime = function (seconds) {
			return parseInt(seconds).toHHMMSS();
		};
		
		var toLocaleStringSupportsOptions = function () {
			return !!(typeof Intl == 'object' && Intl && typeof Intl.NumberFormat == 'function');
		};
		
		return {
			init : init,
			openLm : openLm,
			renderAllLm : renderAllLm,
			log : log
		};
	}());
	som.init();
});
