<?php
// IMPORTANT: Inform the lead developer, if you want to add any steps here.
//
// This is the hotfix file for ILIAS 4.4.x DB fixes
// This file should be used, if bugfixes need DB changes, but the
// main db update script cannot be used anymore, since it is
// impossible to merge the changes with the trunk.
//
// IMPORTANT: The fixes done here must ALSO BE reflected in the trunk.
// The trunk needs to work in both cases !!!
// 1. If the hotfixes have been applied.
// 2. If the hotfixes have not been applied.
?>
<#1>
<?php
	if(!$ilDB->tableColumnExists('sahs_lm','offline_mode2'))
	{
		$ilDB->addTableColumn(
			'sahs_lm',
			'offline_mode2',
			array(
				"type" => "text",
				'length' => 1,
				"notnull" => true,
				"default" => 'n'
			)
		);
	$ilDB->query("UPDATE sahs_lm SET offline_mode2 = 'n'");
}
?>
<#2>
<?php
if(!$ilDB->tableExists('sahs_user'))
{
	$fields = array (
		'obj_id' => array(
			'type' => 'integer', 
			'length' => 4,
			'notnull' => true
		),
		'user_id' => array(
			'type' => 'integer', 
			'length' => 4,
			'notnull' => true
		),
		'package_attempts' => array(
			'type' => 'integer', 
			'length' => 2,
			'notnull' => false
		),
		'module_version' => array(
			'type' => 'integer', 
			'length' => 2,
			'notnull' => false
		),
		'last_visited' => array(
			'type'    => 'text',
			'length'  => 255,
			'notnull' => false,
			'fixed' => false,
			'default' => null
		),
		'hash' => array(
			'type' => 'text',
			'length' => 20,
			'notnull' => false,
			'fixed' => false,
			'default' => null
		),
		'hash_end' => array(
			'type' => 'timestamp',
			'notnull' => false
		),
		'offline_mode' => array(
			'type' => 'text',
			'length' => 8,
			'notnull' => false,
			'fixed' => false,
			'default' => null
		),
		'offline_mode2' => array(
			'type' => 'text',
			'length' => 8,
			'notnull' => false,
			'fixed' => false,
			'default' => null
		)
	);
	$ilDB->createTable('sahs_user', $fields);
	$ilDB->addPrimaryKey('sahs_user', array('obj_id','user_id'));
}
else {
	$ilDB->addTableColumn(
		'sahs_user',
		'offline_mode2',
		array(
			'type' => 'text',
			'length' => 8,
			'notnull' => false,
			'fixed' => false,
			'default' => null
		)
	);
}
?>

