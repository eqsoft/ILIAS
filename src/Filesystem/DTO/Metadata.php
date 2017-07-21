<?php

namespace ILIAS\Filesystem\DTO;

use ILIAS\Filesystem\MetadataType;

/**
 * Class Metadata
 *
 * This class holds all default metadata send by the filesystem adapters.
 * Metadata instances are immutable.
 *
 * @author  Nicolas Schäfli <ns@studer-raimann.ch>
 * @since 5.3
 * @version 1.0
 */
final class Metadata {

	/**
	 * @var string $basename
	 */
	private $basename;
	/**
	 * @var string $path
	 */
	private $path;
	/**
	 * @var string $type
	 */
	private $type;


	/**
	 * Metadata constructor.
	 *
	 * Creates a new instance of the Metadata.
	 *
	 * @internal
	 *
	 * @param string $basename The name of the directory or file without the full path.
	 * @param string $path     The path to the parent of the file or directory.
	 * @param string $type     The file type which can be -> file or directory.
	 *                         Please note that only constants defined in the MetadataType interface are considered as valid.
	 *
	 * @throws \InvalidArgumentException Thrown if the type of the given arguments are not correct.
	 *
	 * @see MetadataType
	 */
	public function __construct($basename, $path, $type) {

		if(!is_string($basename))
			throw new \InvalidArgumentException("Basename must be of type string.");

		if(!is_string($path))
			throw new \InvalidArgumentException("Path must be of type string.");

		if(!is_string($type))
			throw new \InvalidArgumentException("Type must be of type string.");

		if($type !== MetadataType::FILE && $type !== MetadataType::DIRECTORY)
			throw new \InvalidArgumentException("The metadata type must be TYPE_FILE or TYPE_DIRECTORY but \"$type\" was given.");

		$this->basename = $basename;
		$this->path = $path;
		$this->type = $type;
	}
	
	/**
	 * The name of the directory or file without the full path.
	 *
	 * @return string
	 * @since 5.3
	 */
	public function getBasename() {
		return $this->basename;
	}


	/**
	 * The path to the parent of the file or directory.
	 *
	 * @return string
	 * @since 5.3
	 */
	public function getPath() {
		return $this->path;
	}


	/**
	 * The type of the subject which can be FILE or DIRECTORY.
	 *
	 * @return string
	 * @since 5.3
	 *
	 * @see MetadataType
	 */
	public function getType() {
		return $this->type;
	}
}