"use strict";

var App = App || {};

let FlowSlabController = function(div) {
  let self = {
    div: null
  };

  init();

  function init() {
    self.div = d3.select(div);

    setupSVG();
    createSlider();
  }

  function setupSVG() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.sliderSVG = self.div
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height].join(" "));
  }

  function createSlider() {
    var svg = self.sliderSVG,
      margin = {
        right: 10,
        left: 10
      },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height");

    var x = d3.scaleLinear()
      .domain([-5, 5])
      .range([0, width])
      .clamp(true);

    var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

    slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-inset")
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-overlay")
      .call(d3.drag()
        .on("start.interrupt", function() {
          slider.interrupt();
        })
        .on("start drag", onSlide));

    slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(x.ticks(10))
    .enter().append("text")
      .attr("x", x)
      .attr("text-anchor", "middle")
      // .style("fill", "white")
      .text(function(d) {
        return d;
      });

    var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

    handle.transition() // Gratuitous intro!
      .duration(750)
      .attr("cx", x(0));

    function onSlide() {
      handle.attr("cx", x(x.invert(d3.event.x)));

      let zVal = x.invert(d3.event.x);
      slabMoved(zVal);
    }
  }


  function slabMoved(newZ) {
    App.views.flow.updateSlabPosition(newZ);

    slabUpdated();
  }

  // the slab may be updated by rotation so route this interaction information
  // into this controller function
  function slabUpdated() {
    App.views.flow.calculateSlabbedPoints();

    App.views.flow.changeColorScale(App.views.flowLegend.getColorOf);

    let slabData = App.views.flow.getSlabbedPoints();

    App.views.slabs.updateViewsWithNewSlab(slabData, App.views.flowLegend.getColorOf);
  }

  return {
    slabUpdated
  };
};
