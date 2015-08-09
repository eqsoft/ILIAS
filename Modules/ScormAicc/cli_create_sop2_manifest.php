<?php
$manifest_string = "CACHE MANIFEST\n\nCACHE:\n";
$appcache = fopen('./sop2/sop2.appcache','w');
$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator('./sop2/'));
foreach($objects as $name => $object) {
	
	if (preg_match('/\/\.+/',$name)) {
		continue;
	}
	
	if (preg_match('/sop2\.appcache/',$name)) {
		continue;
	}
	
	if (preg_match('/sop2_index\.html/',$name)) {
		continue;
	}
	
	$manifest_string .= preg_replace('/^\./','./Modules/ScormAicc',$name) . "\n";
	//echo "$name\n";
}
$manifest_string .= "\nNETWORK:\n*\n";
$manifest_string .= "\n#".date("Y-m-d H:i:s");
fwrite($appcache, $manifest_string);
fclose($appcache);
?>
