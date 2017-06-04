<?php
/* Copyright (c) 1998-2011 ILIAS open source, Extended GPL, see docs/LICENSE */
//require_once "./Services/Object/classes/class.ilObject.php";

/**
* Class ilSCORMOfflineMode
*
* Class for scorm offline player connection
*
* @author Stefan Schneider <schneider@hrz.uni-marburg.de>
* @version $Id: class.ilSCORMOfflineMode.php  $
*
* @ingroup ModulesScormAicc
*/
class ilSCORMOfflineMode
{
	var $type;
	var $obj_id;
	var $offlineMode;
	var $sop_dir;
	var $sop_index;
	var $sop_appcache;
	var $lm_dir;
	var $lm_index;
	var $lm_appcache;
	var $lm_imsmanifest_xml;
	var $imsmanifest;
	
	/**
	* Constructor
	*
	* @param	int		$a_id		Object ID
	* @access	public
	*/
	function __construct()
	{
		global $ilias;
		$this->ilias =& $ilias;
		$this->id = $_GET['ref_id'];
		$this->obj_id = ilObject::_lookupObjectId($_GET['ref_id']);
		include_once "./Modules/ScormAicc/classes/class.ilObjSAHSLearningModule.php";
		$this->type = ilObjSAHSLearningModule::_lookupSubType($this->obj_id);
		$this->offlineMode = 'online';
		$this->sop_index = './Modules/ScormAicc/sop/sop_index.html';
		$this->sop_appcache = './Modules/ScormAicc/sop/sop.appcache';
		$this->sop_dir = './Modules/ScormAicc/sop/';
		$this->read();
	}
	
	private function read() {
		global $ilDB, $ilUser, $log;
		$res = $ilDB->queryF('SELECT offline_mode FROM sahs_user WHERE obj_id=%s AND user_id=%s',
			array('integer','integer'),
			array($this->obj_id,$ilUser->getId())
		);
		while($row = $ilDB->fetchAssoc($res))
		{
			if ($row['offline_mode'] != null && $row['offline_mode'] != '') {
				$this->offlineMode = $row['offline_mode'];
			} else {
				$this->offlineMode = "online";
			}
		}
	}
	
	//offlineMode: offline, online, il2sop, sop2il
	function setOfflineMode($a_mode) {
		global $ilDB,$ilUser;
		$res = $ilDB->queryF('UPDATE sahs_user SET offline_mode=%s WHERE obj_id=%s AND user_id=%s',
			array('text','integer','integer'),
			array($a_mode, $this->obj_id,$ilUser->getId())
		);
		$this->offlineMode=$a_mode;
	}
	
	function getOfflineMode() {
		return $this->offlineMode;
	}
	
	function createSopIndexFileIfNotExists() {
		global $log;
		$log->write("createSopIndexFileIfNotExists");
		if (file_exists($this->sop_index)) {
			return true;
		}
		//?baseClass=ilSAHSPresentationGUI&client_id=forkSopHtml5&cmd=offlineMode_manifest
		$appcache_url = './ilias.php?baseClass=ilSAHSPresentationGUI&client_id='.CLIENT_ID.'&cmd=offlineMode_manifest';
		// ToDo: template file?
		$index_string = '<html manifest="' . $appcache_url . '"><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><title>sop_index.html</title></head><body></body></html>'; 
		$index_file = fopen($this->sop_index, "w");
		if (!$index_file) {
			$log->write("Unable to open file!");
			return false;
		}
		fwrite($index_file,$index_string);
		fclose($index_file);
		return true;
	}
	
	function createSopManifestFileIfNotExists() {
		global $log;
		$log->write("createSopManifestFileIfNotExists");
		if (file_exists($this->sop_appcache)) {
			return true;
		}
		$manifest_string = "CACHE MANIFEST\n\nCACHE:\n";
		$manifest_file = fopen($this->sop_appcache,'w');
		if (!$manifest_file) {
			$log->write("Unable to open file!");
			return false;
		}
		$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($this->sop_dir));
		foreach($objects as $name => $object) {
			
			if (preg_match('/\/\.+/',$name)) {
				continue;
			}
			
			if (preg_match('/sop\.appcache/',$name)) {
				continue;
			}
			
			if (preg_match('/sop_index\.html/',$name)) {
				continue;
			}
			//$manifest_string .= preg_replace('/^\./','./Modules/ScormAicc',$name) . "\n"; // for cli
			$manifest_string .= $name . "\n";
		}
		$manifest_string .= "\nNETWORK:\n*\n";
		$manifest_string .= "\n#".date("Y-m-d H:i:s");
		fwrite($manifest_file, $manifest_string);
		fclose($manifest_file);
		return true;
	}
	
	
	function getPurgeIndexHtml() { // Quick and dirty. obsolet?
		global $log;
		$log->write("getPurgeIndexHtml");
		return str_replace("cmd=offlineMode_appcache","offlineMode_purgeCache",file_get_contents(ilUtil::getWebspaceDir("filesystem").'/lm_data/lm_'.$this->lmId.'/sop_index.html'));
	}
	 
	
	function createLmManifestFileIfNotExists() {
		global $log;
		$log->write("createManifestFileIfNotExists");
		$this->lm_dir = ilUtil::getWebspaceDir("filesystem").'/lm_data/lm_'.$this->obj_id;
		if (!file_exists($this->lm_dir)) {
			$log->write("could not find " . $this->lm_dir);
			return false;
		}
		$this->lm_index = $this->lm_dir.'/lm_index.html';
		$this->lm_appcache = $this->lm_dir.'/lm.appcache';
		if (file_exists($this->lm_index) && file_exists($this->lm_appcache)) {
			$log->write("sop_index.html and sop.appcache already exists, nothing to do.");
			return true;
		}
		$this->lm_imsmanifest_xml = $this->lm_dir.'/imsmanifest.xml';
		if (!file_exists($this->lm_imsmanifest_xml)) {
			$log->write("could not find " . $this->lm_imsmanifest_xml);
			return false;
		}
		// create both offline files
		
		// appcache manifest
		$this->imsmanifest = new DOMDocument();
		if (!$this->imsmanifest->load($this->lm_imsmanifest_xml)) {
			$log->write("could not load " . $this->lm_imsmanifest_xml);
			return false;
		}
		$xpath = new DOMXpath($this->imsmanifest);
		$hrefs = $xpath->query("//*[@href]/@href");
		//$index_url =    ILIAS_HTTP_PATH . '/ilias.php?baseClass=ilSAHSPresentationGUI&ref_id='.$_GET["ref_id"].'&client_id='.CLIENT_ID.'&cmd=offlineMode_il2sop'; 
		//$appcache_url = ILIAS_HTTP_PATH . '/ilias.php?baseClass=ilSAHSPresentationGUI&ref_id='.$_GET["ref_id"].'&client_id='.CLIENT_ID.'&cmd=offlineMode_appcache';
		//$index_url = './ilias.php?baseClass=ilSAHSPresentationGUI&ref_id='.$_GET["ref_id"].'&client_id='.CLIENT_ID.'&cmd=offlineMode_il2sop'; 
		$appcache_url = './ilias.php?baseClass=ilSAHSPresentationGUI&ref_id='.$_GET["ref_id"].'&client_id='.CLIENT_ID.'&cmd=offlineMode_appcache';
		
		if (!is_null($hrefs) && !file_exists($this->lm_appcache)) {
			$manifest_file = fopen($this->lm_appcache, "w");
			if (!$manifest_file) {
				$log->write("Unable to open file!");
				return false;
			}
			$manifest_string = "CACHE MANIFEST\n\nCACHE:\n";
			
			$href_array = array(); // for checking double entries
			foreach ($hrefs as $href) {
				// check if exists
				$url = $this->lm_dir.'/'.$href->nodeValue;
				if (in_array($url,$href_array)) {
					continue;
				}
				if (!file_exists($url)) {
					$log->write("WARNING: could not find url: " . $url);
					continue;
				}
				
				$href_array[] = $url;
				// manifest will be delivered dynamically from an ilias.php?... call, so the relative pathes must begin from webroot
				$manifest_string .= './data/'.CLIENT_ID.'/lm_data/lm_'.$this->obj_id.'/'.$href->nodeValue."\n";
				//$log->write($href->nodeValue);
			}
			$manifest_string .= "\nNETWORK:\n*\n";
			$manifest_string .= "\n#".date("Y-m-d H:i:s");
			fwrite($manifest_file, $manifest_string);
			fclose($manifest_file);
		}
		
		//sop_index.html
		if (file_exists($this->lm_index)) {
			$log->write("sop_index.html already exists.");
			return true;
		}
		// ToDo: template file?
		$index_string = '<html manifest="' . $appcache_url . '"><head><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"><title>lm_index.html</title></head><body></body></html>'; 
		$index_file = fopen($this->lm_index, "w");
		if (!$index_file) {
			$log->write("Unable to open file!");
			return false;
		}
		fwrite($index_file,$index_string);
		fclose($index_file);
		
		//$log->write(var_export($hrefs,TRUE));
		//$log->write($this->lm_dir);
		
		return true;
	}
	
	function getClientIdSop() {
		$iliasDomain = substr(ILIAS_HTTP_PATH,7);
		if (substr($iliasDomain,0,1) == "\/") $iliasDomain = substr($iliasDomain,1);
		if (substr($iliasDomain,0,4) == "www.") $iliasDomain = substr($iliasDomain,4);
		return $iliasDomain.';'.CLIENT_ID;
	}
	
	function tracking2sop() {
		global $ilUser, $ilias;
		//$this->setOfflineMode("il2sop");
		header('Content-Type: text/javascript; charset=UTF-8');

		include_once "./Modules/ScormAicc/classes/class.ilObjSAHSLearningModule.php";
		$ob = new ilObjSAHSLearningModule($this->id);
		$module_version = $ob->getModuleVersion();
		$sahs_user = $this->il2sopSahsUser();
		$support_mail = "";//TODO
		$scorm_version = "1.2";
		if ($this->type == "scorm2004") $scorm_version = "2004";
		$tree="";
		
		$learning_progress_enabled = 1;
		include_once './Services/Object/classes/class.ilObjectLP.php';
		$olp = ilObjectLP::getInstance($this->obj_id);
		if ($olp->getCurrentMode() == 0) $learning_progress_enabled = 0;
		
		$certificate_enabled = 0;

		$adlact_data = null;
		$ilias_version = $ilias->getSetting("ilias_version");

		if ($this->type == 'scorm2004') {
			include_once "./Modules/Scorm2004/classes/ilSCORM13Player.php";
			$ob2004 = new ilSCORM13Player();
			$init_data = $ob2004->getConfigForPlayer();
			$resources = json_decode($ob2004->getCPDataInit());
			$cmi = $ob2004->getCMIData($ilUser->getID(), $this->obj_id);
			$max_attempt = $ob2004->get_max_attempts();
			$adlact_data = json_decode($ob2004->getADLActDataInit());
			//$globalobj_data = $ob2004->readGObjectiveInit();	
		} else {
			include_once "./Modules/ScormAicc/classes/SCORM/class.ilObjSCORMInitData.php";
			$slm_obj = new ilObjSCORMLearningModule($_GET["ref_id"]);
			$init_data = ilObjSCORMInitData::getIliasScormVars($slm_obj);
			$resources = json_decode(ilObjSCORMInitData::getIliasScormResources($this->obj_id));
			$tree = json_decode(ilObjSCORMInitData::getIliasScormTree($this->obj_id));
			$cmi = json_decode(ilObjSCORMInitData::getIliasScormData($this->obj_id));
			$max_attempt = ilObjSCORMInitData::get_max_attempts($this->obj_id);
		}
		if ($max_attempt == null) $max_attempt = 0;
		$result = array(
			'client_data' => array(
				$support_mail
			),
			'user_data' => $this->il2sopUserData(),
			'lm' => array(
				ilObject::_lookupTitle($this->obj_id),
				ilObject::_lookupDescription($this->obj_id),
				$scorm_version,
				1,//active
				$init_data,
				$resources,
				$tree,
				$module_version,
				"", //offline_zip_created!!!!!!!!
				$learning_progress_enabled,
				$certificate_enabled,
				$max_attempt,
				$adlact_data,
				$ilias_version
			),
			'sahs_user' => $sahs_user,
			'cmi' => $cmi
		);
		print(json_encode($result));
	}
	
	function il2sopUserData() {
		global $ilUser;
		return array(
			$ilUser->getLogin(),
			"",
			$ilUser->getFirstname(),
			$ilUser->getLastname(),
			$ilUser->getUTitle(),
			$ilUser->getGender(),
			$ilUser->getID()
			);
	}
	function il2sopSahsUser() {
		global $ilDB,$ilUser;
		$package_attempts	= 0;
		$module_version		= 1;//if module_version in sop is different...
		$last_visited		= "";
		$first_access		= null;
		$last_access		= null;
		$last_status_change	= null;
		$total_time_sec		= null;
		$sco_total_time_sec	= 0;
		$status				= 0;
		$percentage_completed = 0;
		$user_data			= "";

		global $ilDB,$ilUser;
		$res = $ilDB->queryF('SELECT * FROM sahs_user WHERE obj_id=%s AND user_id=%s',
			array('integer','integer'),
			array($this->obj_id,$ilUser->getID())
		);
		while($row = $ilDB->fetchAssoc($res))
		{
			$package_attempts = $row['package_attempts'];
			$module_version = $row['module_version'];
			$last_visited = $row['last_visited'];
			if ($row['first_access'] != null) {
				$first_access = strtotime($row['first_access'])*1000;//check Oracle!
			}
			if ($row['last_access'] != null) {
				$last_access = strtotime($row['last_access'])*1000;//check Oracle!
			}
			$total_time_sec = $row['total_time_sec'];
			$sco_total_time_sec = $row['sco_total_time_sec'];
			$status = $row['status'];
			$percentage_completed = $row['percentage_completed'];
		}
		if ($first_access == null) {
			include_once './Services/Tracking/classes/class.ilChangeEvent.php';
			$all = ilChangeEvent::_lookupReadEvents($this->obj_id,$ilUser->getID());
			foreach($all as $event)
			{
				$first_access = strtotime($event['first_access'])*1000;//
			}
		}
		return array($package_attempts, $module_version, $last_visited, $first_access, $last_access, $last_status_change, $total_time_sec, $sco_total_time_sec, $status, $percentage_completed, $user_data);
	}
	
	public static function checkIfAnyoneIsInOfflineMode($obj_id) {
		global $ilDB;
		$res = $ilDB->queryF("SELECT count(*) cnt FROM sahs_user WHERE obj_id=%s AND offline_mode = 'offline'",
			array('integer'),
			array($obj_id)
		);
		$val_rec = $ilDB->fetchAssoc($res);
		if ($val_rec["cnt"] == 0) return false;
		return true;
	}

	public static function usersInOfflineMode($obj_id) {
		global $ilDB;
		$users = array();
		$res = $ilDB->queryF("SELECT user_id, lastname, firstname FROM sahs_user, usr_data "
							."WHERE sahs_user.obj_id=%s AND sahs_user.offline_mode = 'offline' AND sahs_user.user_id=usr_data.usr_id",
			array('integer'),
			array($obj_id)
		);
		while($row = $ilDB->fetchAssoc($res))
		{
			$users[] = $row;
		}
		return $users;
	}

	public static function stopOfflineModeForUser($obj_id,$user_id) {
		global $ilDB;
		$res = $ilDB->queryF("UPDATE sahs_user SET offline_mode='online' WHERE obj_id=%s AND user_id=%s",
			array('integer','integer'),
			array($obj_id,$user_id)
		);
	}
	
}
