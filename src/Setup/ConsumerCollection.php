<?php

/* Copyright (c) 2019 Richard Klees <richard.klees@concepts-and-training.de> Extended GPL, see docs/LICENSE */

namespace ILIAS\Setup;

use ILIAS\UI\Component\Input\Field\Factory as FieldFactory;
use ILIAS\UI\Component\Input\Field\Input as Input;
use ILIAS\Transformation\Factory as TransformationFactory;

/**
 * A consumer that is a collection of some other consumers.
 */
class ConsumerCollection implements Consumer {
	/**
	 * @var FieldFactory
	 */
	protected $field_factory;

	/**
	 * @var TransformationFactory
	 */
	protected $transformation_factory;

	/**
	 * @var Consumer[]
	 */
	protected $consumers;

	public function __construct(
		FieldFactory $field_factory,
		TransformationFactory $transformation_factory,
		array $consumers
	) {
		$this->field_factory = $field_factory;
		$this->transformation_factory = $transformation_factory;
		$this->consumers = $consumers;
	}

	/**
	 * @inheritdocs
	 */
	public function hasConfig() : bool {
		foreach ($this->consumers as $c) {
			if ($c->hasConfig()) {
				return true;
			}
		}
		return false;
	}	

	/**
	 * @inheritdocs
	 */
	public function getConfigInput(Config $config = null) : Input {
		if ($config !== null && !($config instanceof ConfigCollection)) {
			throw new \InvalidArgumentException(
				"Expected ConfigCollection for configuration."
			);
		}

		$inputs = [];
		$keys = [];
		foreach ($this->getConsumersWithConfig() as $k => $c) {
			$keys[] = $k;
			if ($config) {
				$inputs[] = $c->getConfigInput($config->getConfig($k));
			}
			else {
				$inputs[] = $c->getConfigInput();
			}	
		}

		return $this->field_factory->group($inputs)
			->withAdditionalTransformation(
				$this->transformation_factory->custom(function($v) use ($keys) {
					if (count($v) !== count($keys)) {
						throw new \LogicException(
							"Expected to get as many configs as there are keys."
						);
					}
					return new ConfigCollection(array_combine($keys, $v));
				})
			);
	}

	/**
	 * @inheritdocs
	 */
	public function getConfigFromArray(array $data) : Config {
		$configs = [];

		foreach ($this->getConsumersWithConfig() as $k => $c) {
			if (!isset($data[$k]) || !is_array($data[$k])) {
				throw new \InvalidArgumentException(
					"Expected array at key '$k' in \$data."
				);
			}

			$configs[$k] = $c->getConfigFromArray($data[$k]);
		}

		return new ConfigCollection($configs);
	}

	protected function getConsumersWithConfig() : \Traversable {
		foreach ($this->consumers as $k => $c) {
			if ($c->hasConfig()) {
				yield $k => $c;
			}
		}
	}

	/**
	 * @inheritdocs
	 */
	public function getSetupGoal(Config $config = null) : Goal {
		if (!($config instanceof ConfigCollection)) {
			throw new \InvalidArgumentException(
				"Expected ConfigCollection for configuration."
			);
		}

		$gs = [];
		foreach ($this->consumers as $k => $c) {
			if ($c->hasConfig()) {
				$gs[] = $c->getSetupGoal($config->getConfig($k));
			}
			else {
				$gs[] = $c->getSetupGoal();
			}
		}

		return new GoalCollection("Collected Setup Goals", false, ...$gs);
	}

	/**
	 * @inheritdocs
	 */
	public function getUpdateGoal(Config $config = null) : Goal {
		if (!($config instanceof ConfigCollection)) {
			throw new \InvalidArgumentException(
				"Expected ConfigCollection for configuration."
			);
		}

		$gs = [];
		foreach ($this->consumers as $k => $c) {
			if ($c->hasConfig()) {
				$gs[] = $c->getUpdateGoal($config->getConfig($k));
			}
			else {
				$gs[] = $c->getUpdateGoal();
			}
		}

		return new GoalCollection("Collected Update Goals", false, ...$gs);
	}
}