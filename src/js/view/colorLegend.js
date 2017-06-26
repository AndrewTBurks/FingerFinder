"use strict";

var App = App || {};

let ColorLegend = function(div) {
  let self = {
    div: null,

    legendCanvas: null,
    legendMinText: null,
    legendMaxText: null,
    legendTitle: null,

    width: null,

    colorScale: null
  };

  init();

  function init() {
    self.div = d3.select(div);
    self.legendMinText = self.div.select("#legendMinValue");
    self.legendMaxText = self.div.select("#legendMaxValue");
    self.legendTitle = self.div.select("#legendTitle");

    self.colorScale = d3.scaleQuantize()
      .domain([0,100]);

    createCanvas();
  }

  function createCanvas() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = self.width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    let canvas = self.legendCanvas = self.div.append("canvas");

    canvas
      .attr("width", width)
      .attr("height", 1)
      .style("width", width + "px")
      .style("height", height + "px");

    let context = canvas.node().getContext("2d"),
      image = context.createImageData(width, 1);

    for (var i = 0, j = -1, /*c,*/ t; i < width; ++i) {
      // c = colors[Math.floor(i / width * colors.length)];
      // image.data[++j] = +("0x" + c.slice(0, 2));
      // image.data[++j] = +("0x" + c.slice(2, 4));
      // image.data[++j] = +("0x" + c.slice(4, 6));
      image.data[++j] = "0x" + Math.floor((i/width) * 255).toString(16);
      image.data[++j] = "0x" + Math.floor(255 - ((i/width) * 255)).toString(16);
      image.data[++j] = +("0xab");
      image.data[++j] = 255;
    }

    context.putImageData(image, 0, 0);
  }

  function setTitle(title) {
    self.legendTitle.text(title);
  }

  function setColors(colorRange) {
    let width = self.width,
      context = self.legendCanvas.node().getContext("2d"),
      image = context.createImageData(width, 1);

    self.legendCanvas
      .attr("width", width);

    for (var i = 0, j = -1, c, t; i < width; ++i) {
      c = colorRange[Math.floor(i / width * colorRange.length)];
      image.data[++j] = +("0x" + c.slice(0, 2));
      image.data[++j] = +("0x" + c.slice(2, 4));
      image.data[++j] = +("0x" + c.slice(4, 6));
      // image.data[++j] = "0x" + Math.floor((i/width) * 255).toString(16);
      // image.data[++j] = "0x" + Math.floor(255 - ((i/width) * 255)).toString(16);
      // image.data[++j] = +("0xab");
      image.data[++j] = 255;
    }

    context.putImageData(image, 0, 0);

    self.colorScale.range(colorRange);
  }

  function setExtents(scaleExtents) {
    self.legendMinText.text(scaleExtents[0].toFixed(2));
    self.legendMaxText.text(scaleExtents[1].toFixed(2));

    self.colorScale.domain(scaleExtents);
  }

  function resize() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = self.width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.legendCanvas
    .style("width", width + "px")
    .style("height", height + "px");
  }

  function getColorOf(value) {
    return "#" + self.colorScale(value);
  }

  return {
    setTitle,
    setColors,
    getColorOf,

    setExtents,
    resize
  };
};
