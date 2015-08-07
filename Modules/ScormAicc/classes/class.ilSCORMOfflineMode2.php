<?php

/* Copyright (c) 1998-2011 ILIAS open source, Extended GPL, see docs/LICENSE */
//require_once "./Services/Object/classes/class.ilObject.php";

/**
* Class ilSCORMOfflineMode2
*
* Class for scorm offline player connection
*
* @author Stefan Schneider <schneider@hrz.uni-marburg.de>
* @version $Id: class.ilSCORMOfflineMode2.php  $
*
* @ingroup ModulesScormAicc
*/
class ilSCORMOfflineMode2
{
	var $type;
	var $obj_id;
	var $offlineMode;
	var $lm_dir;
	var $lm_sop2_index;
	var $lm_sop2_appcache;
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
		$this->read();
	}
	
	private function read() {
		global $ilDB,$ilUser;
		$res = $ilDB->queryF('SELECT offline_mode2 FROM sahs_user WHERE obj_id=%s AND user_id=%s',
			array('integer','integer'),
			array($this->obj_id,$ilUser->getId())
		);
		while($row = $ilDB->fetchAssoc($res))
		{
			if ($row['offline_mode2'] != null) {
				$this->offlineMode = $row['offline_mode2'];
			} else {
				$this->offlineMode = "online";
			}
		}
	}
	
	//offlineMode: offline, online, il2sop, sop2il
	function setOfflineMode($a_mode) {
		global $ilDB,$ilUser;
		$res = $ilDB->queryF('UPDATE sahs_user SET offline_mode2=%s WHERE obj_id=%s AND user_id=%s',
			array('text','integer','integer'),
			array($a_mode, $this->obj_id,$ilUser->getId())
		);
		$this->offlineMode=$a_mode;
	}
	
	function getOfflineMode() {
		return $this->offlineMode;
	}
	
	function createManifestFileIfNotExists() {
		global $log;
		$log->write("createManifestFileIfNotExists");
		$this->lm_dir = ilUtil::getWebspaceDir("filesystem").'/lm_data/lm_'.$this->obj_id;
		if (!file_exists($this->lm_dir)){
			$log->write("could not find " . $this->lm_dir);
			return false;
		}
		$this->lm_sop2_index = $this->lm_dir.'/sop2_index.html';
		$this->lm_sop2_appcache = $this->lm_dir.'/sop2.appcache';
		if (file_exists($this->lm_sop2_index) && file_exists($this->lm_sop2_appcache)) {
			$log->write("sop2_index.html and sop2.appcache already exists, nothing to to.");
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
		$index_url = ILIAS_HTTP_PATH . '/ilias.php?baseClass=ilSAHSPresentationGUI&ref_id='.$_GET["ref_id"].'&client_id='.CLIENT_ID.'&cmd=offlineMode2_il2sop'; 
		$appcache_url = ILIAS_HTTP_PATH . '/ilias.php?baseClass=ilSAHSPresentationGUI&ref_id='.$_GET["ref_id"].'&client_id='.CLIENT_ID.'&cmd=offlineMode2_appcache';
		
		if (!is_null($hrefs) && !file_exists($this->lm_sop2_appcache)) {
			$manifest_file = fopen($this->lm_sop2_appcache, "w");
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
		
		//sop2_index.html
		if (file_exists($this->lm_sop2_index)) {
			$log->write("sop2_index.html already exists.");
			return true;
		}
		$index_string = '<html manifest="' . $appcache_url . '"><head><title>sop2_index.html</title></head><body></body></html>'; 
		$index_file = fopen($this->lm_sop2_index, "w");
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
	
	function il2sop() {
		global $ilUser, $ilias;
		$this->setOfflineMode("il2sop");
	}
}
