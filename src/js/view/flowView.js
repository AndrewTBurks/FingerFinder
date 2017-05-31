"use strict";

var App = App || {};

let FlowView = function(div) {
  let self = {
    div: null,

    scene: null,
    camera: null,
    renderer: null
  };

  init();

  function init() {
    self.div = d3.select(div);

    setupRenderer();
  }

  function setupRenderer() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));

    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.scene = new THREE.Scene();
    self.camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

    self.renderer = new THREE.WebGLRenderer();
    self.renderer.setSize(width, height);

    elemNode.appendChild(self.renderer.domElement);
  }

  function updateData(dataPoints) {
    console.log(dataPoints);
  }

  function resize() {
    let elemNode = self.div.node();
    let title = self.div.select(".sectionTitle");

    let width = elemNode.clientWidth;
    let titleHeight = title.node().clientHeight;
    let titleMargin = parseInt(title.style("margin-bottom")) + parseInt(title.style("margin-top"));
    let height = elemNode.clientHeight - titleHeight - titleMargin;

    self.renderer.setSize(width, height);
  }

  return {
    updateViewWithNewData: updateData,
    resize
  };
};
