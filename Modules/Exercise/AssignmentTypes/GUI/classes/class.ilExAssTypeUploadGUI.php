<?php

/* Copyright (c) 1998-2018 ILIAS open source, Extended GPL, see docs/LICENSE */

/**
 * Upload type gui implementations
 *
 * @author Alex Killing <killing@leifos.de>
 */
class ilExAssTypeUploadGUI implements ilExAssignmentTypeGUIInterface
{
	use ilExAssignmentTypeGUIBase;

	/**
	 * @inheritdoc
	 */
	function addEditFormCustomProperties(ilPropertyFormGUI $form)
	{

	}

	/**
	 * @inheritdoc
	 */
	function importFormToAssignment(ilExAssignment $ass , ilPropertyFormGUI $form)
	{

	}

	/**
	 * @inheritdoc
	 */
	function getFormValuesArray(ilExAssignment $ass)
	{
		return [];
	}

	/**
	 * @inheritdoc
	 */
	function getOverviewContent(ilInfoScreenGUI $a_info, ilExSubmission $a_submission)
	{

	}

}