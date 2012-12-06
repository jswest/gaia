$(document).ready( function() {

  /*-------------------------------------------------
  CROPS
  -------------------------------------------------*/
  window.Veggie = Backbone.Model.extend({});
  window.Wheat = Backbone.Model.extend({});
  window.VeggieView = Backbone.View.extend({
    className: 'veggie',
    initialize: function() {
      _.bindAll( this, 'render' );
    },
    render: function() {
      this.model.get( 'space' ).append( $(this.el) );
    }
  });
  window.WheatView = Backbone.View.extend({
    className: 'wheat',
    initialize: function() {
      _.bindAl( this, 'render' );
    },
    render: function() {
      this.model.get( 'space' ).append( $(this.el) );
    }
  })
  
  /*----------------------------------------------
  SPACES
  ----------------------------------------------*/
  window.Space = Backbone.Model.extend({
    url: function() {
      return '/spaces/' + this.get( 'id' );
    }
  });
  window.SpaceView = Backbone.View.extend({
    className: 'space',
    size: 100,
    events: {
      'click': 'click_event'
    },
    initialize: function() {
      _.bindAll( this, 'render', 'render_crops', 'render_room' );
    },
    render: function() {
      var that = this
      $(this.el).css({
        'top': (that.size + 20) * that.model.get( 'y' ),
        'left': (that.size + 20) * that.model.get( 'x' )
      });
      $('#field').append( $(this.el) );
      if( this.model.get( 'is_developed' ) ) {
        this.render_crops();
        this.render_room();
      }
    },
    render_crops: function() {
      var veggies = this.model.get( 'veggies' );
      var wheat = this.model.get( 'wheat' );
      if( veggies.length > 0 ) {
        var crops = veggies;
      } else if( wheat.length > 0 ) {
        var crops = wheat;
      } else {
        var crops = [] // no crops on this space.
      }
      for( i = 0; i <= crops.length; i++ ) {
        crops[i].render()
      }
    },
    render_room: function() {
      if( this.model.get( 'room' ) ) {
        
      }
    },
    click_event: function() {
      
    }
  });
  
  /*------------------------------------------------
  FIELD
  ------------------------------------------------*/
  window.Field = Backbone.Model.extend({
    initialize: function() {
      var counter = 0;
      var spaces = [];
      for( i = 0; i < 3; i++ ) {
        var row = [];
        for( j = 0; j < 5; j++ ) {
          var space = new Space( { id: counter, x: j, y: i } );
          var space_view = new SpaceView( { model: space } );
          row.push( space_view );
          counter++;
        }
        spaces.push( row );
      }
      this.set( 'spaces', spaces );
    }
  });
  window.FieldView = Backbone.View.extend({
    id: 'field',
    initialize: function() {
      _.bindAll( this, 'render' );
    },
    render: function() {
      $('body').append( $(this.el) )
      var spaces = this.model.get( 'spaces' );
      for( i = 0; i < spaces.length; i++ ) {
        for( j = 0; j < spaces[i].length; j++ ) {
          spaces[i][j].render();
        }
      }
    }
  });


  
});