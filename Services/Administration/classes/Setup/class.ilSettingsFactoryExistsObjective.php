<?php

/* Copyright (c) 2019 Richard Klees <richard.klees@concepts-and-training.de> Extended GPL, see docs/LICENSE */

use ILIAS\Setup;

class ilSettingsFactoryExistsObjective implements Setup\Objective {
	public function getHash() : string {
		return hash("sha256", self::class);
	}

	public function getLabel() : string {
		return "Initialize factory for ilSetting";
	}

	public function isNotable() : bool {
		return false;
	}

	public function getPreconditions(Setup\Environment $environment) : array {
		$db_config = $environment->getConfigFor("database");
		return [
			new ilDatabasePopulatedObjective($db_config)
		];
	}

	public function achieve(Setup\Environment $environment) : Setup\Environment {
		$db = $environment->getResource(Setup\Environment::RESOURCE_DATABASE);

		return $environment
			->withResource(
				Setup\Environment::RESOURCE_SETTINGS_FACTORY,
				new \ilSettingsFactory($db)	
			);
	}
}
