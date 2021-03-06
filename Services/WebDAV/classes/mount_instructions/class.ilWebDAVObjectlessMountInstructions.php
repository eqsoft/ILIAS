<?php


class ilWebDAVObjectlessMountInstructions extends ilWebDAVBaseMountInstructions
{
    public function __construct(ilWebDAVMountInstructionsRepository $a_repo,
        ilWebDAVUriBuilder $a_uri_builder,
        ilSetting $a_settings,
        String $language)
    {
        $this->language = $language;
        parent::__construct($a_repo, $a_uri_builder, $a_settings, $ilLang);
    }

    protected function fillPlaceholdersForMountInstructions(array $mount_instructions) : array
    {
        return $mount_instructions;
    }
}