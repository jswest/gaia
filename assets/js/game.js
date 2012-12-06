$(document).ready( function() {
  
  window.TimeControlsView = Backbone.View.extend({
    tagName: 'ul',
    id: 'time-controls',
    initialize: function() {
      _.bindAll( this, 'render' );
    },
    render: function() {
      if( $('#time-controls').length > 0 ) {
        $('#time-controls').remove();
      }
      $('body').append( $(this.el) );
      $(this.el).html( '' );
      if( window.info_table.get( 'turn_counter' ) > 0 ) {
        next_button_view = new NextButtonView();
        next_button_view.render();
        run_button_view = new RunButtonView();
        run_button_view.render();
      } else {
        start_button_view = new StartButtonView();
        start_button_view.render();
      }
    }
  });
  window.StartButtonView = Backbone.View.extend({
    tagName: 'li',
    id: 'start-button',
    events: {
      'click': 'click_event'
    },
    initialize: function() {
      _.bindAll( this, 'render', 'click_event' );
    },
    render: function() {
      $(this.el).html( 'Start' );
      $('#time-controls').append( $(this.el) );
    },
    click_event: function() {
      Backbone.history.navigate( '#start', true );
    }
  });
  window.NextButtonView = Backbone.View.extend({
    tagName: 'li',
    id: 'next-button',
    events: {
      'click': 'click_event'
    },
    initialize: function() {
      _.bindAll( this, 'render', 'click_event' );
    },
    render: function() {
      $(this.el).html( 'Next' );
      $('#time-controls').append( $(this.el) );
    },
    click_event: function() {
      Backbone.history.navigate( '#turn/' + window.info_table.get( 'turn_counter' ), true );
    }
  });
  window.RunButtonView = Backbone.View.extend({
    tagName: 'li',
    id: 'run-button',
    events: {
      'click': 'click_event'
    },
    initialize: function() {
      _.bindAll( this, 'render', 'click_event' );
    },
    render: function() {
      $(this.el).html( 'Run' );
      $('#time-controls').append( $(this.el) );
    },
    click_event: function() {
      var automate = function() {
        window.t = setTimeout( function() {
          Backbone.history.navigate( '#turn/' + window.info_table.get( 'turn_counter' ), true );
          automate();
        }, 1000 );
      }
      automate();
    }
  });
  window.InfoTable = Backbone.Model.extend({
    initialize: function() {
      _.bindAll( this, 'next_turn' );
    },
    next_turn: function() {
      var turn = this.get( 'turn_counter' );
      turn++;
      console.log( "turn: " + turn );
      this.set( 'turn_counter', turn );
    }
  });
  window.InfoTableView = Backbone.View.extend({
    tagName: 'table',
    id: 'info-table',
    render: function() {
      $(this.el).remove();
      var template = _.template( $('#info-table-template').html(), this.model.toJSON() );
      $('body').append( $(this.el).html( template ) );
    }
  });
});