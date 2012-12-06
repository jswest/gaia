$(document).ready( function() {

  window.Gaia = Backbone.Model.extend({
    initialize: function() {
      // Create the spaces array.
      var spaces = [];
      // iterate through the 10 rows.
      for( var i = 0; i < window.info_table.get( 'number_of_spaces' ); i++ ) {
        var row = [];
        // determine which "band" we're in.
        if( i < window.info_table.get( 'number_of_spaces' ) / 2 ) {
          var band_int = i
        } else {
          var band_int = Math.abs( i - window.info_table.get( 'number_of_spaces' ) - 1 );
        }
        // iterate through the 10 spaces and create the space objects.
        for( var j = 0; j < window.info_table.get( 'number_of_spaces' ); j++ ) {
          var space = new Space({ life: [] });
          space.set( 'band', band_int );
          row.push( space );
        }
        // add the row to the spaces array.
        spaces.push( row );
      }
      // Actually set the spaces array.
      this.set( 'spaces', spaces )
    }
  });
  window.GaiaView = Backbone.View.extend({
    id: 'gaia',
    initialize: function() {
      _.bindAll( this, 'render', 'begin_life' );
    },
    render: function() {
      var spaces = this.model.get( 'spaces' );
      $('body').append( $(this.el) );
      for( var i = 0; i < spaces.length; i++ ) {
        for( var j = 0; j < spaces[i].length; j++ ) {
          num_water = 0;
          num_land = 0;
          for( var x = i - 1; x <= i + 1; x++ ) {
            for( var y = j - 1; y <= j + 1; y++ ) {
              if( x < 0 ) {
                var cx = spaces.length - 1;
              } else if( x >= spaces.length ) { 
                var cx = 0;
              } else {
                var cx = x;
              }
              if( y < 0 ) {
                var cy = spaces[cx].length - 1;
              } else if( y >= spaces[cx].length ) {
                var cy = 0;
              } else {
                var cy = y;
              }
              if( spaces[cx][cy].get( 'is_water_space' ) == true ) {
                num_water++;
              } else {
                num_land++;
              }
            }
          }
          if( num_water > num_land ) {
            spaces[i][j].set( { 'is_water_space': true }, { silent: true } );            
          } else {
            spaces[i][j].set( { 'is_water_space': false }, { silent: true } );
          }
          
          var space_view = new SpaceView( { model: spaces[i][j] } );
          space_view.render();
        }
      }
    },
    begin_life: function() {
      var spaces = this.model.get( 'spaces' );
      var randox = Math.round( Math.random() * (spaces.length - 1) );
      var randoy = Math.round( Math.random() * (spaces.length - 1) );
      var life = spaces[randox][randoy].get( 'life' );
      //life.push( new window.BasicPlant() );
      spaces[randox][randoy].set( 'life', life );
      spaces[randox][randoy].trigger( 'change:life' );
    },
    next_turn: function() {
      var spaces_with_life = 0;
      var spaces = this.model.get( 'spaces' );
      var organisms = [];
      var temperatures = [];
      for( var i = 0; i < spaces.length; i++ ) {
        for( var j = 0; j < spaces[i].length; j++ ) {
          
          var space = spaces[i][j]
          
          // add this space's life to the organisms array.
          if( space.get( 'life' ).length > 0 ) {
            spaces_with_life++;
            for( var q = 0; q < space.get( 'life' ).length; q++ ) {
              organisms.push( space.get( 'life' )[q] );
            }
          }
          
          // add this space's temperature to the temperatures array.
          temperatures.push( space.temperature() );
          
          // add or remove life if you can.
          if( space.life_possible() == true ) {
            space.add_life();
          } else {
            space.set( 'life', [] );
            space.trigger( 'change:life' );
          }
        }
      }
      
      // get and print the average temperature.
      var rt = 0;
      for( i = 0; i < temperatures.length; i++ ) {
        rt = rt + temperatures[i];
      }
      var average_temperature = rt / temperatures.length;
      window.info_table.set( 'temperature', average_temperature );
      
      // get and print the co2 level. 
      var added_co2 = 0;
      for( i = 0; i < organisms.length; i++ ) {
        added_co2 = added_co2 + organisms[i].get( 'co2_output_per_turn' )
      }
      var co2 = window.info_table.get( 'co2' );
      var decay = window.info_table.get( 'co2_decay_per_turn' );
      co2 = co2 + added_co2 - decay;
      window.info_table.set( 'co2', co2 );
      window.info_table.set( 'organisms', organisms.length );
      window.info_table_view.render();
    }
  });
  window.Space = Backbone.Model.extend({
    initialize: function() {
      _.bindAll( this, 'temperature', 'life_possible' );
      if( Math.random() <= window.info_table.get( 'chance_of_water' ) ) {
        this.set( 'is_water_space', true );
      } else {
        this.set( 'is_water_space', false );
      }
    },
    has_life: function() {
      if( this.get( 'life' ).length > 0 ) {
        return true;
      } else {
        return false;
      }
    },
    temperature: function() {
      var co2 = window.info_table.get( 'co2' );
      var so = this.get( 'band' );
      return ( co2 * so ) / 90;
    },
    life_possible: function() {
      if( this.temperature() > 110 || this.temperature() < 32 ) {
        return false;
      } else {
        return true;
      }
    },
    add_life: function() {
      var life = []
      this.get( 'life' ).push( new window.BasicPlant() );
      this.trigger( 'change:life' );
    }
  });
  window.SpaceView = Backbone.View.extend({
    className: 'space',
    initialize: function() {
      //alert( "space view initialized!" );
      this.model.on( 'change:life', this.life_changed, this );
      _.bindAll( this, 'render', 'life_changed' );
    },
    render: function() {
      //alert( "space view render called!" );
      if( this.model.get('is_water_space') == true ) {
        $(this.el).addClass( 'water' );
      } else {
        $(this.el).addClass( 'land' );
      }
      if( this.model.get('has_life') == true ) {
        $(this.el).addClass( 'life' );
      }
      $('#gaia').append( $(this.el) );
    },
    life_changed: function() {
      //alert( "space view life changed called!" );
      if( this.model.get( 'life' ).length > 0 ) {
        $(this.el).addClass( 'life' );
      } else {
        $(this.el).removeClass( 'life' );
      }
    }
  });
  window.BasicPlant = Backbone.Model.extend({
    defaults: {
      co2_output_per_turn: 0.0096
    }
  });
});