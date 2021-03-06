<?php

/* Copyright (c) 1998-2019 ILIAS open source, Extended GPL, see docs/LICENSE */

/**
 * Glossary definition page object
 * 
 * @author Alex Killing <alex.killing@gmx.de> 
 */
class ilGlossaryDefPage extends ilPageObject
{
	/**
	 * Get parent type
	 *
	 * @return string parent type
	 */
	function getParentType()
	{
		return "gdf";
	}

	/**
	 * Before page content update
	 *
	 * Note: This one is "work in progress", currently only text paragraphs call this hook
	 * It is called before the page content object invokes the update procedure of
	 * ilPageObject
	 *
	 * @param
	 * @return
	 */
	function beforePageContentUpdate($a_page_content)
	{
		if ($a_page_content->getType() == "par")
		{
			$glos = ilObjGlossary::lookupAutoGlossaries($this->getParentId());
			$a_page_content->autoLinkGlossaries($glos);
		}
	}

}