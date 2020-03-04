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

use ILIAS\LTI\Screen\LtiViewLayoutProvider;

/**
 * @classDescription class for ILIAS ViewLTI
 *
 * @author Stefan Schneider <schneider@hrz.uni-marburg.de
 * @version $id$
 * @ingroup ServicesLTI
 * @ilCtrl_IsCalledBy ilLTIViewGUI: ilLTIRouterGUI
 *
 */
class ilLTIViewGUI
{
    /**
     * private variables
     */
    private $dic = null;
    private $user = null;
    private $log = null;
    private $link_dir = "";

    /**
     * public variables
     */
    public $lng = null;

    public function __construct()
    {
        global $DIC;
        $this->dic = $DIC;
        $this->user = $this->dic->user();
        $this->log = $this->dic->logger()->lti();
        $this->lng = $this->dic->language();
        $this->lng->loadLanguageModule('lti');
    }

    /**
     * Init LTI mode for lit authenticated users
     */
    public function init()
    {
		$this->link_dir = (defined("ILIAS_MODULE")) ? "../" : "";
		if ($this->isLTIUser())
		{
			$context = $this->dic->globalScreen()->tool()->context();
			$context->claim()->lti();
			$this->initGUI();
        }
    }

    /**
     * for compatiblity with ilLTIRouterGUI
     */
    public static function getInstance()
    {
        global $DIC;
        return $DIC["lti"];
    }

    /**
     * get LTI Mode from Users->getAuthMode
     * @return boolean
     */
    private function isLTIUser()
    {
        if (!$this->user instanceof ilObjUser) {
            return false;
        }
        return (strpos($this->user->getAuthMode(), 'lti_') === 0);
    }

    public function executeCommand()
    {
        global $ilCtrl;
        $cmd = $ilCtrl->getCmd();
        switch ($cmd) {
            case 'exit':
                $this->exitLti();
                break;
        }
    }

    public function isActive() : bool
    {
		return $this->isLTIUser();
    }

    public function initGUI()
    {
		$this->log->debug("initGUI");
        $baseclass = strtolower($_GET['baseClass']);
        $cmdclass = strtolower($_GET['cmdClass']);
		switch ($baseclass)
		{
			case 'illtiroutergui' :
				return;
				break;
		}
	}

	public function getContextId() {
		global $ilLocator;
		if (isset($_GET['lti_context_id']) && $_GET['lti_context_id'] !== '') {
			return $_GET['lti_context_id'];
		}
		$locator_items = $ilLocator->getItems();
		if (is_array($locator_items) && count($locator_items) > 0) {
			return $locator_items[0]['ref_id'];
		}
		return '';
        }
<<<<<<< HEAD
        if ($this->getSessionValue('lti_home_obj_id') === '') {
            $_SESSION['lti_home_obj_id'] = ilObject::_lookupObjectId($_SESSION['lti_home_id']);
=======

	public function getPostData() {
		$post_data = $_SESSION['lti_' . $this->getContextId() . '_post_data'];
		if (!is_array($post_data)) {
			$this->log->warning("no session post_data: " . "lti_" . $this->getContextId() . "_post_data");
			return null;
>>>>>>> f218358dd0... refactoring of session handling
        }
		return $post_data;
        }

	public function getExternalCss() {
		$post_data = $this->getPostData();
		if ($post_data !== null) {
			return (isset($post_data['launch_presentation_css_url'])) ? $post_data['launch_presentation_css_url'] : '';
        }
		return '';
        }
<<<<<<< HEAD
        switch ($baseclass) {
            case 'illtiroutergui':
                return;
                break;
=======

	public function getHomeObjId() {
		return ilObject::_lookupObjectId($this->getContextId());
>>>>>>> f218358dd0... refactoring of session handling
        }

	public function getHomeObjType() {
		ilObject::_lookupType($this->getHomeObjId(),true);
    }

    public function getHomeLink()
    {
		return $this->link_dir."goto.php?target=".$this->getHomeObjType()."_".$this->getHomeObjId();
    }

    public function getHomeTitle()
    {
		return ilObject::_lookupTitle($this->getHomeObjId()) ?? '';
    }

    public function getTitle() : string
    {
		$post_data = $this->getPostData();
		if ($post_data !== null) {
			return (isset($post_data['resource_link_title'])) ? "LTI - " . $post_data['resource_link_title'] : "LTI";
		}
		return "LTI";
    }

    public function getTitleForExitPage() : string
    {
        return $this->lng->txt('lti_exited');
    }

    public function getShortTitle() : string
    {
        return $this->lng->txt('lti_mode');
    }

    public function getViewTitle() : string
    {
        return $this->getHomeTitle();
    }

    /**
     * exit LTI session and if defined redirecting to returnUrl
     * ToDo: Standard Template with delos ...
     */
    public function exitLti()
    {
		$this->dic->logger()->lti()->info("exitLTI");
		$context_id = $this->getContextId();
		$post_data = $this->getPostData();
		$return_url = ($post_data !== null) ? $post_data['launch_presentation_return_url'] : '';
		$this->removeContextFromSession($context_id);
		$local_role_id = $this->dic->rbac()->review()->roleExists('lti_'. $context_id);
		if ($local_role_id) {
			$local_role_id = $this->dic->rbac()->admin()->deassignUser($local_role_id,$this->user->getId());
			$this->dic->logger()->lti()->debug("deassign user: " . $this->user->getId() . " from local role: " . $this->user->getId());
		}
		if (isset($_SESSION['lti_' . $context_id . '_post_data'])) {
			unset($_SESSION['lti_' . $context_id . '_post_data']);
			$this->dic->logger()->lti()->debug('unset SESSION["' . 'lti_' . $context_id . '_post_data"]');
		}
		if (!isset($return_url) || $return_url === '') {
            $cc = $this->dic->globalScreen()->tool()->context()->current();
            $cc->addAdditionalData(LtiViewLayoutProvider::GS_EXIT_LTI, true);
            $ui_factory = $this->dic->ui()->factory();
            $renderer = $this->dic->ui()->renderer();
            $content = [
                $ui_factory->messageBox()->info($this->lng->txt('lti_exited_info'))
            ];
            $tpl = $this->dic["tpl"];
            $tpl->setContent($renderer->render($content));
			$this->logout();
            $tpl->printToStdout();
        } else {
			$this->logout();
			header('Location: ' . $return_url);
        }
    }

    /**
	 * logout ILIAS and destroys Session and ilClientId cookie if no consumer is still open in the LTI User Session
     */
    public function logout()
    {
		if (is_array($_SESSION['lti_context_ids']) && count($_SESSION['lti_context_ids']) > 0) {
			$this->dic->logger()->lti()->debug("there is another open consumer session: logout refused.");
			return;
		}
        $this->dic->logger()->lti()->info("logout");
        ilSession::setClosingContext(ilSession::SESSION_CLOSE_USER);
        $GLOBALS['DIC']['ilAuthSession']->logout();
        $client_id = $_COOKIE["ilClientId"];
        ilUtil::setCookie("ilClientId", "");
		ilUtil::setCookie("PHPSESSID","");
    }

    public function getCmdLink(String $cmd) : String
    {
        global $ilCtrl;
		$lti_context_id = $this->getContextId();
		$lti_context_id_param = ($lti_context_id  != '') ? "&lti_context_id=".$lti_context_id : '';
        $targetScript = ($ilCtrl->getTargetScript() !== 'ilias.php') ? "ilias.php" : "";
		return $this->link_dir.$targetScript.$ilCtrl->getLinkTargetByClass(array('illtiroutergui',strtolower(get_class($this))),$cmd)."&baseClass=illtiroutergui".$lti_context_id_param;
    }

    private function getSessionValue(String $sess_key) : String
    {
        if (isset($_SESSION[$sess_key]) && $_SESSION[$sess_key] != '') {
            return $_SESSION[$sess_key];
        } else {
            return '';
        }
    }

	private function getCookieValue(String $cookie_key) : String
	{
		if (isset($_COOKIE[$cookie_key]) && $_COOKIE[$cookie_key] != '') {
			return $_COOKIE[$cookie_key];
		}
		else {
			return '';
		}
	}

	private function removeContextFromSession($context_id) {
		$lti_context_ids = $_SESSION['lti_context_ids'];
		if (is_array($lti_context_ids) && in_array($context_id,$lti_context_ids)) {
			array_splice($lti_context_ids,array_search($context_id,$lti_context_ids),1);
			$_SESSION['lti_context_ids'] = $lti_context_ids;
		}
	}
}
