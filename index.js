import Backbone from 'backbone';
import d3 from 'd3';

import template from './index.html';
import './style.css';

// Our main view that coordinates each big chunk
let MainPage = Backbone.View.extend({
  initialize: function () {
    // Respond to resize events
    window.onresize = () => {
      this.render();
      this.trigger('db:resizeWindow');
    };
  },
  render: function () {
    /*
      Because each of the big chunks of the page
      refer directly to window.mainPage, we don't
      actually add them until we call render()
    */
    if (!this.addedTemplate) {
      this.$el.html(template);

      let self = this;
      d3.select('body')
        .on('mouseover', function () {
          // this refers to the DOM element
          self.changeHighlight.call(this, undefined);
        })
        .on('click', function () {
          // this refers to the DOM element
          self.changeSelection.call(this, undefined);
        });

      this.addedTemplate = true;
    }
  }
});

window.mainPage = new MainPage({
  el: 'body'
});

// Initialize the rendered chunks of the page
window.mainPage.render();
