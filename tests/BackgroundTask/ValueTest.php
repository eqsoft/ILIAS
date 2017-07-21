<?php

use ILIAS\BackgroundTasks\Implementation\Values\AggregationValues\ListValue;
use ILIAS\BackgroundTasks\Implementation\Values\ScalarValues\IntegerValue;
use ILIAS\BackgroundTasks\Implementation\Values\ScalarValues\StringValue;
use ILIAS\BackgroundTasks\Implementation\Values\ScalarValues\ScalarValue;
use ILIAS\BackgroundTasks\Implementation\ValueTypes\ListType;
use ILIAS\BackgroundTasks\Implementation\ValueTypes\SingleType;
use PHPUnit\Framework\TestCase;

require_once("libs/composer/vendor/autoload.php");

/**
 * Class BackgroundTaskTest
 *
 * @author                 Oskar Truffer <ot@studer-raimann.ch>
 *
 * @group                  needsInstalledILIAS
 */
class ValueTest extends TestCase {

	public function testIntegerValue() {
		$integer = new IntegerValue(3);
		$integer2 = new IntegerValue(3);
		$integer3 = new IntegerValue(4);

		$this->assertEquals($integer->getValue(), 3);
		$this->assertTrue($integer->equals($integer2));
		$this->assertEquals($integer->getHash(), $integer2->getHash());
		$this->assertNotEquals($integer->getHash(), $integer3->getHash());
		$integer3->unserialize($integer->serialize());
		$this->assertTrue($integer->equals($integer3));
		$this->assertTrue($integer->getType()->equals(new SingleType(IntegerValue::class)));
	}


	public function testListValue() {
		$list = new ListValue([ 1, 2, 3 ]);
		$list2 = new ListValue([ new IntegerValue(2), new StringValue("1") ]);

		$this->assertTrue($list->getType()->equals(new ListType(IntegerValue::class)));
		$this->assertTrue($list2->getType()->equals(new ListType(ScalarValue::class)));
	}
}