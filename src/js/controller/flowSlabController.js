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

    var sliderx = d3.scaleLinear()
      .domain([-4.5, 4.5])
      .range([x(-4.5), x(4.5)])
      .clamp(true)

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
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .text(function(d) {
        return d;
      });

    var handle = slider.insert("g", ".track-overlay")
      .attr("class", "handle");

    let handleWidth = x(1) - x(0);

    handle
      .append("rect")
      .attr("class", "extents")
      .attr("x", -handleWidth/2)
      .attr("y", -9)
      .attr("width", handleWidth)
      .attr("height", 18);

    handle
      .append("rect")
      .attr("class", "center")
      .attr("x", -2)
      .attr("y", -11)
      .attr("width", 4)
      .attr("height", 22);

    handle
      .append("text")
      .attr("class", "sliderPos")
      .attr("text-anchor", "middle")
      .attr("y", -18)
      .text("0.00");

    handle.transition() // Gratuitous intro
      .duration(750)
      .attr("transform", "translate(" + x(0) + ",0)")

    function onSlide() {
      let sliderXcoord = sliderx(x.invert(d3.event.x));
      let zVal = x.invert(sliderXcoord);

      handle.attr("transform", "translate(" + sliderXcoord + ", 0)");
      handle.select(".sliderPos").text(zVal.toFixed(2));

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

  function resize() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.sliderSVG
      .attr("width", width)
      .attr("height", height);
  }

  return {
    slabUpdated,
    resize
  };
};
