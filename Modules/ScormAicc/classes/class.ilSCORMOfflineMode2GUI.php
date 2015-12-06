<?php/* Copyright (c) 1998-2013 ILIAS open source, Extended GPL, see docs/LICENSE *//*** GUI class ilSCORMOfflineMode2GUI** GUI class for scorm offline player connection** @author Stefan Schneider <schneider@hrz.uni-marburg.de>* @version $Id: class.ilSCORMOfflineMode2GUI.php  $***/class ilSCORMOfflineMode2GUI{		var $lmId;	var $clientIdSop;	var $offlineMode;	var $offline_mode;		function ilSCORMOfflineMode2GUI($type) {		global $ilias, $tpl, $lng, $ilCtrl;		include_once "./Modules/ScormAicc/classes/class.ilSCORMOfflineMode2.php";		$this->ilias =& $ilias;		$this->tpl =& $tpl;		$lng->loadLanguageModule("sop");		$this->lng =& $lng;		$this->ctrl =& $ilCtrl;		$this->ctrl->saveParameter($this, "ref_id");		$this->offlineMode = new ilSCORMOfflineMode2();		$this->offline_mode = $this->offlineMode->getOfflineMode();	}		function executeCommand()	{		global $log, $tpl, $ilCtrl;				$this->lmId = ilObject::_lookupObjectId($_GET["ref_id"]);		$this->clientIdSop = $this->offlineMode->getClientIdSop();		$cmd = $ilCtrl->getCmd();		switch($cmd) {			case 'offlineMode2_sop2' :				$log->write("offlineMode2_sop2");				header('Content-Type: text/html');				header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1				header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Datum in der Vergangenheit				print file_get_contents('./Modules/ScormAicc/sop2/sop2_index.html');				break;			case 'offlineMode2_sop2manifest':				$log->write("offlineMode2_sop2manifest");				header('Content-Type: text/cache-manifest');				header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1				header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Datum in der Vergangenheit				print file_get_contents('./Modules/ScormAicc/sop2/sop2.appcache');				break;			case 'offlineMode2_il2sop':				$log->write("offlineMode2_il2sop");				$this->offlineMode->createLmManifestFileIfNotExists();				header('Content-Type: text/html');				header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1				header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Datum in der Vergangenheit				$out = file_get_contents(ilUtil::getWebspaceDir("filesystem").'/lm_data/lm_'.$this->lmId.'/sop2_index.html');				//$log->write($out);				print $out;				//$this->view($this->offlineMode->getOfflineMode(),$cmd);								break;			case 'offlineMode2_appcache' :				$log->write("offlineMode2_appcache");				$this->offlineMode->createLmManifestFileIfNotExists();				header('Content-Type: text/cache-manifest');				header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1				header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Datum in der Vergangenheit				if ($_COOKIE['purgeCache'] == 1) {					$log->write("purgeCache:".$_COOKIE['purgeCache']);					print file_get_contents('./Modules/ScormAicc/sop2/empty.appcache');				}				else {					print file_get_contents(ilUtil::getWebspaceDir("filesystem").'/lm_data/lm_'.$this->lmId.'/sop2.appcache');				}					break;			case 'offlineMode2_il2sopOk':				$this->offlineMode->setOfflineMode("offline");				$this->view($this->offlineMode->getOfflineMode(),$cmd);				break;			case 'offlineMode2_sop2ilOk':				$this->offlineMode->setOfflineMode("online");				$this->view($this->offlineMode->getOfflineMode(),$cmd);				break;			/*			case 'offlineMode2_il2sopPurge' :							case 'offlineMode2_purgeCache' :				$log->write("offlineMode2_purgeCache");				header('Content-Type: text/cache-manifest');				header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1				header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Datum in der Vergangenheit				print file_get_contents('./Modules/ScormAicc/sop2/empty.appcache');				break;			*/				default :				$this->view($this->offlineMode->getOfflineMode(),$cmd);				break;		}	}		function view($offline_mode, $cmd) {		global $tpl;		$this->setOfflineModeTabs($offline_mode);		$tpl->addJavascript('./Modules/ScormAicc/scripts/sop2.js');		$tpl->addCss(ilUtil::getStyleSheetLocation("output", "sop2.css", "Modules/ScormAicc"), "screen");		$tpl->addBlockFile("ADM_CONTENT", "adm_content", "tpl.scorm_offline_mode2.html", "Modules/ScormAicc");		$tpl->setCurrentBlock('offline_content');		$tpl->setVariable("Command",$cmd);		$tpl->setVariable("CHECK_SYSTEM_REQUIREMENTS",$this->lng->txt('sop_check_system_requirements'));		$tpl->setVariable("EXPORT",$this->lng->txt('sop_export'));		$tpl->setVariable("DESC_EXPORT",$this->lng->txt('sop_desc_export'));		$tpl->setVariable("TEXT_PUSH_TRACKING",$this->lng->txt('sop_text_push_tracking'));		$tpl->setVariable("PUSH_TRACKING",$this->lng->txt('sop_push_tracking'));		$tpl->setVariable("CLIENT_ID",CLIENT_ID);		$tpl->setVariable("CLIENT_ID_SOP",$this->clientIdSop);		$tpl->setVariable("REF_ID",$_GET['ref_id']);		$tpl->setVariable("LM_ID",$this->lmId);		$tpl->setVariable("OFFLINE_MODE",$offline_mode);		$tpl->parseCurrentBlock();		$tpl->show();	}		function setOfflineModeTabs($offline_mode)	{			global $ilTabs, $ilLocator,$tpl,$log;		$icon = ($offline_mode == "online") ? "icon_sahs.svg" : "icon_sahs_offline.svg";		$tabTitle = $this->lng->txt("offline_mode");		$thisurl =$this->ctrl->getLinkTarget($this, $a_active);		$ilTabs->addTab($a_active, $tabTitle, $thisurl);		$ilTabs->activateTab($a_active);		$tpl->getStandardTemplate();		$tpl->setTitle(ilObject::_lookupTitle($this->lmId));		$tpl->setTitleIcon(ilUtil::getImagePath($icon));		$ilLocator->addRepositoryItems();		$ilLocator->addItem(ilObject::_lookupTitle($this->lmId),$thisurl);		$tpl->setLocator();	}}?>