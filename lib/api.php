<?php

require '../vendor/autoload.php';

use kevinfiol\fuzzget\Fuzz;

$states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

$search = $_GET['term'];

$games = [
    [
        'name' => 'Terranigma',
    ],
    [
        'name' => 'The Legend of Zelda: A Link Between Worlds',
    ],
    [
        'name' => 'Shovel Knight: Treasure Trove',
    ],
    [
        'name' => 'The Legend of Zelda: A Link to the Past',
    ],
    [
        'name' => 'Chrono Trigger',
    ]
];

$fuzz = new Fuzz($games, 3, 1, true);
$temp = $fuzz->search($search, 2);

$res = array_map(function($x) {
    return $x['name'];
}, $temp);

$json = json_encode($res);

echo $json;