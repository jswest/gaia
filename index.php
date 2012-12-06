<?php


require_once 'library/Slim/Slim.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim(
  array(
    'debug' => true
  )
);


/*
 * DEFINE THOSE ROUTES
*/ 
// Root (GET)
$app->get( '/', function() use( $app ) {
  $app->render(
    '/index.php',
    array(),
    200
  );
});

$app->get( '/set_up_spaces/', function() use( $app ) {
});



/*
 * DO IT!
 */
$app->run();
