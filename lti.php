<?php declare(strict_types=1);

/**
 * LTI launch target script
 *
 * @author  Stefan Meyer <smeyer.ilias@gmx.de>
 */
include_once './Services/Context/classes/class.ilContext.php';
ilContext::init(ilContext::CONTEXT_LTI_PROVIDER);

require_once("Services/Init/classes/class.ilInitialisation.php");
ilInitialisation::initILIAS();

// authentication is done here ->
global $DIC;

// lti 1.3
$method = strtoupper($DIC->http()->request()->getMethod());
file_put_contents("log.txt",$method."\n",FILE_APPEND);

if ($method == 'POST') {
    $body = $DIC->http()->request()->getParsedBody();
    file_put_contents("log.txt",var_export($body,true),FILE_APPEND);
    if (!empty($body['lti_message_hint']) && !empty($body['login_hint']) || !empty($body['id_token'])) {
        $dataConnector = ilLTIDataConnector::getDataConnector();
        $tool = new ilLTITool($dataConnector);
        $tool->handleRequest();
    }
    else {
        $DIC->ctrl()->setCmd('doLTIAuthentication');
        $DIC->ctrl()->setTargetScript('ilias.php');
        $DIC->ctrl()->callBaseClass('ilStartUpGUI');
    }
}
