<?php declare(strict_types=1);
/******************************************************************************
 *
 * This file is part of ILIAS, a powerful learning management system.
 *
 * ILIAS is licensed with the GPL-3.0, you should have received a copy
 * of said license along with the source code.
 *
 * If this is not the case or you just want to try ILIAS, you'll find
 * us at:
 *      https://www.ilias.de
 *      https://github.com/ILIAS-eLearning
 *
 *****************************************************************************/

include_once './Services/Context/classes/class.ilContext.php';
ilContext::init(ilContext::CONTEXT_SCORM);

require_once("Services/Init/classes/class.ilInitialisation.php");
ilInitialisation::initILIAS();

const LTI_1_3_KID='lti_1_3_kid';
const LTI_1_3_PRIVATE_KEY='lti_1_3_privatekey';
const ERROR_OPEN_SSL_CONF='error openssl config invalid';

function verifyPrivateKey() : string 
{
    global $ilSetting;
    $key = $ilSetting->get(LTI_1_3_PRIVATE_KEY);

    if (empty($key)) 
    {
        $kid = bin2hex(openssl_random_pseudo_bytes(10));
        $ilSetting->set(LTI_1_3_KID,$kid);
        $config = array(
            "digest_alg" => "sha256",
            "private_key_bits" => 2048,
            "private_key_type" => OPENSSL_KEYTYPE_RSA,
        );
        $res = openssl_pkey_new($config);
        openssl_pkey_export($res, $privatekey);
        if (!empty($privatekey)) {
            $ilSetting->set(LTI_1_3_PRIVATE_KEY,$privatekey);
        } 
        else
        {
            return ERROR_OPEN_SSL_CONF;
        }
    }
    return '';
}

function getPrivateKey() : array 
{
        global $ilSetting;
        $privatekey = $ilSetting->get(LTI_1_3_PRIVATE_KEY);
        $kid = $ilSetting->get(LTI_1_3_KID);
        return [
            "key" => $privatekey,
            "kid" => $kid
        ];
}

function getJwks() : array 
{
    $jwks = array('keys' => array());

    $privatekey = getPrivateKey();
    $res = openssl_pkey_get_private($privatekey['key']);
    $details = openssl_pkey_get_details($res);

    $jwk = array();
    $jwk['kty'] = 'RSA';
    $jwk['alg'] = 'RS256';
    $jwk['kid'] = $privatekey['kid'];
    $jwk['e'] = rtrim(strtr(base64_encode($details['rsa']['e']), '+/', '-_'), '=');
    $jwk['n'] = rtrim(strtr(base64_encode($details['rsa']['n']), '+/', '-_'), '=');
    $jwk['use'] = 'sig';

    $jwks['keys'][] = $jwk;
    return $jwks;
}

if (!empty(verifyPrivateKey()))
{
    echo ERROR_OPEN_SSL_CONF;
}

@header('Content-Type: application/json; charset=utf-8');
echo json_encode(getJwks(), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);

?>