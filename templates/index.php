<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Gaia</title>
    <link rel="stylesheet" type="text/css" media="all" href="assets/css/style.css">
    <script src="assets/js/jquery.js" type="text/javascript"></script>
    <script src="assets/js/underscore.js" type="text/javascript"></script>
    <script src="assets/js/backbone.js" type="text/javascript"></script>
    <script src="assets/js/map.js" type="text/javascript"></script>
    <script src="assets/js/game.js" type="text/javascript"></script>
    <script src="assets/js/router.js" type="text/javascript"></script>
  </head>
  <body>
    <script id="info-table-template" type="text/template">
      <tr>
        <th>Turn</th>
        <td><%= turn_counter %></td>
      </tr>
      <tr>
        <th>Atmospheric CO2 (ppm)</th>
        <td><%= co2 %></td>
      </tr>
      <tr>
        <th>Average Temperature</th>
        <td><%= temperature %></td>
      </tr>
      <tr>
        <th>Total Number of Organisms</th>
        <td><%= organisms %></td>
      </tr>
    </script>
    <h1 id="primary-title">Gaia</h1>
  </body>
</html>