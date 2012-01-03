<?php

$url = $_REQUEST['url'];
$toTc = 'http://www.toneconnect.com/mt/tc.php?url=' . $url;
echo file_get_contents($toTc);
