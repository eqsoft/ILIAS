<?php

/* Copyright (c) 1998-2019 ILIAS open source, Extended GPL, see docs/LICENSE */

/**
 * Portfolio page configuration 
 *
 * @author Alex Killing <alex.killing@gmx.de>
 */
class ilPortfolioPageConfig extends ilPageConfig
{
	/**
	 * @var ilSetting
	 */
	protected $settings;

	/**
	 * @var ilRbacSystem
	 */
	protected $rbacsystem;

	/**
	 * Init
	 */
	function init()
	{
		global $DIC;

		$this->settings = $DIC->settings();
		$this->rbacsystem = $DIC->rbac()->system();

		$ilSetting = $this->settings;
		$rbacsystem = $this->rbacsystem;
		
		$prfa_set = new ilSetting("prfa");
		$this->setPreventHTMLUnmasking(!(bool)$prfa_set->get("mask", false));

		$this->setEnableInternalLinks(true);
		$this->setIntLinkFilterWhiteList(true);
		$this->addIntLinkFilter("User");
		$this->addIntLinkFilter("PortfolioPage");
		$this->removeIntLinkFilter("File");
		$this->setIntLinkHelpDefaultId($_GET["prt_id"], false);
		$this->setIntLinkHelpDefaultType("PortfolioPage");
		$this->setEnablePCType("Profile", true);
		$this->setEditLockSupport(false);
		
		if(!$ilSetting->get('disable_wsp_certificates'))
		{
			$this->setEnablePCType("Verification", true);
		}
		$skmg_set = new ilSetting("skmg");
		if($skmg_set->get("enable_skmg"))
		{
			$this->setEnablePCType("Skills", true);
		}
			
		$settings = ilCalendarSettings::_getInstance();
		if($settings->isEnabled() &&
			$rbacsystem->checkAccess('add_consultation_hours', $settings->getCalendarSettingsId()) &&
			$settings->areConsultationHoursEnabled())
		{
			$this->setEnablePCType("ConsultationHours", true);			
		}		
		
		$prfa_set = new ilSetting("prfa");							
		if($prfa_set->get("mycrs", true))
		{
			$this->setEnablePCType("MyCourses", true);	
		}

		$mset = new ilSetting("mobs");
		if ($mset->get("mep_activate_pages"))
		{
			$this->setEnablePCType("ContentInclude", true);
		}

		$this->setEnablePCType("LearningHistory", true);
	}	
}