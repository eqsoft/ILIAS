<?php
/*
	+-----------------------------------------------------------------------------+
	| ILIAS open source                                                           |
	+-----------------------------------------------------------------------------+
	| Copyright (c) 1998-2001 ILIAS open source, University of Cologne            |
	|                                                                             |
	| This program is free software; you can redistribute it and/or               |
	| modify it under the terms of the GNU General Public License                 |
	| as published by the Free Software Foundation; either version 2              |
	| of the License, or (at your option) any later version.                      |
	|                                                                             |
	| This program is distributed in the hope that it will be useful,             |
	| but WITHOUT ANY WARRANTY; without even the implied warranty of              |
	| MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               |
	| GNU General Public License for more details.                                |
	|                                                                             |
	| You should have received a copy of the GNU General Public License           |
	| along with this program; if not, write to the Free Software                 |
	| Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA. |
	+-----------------------------------------------------------------------------+
*/


/**
* Meta Data class (element orComposite)
* Extends MDRequirement
*
* @package ilias-core
* @version $Id$
*/
include_once 'class.ilMD5295Base.php';
include_once 'Services/Migration/DBUpdate_5295/classes/class.ilMD5295Requirement.php';

class ilMD5295OrComposite extends ilMD5295Requirement
{
	// SET/GET
	function setOrCompositeId($a_or_composite_id)
	{
		$this->or_composite_id = (int) $a_or_composite_id;
	}
	function getOrCompositeId()
	{
		global $DIC;

		$ilDB = $DIC['ilDB'];
		
		if(!$this->or_composite_id)
		{
			$query = "SELECT MAX(or_composite_id) orc FROM il_meta_requirement ".
				"WHERE rbac_id = ".$ilDB->quote($this->getRBACId() ,'integer')." ".
				"AND obj_id = ".$ilDB->quote($this->getObjId() ,'integer')." ";

			$res = $this->db->query($query);
			while($row = $res->fetchRow(ilDBConstants::FETCHMODE_OBJECT))
			{
				$this->or_composite_id = $row->orc;
			}
			++$this->or_composite_id;
		}
		return $this->or_composite_id;
	}

	function &getRequirementIds()
	{
		include_once 'Services/Migration/DBUpdate_5295/classes/class.ilMD5295Requirement.php';

		return ilMD5295Requirement::_getIds($this->getRBACId(),
										$this->getObjId(),
										$this->getParentId(),
										'meta_technical',
										$this->getOrCompositeId());
	}

	function &getRequirement($a_requirement_id)
	{
		include_once 'Services/Migration/DBUpdate_5295/classes/class.ilMD5295Requirement.php';

		if(!$a_requirement_id)
		{
			return false;
		}
		$req = new ilMD5295Requirement();
		$req->setMetaId($a_requirement_id);

		return $req;
	}

	function &addRequirement()
	{
		include_once 'Services/Migration/DBUpdate_5295/classes/class.ilMD5295Requirement.php';

		$req = new ilMD5295Requirement($this->getRBACId(),$this->getObjId(),$this->getObjType());
		$req->setParentId($this->getParentId());
		$req->setParentType('meta_technical');
		$req->setOrCompositeId($this->getOrCompositeId());

		return $req;
	}

	/*
	 * Overwritten save method, to get new or_composite_id
	 * 
	 */
	function save()
	{
		echo 'Use ilMD5295Orcomposite::addRequirement()';
	}

	function delete()
	{
		foreach($this->getRequirementIds() as $id)
		{
			$req = $this->getRequirement($id);
			$req->delete();
		}
		return true;
	}
				
	/*
	 * XML Export of all meta data
	 * @param object (xml writer) see class.ilMD52952XML.php
	 * 
	 */
	function toXML(&$writer)
	{
		// For all requirements
		$writer->xmlStartTag('OrComposite');

		$reqs = $this->getRequirementIds();
		foreach($reqs as $id)
		{
			$req = $this->getRequirement($id);
			$req->toXML($writer);
		}
		if(!count($reqs))
		{
			include_once 'Services/Migration/DBUpdate_5295/classes/class.ilMD5295Requirement.php';
			$req = new ilMD5295Requirement($this->getRBACId(),$this->getObjId());
			$req->toXML($writer);
		}
		$writer->xmlEndTag('OrComposite');
		
	}


	// STATIC
	static function _getIds($a_rbac_id,$a_obj_id,$a_parent_id,$a_parent_type,$a_or_composite_id = 0)
	{
		global $DIC;

		$ilDB = $DIC['ilDB'];

		$query = "SELECT DISTINCT(or_composite_id) or_composite_id FROM il_meta_requirement ".
			"WHERE rbac_id = ".$ilDB->quote($a_rbac_id ,'integer')." ".
			"AND obj_id = ".$ilDB->quote($a_obj_id ,'integer')." ".
			"AND parent_id = ".$ilDB->quote($a_parent_id ,'integer')." ".
			"AND parent_type = ".$ilDB->quote($a_parent_type ,'text')." ".
			"AND or_composite_id > 0 ";

		$res = $ilDB->query($query);
		while($row = $res->fetchRow(ilDBConstants::FETCHMODE_OBJECT))
		{
			$ids[] = $row->or_composite_id;
		}
		return $ids ? $ids : array();
	}
}
?>