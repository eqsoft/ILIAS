<?php

/* Copyright (c) 1998-2010 ILIAS open source, Extended GPL, see docs/LICENSE */

include_once './Services/Authentication/classes/class.ilSession.php';

/**
 * 
 *
 * @author Stefan Meyer <smeyer.ilias@gmx.de> 
 *
 */
class ilAuthSession
{
	const SESSION_AUTH_AUTHENTICATED = '_authsession_authenticated';
	const SESSION_AUTH_USER_ID = '_authsession_user_id';
	
	private static $instance = null;
	
	private $logger = null;
	
	private $id = '';
	private $valid = false;
	private $user_id = 0;
	
	/**
	 * Consctructor
	 */
	private function __construct()
	{
		$this->logger = ilLoggerFactory::getLogger('auth');
	}
	
	/**
	 * Get instance
	 * @return ilAuthSession
	 */
	public static function getInstance()
	{
		if(static::$instance)
		{
			return new static::$instance;
		}
		return static::$instance = new self();
	}
	
	/**
	 * @return ilLogger
	 */
	public function getLogger()
	{
		return $this->logger;
	}
	
	/**
	 * Start auth session
	 * @return boolean
	 */
	public function init()
	{
		if(session_start())
		{
			$this->setId(session_id());
			$this->setUserId(ilSession::get(self::SESSION_AUTH_USER_ID));
			$this->getLogger()->debug('Resumed session for user: ' . $this->getUserId());
			return true;
		}
		// new session
		ilSession::set(self::SESSION_AUTH_AUTHENTICATED, false);
		ilSession::set(self::SESSION_AUTH_USER_ID, 0);
		
		$this->setUserId(0);
	}
	
	/**
	 * Regenerate id
	 */
	public function regenerateId()
	{
		$this->getLogger()->debug('Session regenrate id called');
		session_regenerate_id();
		$this->setId(session_id());
	}
	
	/**
	 * Logout user => stop session
	 */
	public function logout()
	{
		$this->getLogger()->debug('Logout called: Destroy user session');
		$this->setAuthenticated(false, 0);
		session_destroy();
	}
	
	/**
	 * Check if session is authenticated
	 */
	public function isAuthenticated()
	{
		return ilSession::get(self::SESSION_AUTH_AUTHENTICATED);
	}
	
	/**
	 * Set authenticated
	 * @param authentication status $a_status
	 * @return type
	 */
	public function setAuthenticated($a_status, $a_user_id)
	{
		ilSession::set(self::SESSION_AUTH_AUTHENTICATED, $a_status);
		ilSession::set(self::SESSION_AUTH_USER_ID, (int) $a_user_id);
	}
	
	/**
	 * Set authenticated user id
	 * @param type $a_id
	 */
	public function setUserId($a_id)
	{
		$this->user_id = $a_id;
	}
	
	/**
	 * Get authenticated user id 
	 * @return int
	 */
	public function getUserId()
	{
		return $this->user_id;
	}
	
	/**
	 * Check authenticated, valid, ...
	 * @return type
	 */
	public function isValid()
	{
		return $this->isAuthenticated();
	}
	
	public function setId($a_id)
	{
		$this->id = $a_id;
	}
	
	public function getId()
	{
		return $this->id;
	}
	
}
?>