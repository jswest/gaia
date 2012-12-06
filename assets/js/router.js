$(document).ready( function() {
  
  window.AppRouter = Backbone.Router.extend({
    routes: {
      '': 'map',
      'start': 'start',
      'turn/:turn': 'next_turn'
    },
    map: function() {
      window.info_table = new window.InfoTable({
        temperature: 0,
        organisms: 0,
        turn_counter: 0,
        co2: 300,
        co2_decay_per_turn: 51,
        median_solar_output: 3,
        solar_output_change: 1,
        chance_of_water: 0.51,
        number_of_spaces: 50,
      });
      window.info_table_view = new window.InfoTableView({ model: window.info_table });
      window.gaia = new window.Gaia();
      window.gaia_view = new window.GaiaView({ model: window.gaia });
      window.gaia_view.render();
      window.time_controls = new window.TimeControlsView();
      window.time_controls.render();
      window.info_table_view.render();

    },
    start: function() {
      if( $('#gaia').length > 0 ) {
        window.info_table.next_turn();
        window.gaia_view.begin_life();
        window.time_controls.render();
        window.info_table_view.render();
      } else {
        Backbone.history.navigate( '', true );
      }
    },
    next_turn: function() {
      if( $('#gaia').length > 0 ) {
        window.info_table.next_turn();
        window.gaia_view.next_turn();
      } else {
        Backbone.history.navigate( '', true );
      }
    }
  });
  
  var router = new window.AppRouter();
  Backbone.history.start();
  
});