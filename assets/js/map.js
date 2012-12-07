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
      var spaces = this.model.get( 'spaces' );
      var temperatures = [];
      var organisms = [];
      var plants = [];
      var animals = [];
      var co2 = window.info_table.get( 'co2' );
      for( var i = 0; i < spaces.length; i++ ) {
        for( var j = 0; j < spaces[i].length; j++ ) {
          
          var space = spaces[i][j]
          
          // add this space's temperature to the temperatures array.
          temperatures.push( space.temperature() );
          
          // add or remove life if you can.
          // If it can support life, and it's empty, add a plant.
          if( space.life_possible() == true && space.get( 'life' ).length == 0 ) {
            space.add_life( new BasicPlant() );
                    
          // Else if there's life, and it's not empty, eat and reproduce.   
          } else if( space.life_possible() == true && space.get( 'life' ).length > 0 ) {
            var existant_life = space.get( 'life' );
            var life = [];
            var life_in_chain = [ [], [] ]; 
            
            // let them eat cake/other animals
            // first, sort them by chain...
            for( var q = 0; q < existant_life.length; q++ ) {
              var organism = existant_life[q];
              var organism_chain_location = organism.get( 'chain_location' );
              life_in_chain[organism_chain_location].push( organism );              
            }

            if( life_in_chain[1].length > 0 ) {
              // then, iterate over the predators...
              for( var q = 1; q < life_in_chain.length; q++ ) {
                for( var r = 0; r < life_in_chain[q].length; r++ ) {
              
                  // and if they can eat, let them.
                  var predator = life_in_chain[q][r]
                  if( life_in_chain[q - 1].length > predator.get( 'eating_factor' ) ) {
                    life_in_chain[q - 1].splice( 0, predator.get( 'eating_factor' ) );
                    life.push( predator )
                
                  } // else it dies...
                }
              }
            // Else (there are no predtors present)
            } else {
                            
              // If plant life is of a signifigant enough complexity, add a new animal!
              if( life_in_chain[0].length >= 4 ) {
                life.push( new BasicAnimal() );
              }
            }
                        
            // now, push the remaining plant life.
            for( var q = 0; q < life_in_chain[0].length; q++ ) {
              life.push( life_in_chain[0][q] );
            }
            
            // and be fruitful and multiply!
            var new_life = [];
            for( var q = 0; q < life.length; q++ ) {
              var organism = life[q];
              var rf = organism.get( 'reproduction_factor' );
              for( var r = 0; r < rf; r++ ) {
                if( organism.get( 'chain_location' ) == 0 ) {
                  new_life.push( new BasicPlant() );
                } else if( organism.get( 'chain_location' ) == 1 ) {
                  new_life.push( new BasicAnimal() );
                } else {
                  // silence is golden.
                }
              }
            }
            
            // kill the spare!
            while( new_life.length > 40 ) {
              var rando = Math.round( Math.random() * (new_life.length - 1) );
              new_life.splice( rando, 1 );
            }
            
            // housekeeping: deal with c02, and the organisms counter
            for( var q = 0; q < new_life.length; q++ ) {
              var organism = new_life[q];
              if( organism.get( 'chain_location' ) == 0 ) {
                plants.push( organism );
              } else if( organism.get( 'chain_location' ) == 1 ) {
                animals.push( organism );
              } else {
                // silence is golden
              }
              organisms.push( organism );
              if( space.get( 'is_water_space') == true ) {
                co2 = co2 + organism.get( 'water_co2_output_per_turn' );
                co2 = co2 - organism.get( 'water_co2_fixing_per_turn' );
              } else {
                co2 = co2 + organism.get( 'land_co2_output_per_turn' );
                co2 = co2 - organism.get( 'land_co2_fixing_per_turn' );             
              }
            }
            
            space.set( 'life', new_life );
            space.trigger( 'change:life' );
            
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
      window.info_table.set( 'co2', co2 );
      window.info_table.set( 'organisms', organisms.length );
      window.info_table.set( 'plants', plants.length );
      window.info_table.set( 'animals', animals.length );
      window.info_table_view.render();
    }
  });
  window.Space = Backbone.Model.extend({
    events: {
      'mouseover': 'mouseover_event'
      'mouseout': 'mouseout_event'
    }
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
    add_life: function( life_object ) {
      var life = []
      this.get( 'life' ).push( life_object );
      this.trigger( 'change:life' );
    },
    mouseover_event: function() {
      
    },
    mouseout_event: function() {
      
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
      chain_location: 0,
      land_co2_fixing_per_turn: 0.0005,
      water_co2_fixing_per_turn: 0.00025,
      land_co2_output_per_turn: 0,
      water_co2_output_per_turn: 0,
      reproduction_factor: 3,
      eating_factor: 0 
    }
  });
  window.BasicAnimal = Backbone.Model.extend({
    defaults: {
      chain_location: 1,
      land_co2_fixing_per_turn: 0,
      water_co2_fixing_per_turn: 0,
      land_co2_output_per_turn: 0.001,
      water_co2_output_per_turn: 0.0005,
      reproduction_factor: 2,
      eating_factor: 2
    }
  });
});