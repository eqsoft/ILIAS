<?php

use PHPUnit\Framework\TestCase;

/**
 * Class ilWorkflowEngineBaseTest
 */
abstract class ilWorkflowEngineBaseTest extends TestCase
{
	/**
	 * @param string $name
	 * @param mixed $value
	 */
	protected function setGlobalVariable($name, $value)
	{
		global $DIC;

		$GLOBALS[$name] = $value;

		unset($DIC[$name]);
		$DIC[$name] = function ($c) use ($name) {
			return $GLOBALS[$name];
		};
	}

	/**
	 * 
	 */
	protected function setUp(): void
	{
		parent::setUp();

		$this->setGlobalVariable('ilDB', $this->getMockBuilder('ilDBInterface')->getMock());

		$this->setGlobalVariable(
			'ilAppEventHandler',
			$this->getMockBuilder('ilAppEventHandler')->disableOriginalConstructor()->setMethods(array('raise'))->getMock()
		);

		$this->setGlobalVariable(
			'ilSetting',
			$this->getMockBuilder('ilSetting')->disableOriginalConstructor()->setMethods(array('delete', 'get', 'set'))->getMock()
		);
	}
}