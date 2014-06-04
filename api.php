<?php

/*
 * year = 
 * campus = * or Various comma delimited... UPRRP, RUM, RCM, UPRAg, UPRA, UPRP, UPRH, UPR
 */
 
//header('Content-Type: text/html; charset=utf-8');
header('Content-Type: application/json');

$baseScaleIGS = array(array('min' => 0, 'max' => 50),
                   array('min' => 50, 'max' => 100),
                   array('min' => 100, 'max' => 150),
                   array('min' => 150, 'max' => 200),
                   array('min' => 200, 'max' => 250),
                   array('min' => 250, 'max' => 300),
                   array('min' => 300, 'max' => 350),
                   array('min' => 350, 'max' => 400),
                   );

$token = 'JZMCKQSu5u7uPbrExtxFci9fY';

$opts = array(
              'http' => array(
                              'method' => 'GET',
                              'header' => 'X-App-Token: ' . $token
                              )
              );

$context = stream_context_create($opts);
$university = $_GET['uni'];
//printf("%s", $university);
$file = file_get_contents('https://data.pr.gov/resource/admit.json?campus='.$university, false, $context);
$data = json_decode($file);

//var_dump($data[0]);

$out = array();

foreach ($data as $rec) {
    //var_dump($rec['location_1']);
    $igs = $rec->igs;
    $loc = json_decode($rec->location_1->human_address);
    $city = $loc->city;
    
    if ($city == 'CAMU Y') $city = 'CAMUY';
    //var_dump($loc); exit;
    //exit;  
    
    foreach ($baseScaleIGS as $k => $scale) {
        if ($igs >= $scale['min'] && $igs < $scale['max']) {
            if (isset($out[$city][$k])) {
                $out[$city][$k]++;
            } else {
                $out[$city][$k] = 1;
            }
            
            if (isset($out[$city]['QNTY'])) {
                $out[$city]['QNTY']++;
                $out[$city]['SUM'] += $igs;
            } else {
                $out[$city]['QNTY'] = 1;
                $out[$city]['SUM'] = $igs;
                $out[$city]['FULL_LOC'] = $loc;
            }
        }
    }
}

foreach ($out as $city => $info) {
    $out[$city]['AVG'] = $out[$city]['SUM'] / $out[$city]['QNTY'];
}

/*function filtersOK($rec) {
    if ($rec->igs == )
}*/

//echo '<pre>' . print_r($out, true) . '</pre>';

echo json_encode($out);

?>