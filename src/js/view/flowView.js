"use strict";

var App = App || {};

let FlowView = function(div) {
  let self = {
    div: null,

    scene: null,
    camera: null,
    renderer: null,

    particles: null,
    rotation: null,
    pMaterial: new THREE.PointsMaterial({
      size: .2,
      vertexColors: THREE.VertexColors
      // color: 0x888888
    })
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
    var axisHelper = new THREE.AxisHelper(5);
    self.scene.add(axisHelper);

    self.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    self.camera.position.x = 13;
    self.camera.position.z = 5;
    self.camera.position.y = 7;

    self.camera.lookAt(new THREE.Vector3(0, 4, 0));

    self.renderer = new THREE.WebGLRenderer();
    self.renderer.setSize(width, height);

    elemNode.appendChild(self.renderer.domElement);

    createSlabBox();

    render();
  }

  function createSlabBox() {
    var box = new THREE.BoxGeometry(10, 10, 1);
    var geo = new THREE.EdgesGeometry(box); // or WireframeGeometry( geometry )

    var mat = new THREE.LineBasicMaterial({
      color: 0x959595,
    });

    var wireframe = new THREE.LineSegments(geo, mat);

    wireframe.position.y = 5;

    self.scene.add(wireframe);
  }

  function setupMouseEventHandlers() {
    
  }

  function updateData(dataPoints) {
    let particleRotation = 0;

    if (self.particles) {
      particleRotation = self.particles.rotation.y;
      self.scene.remove(self.particles);
    }

    let stats = App.models.simulationData.getStats();

    self.currentPointData = _.filter(Object.values(dataPoints), function(p) {
      return p.conc > stats.mean + stats.stdDev / 8;
    });

    let points = new THREE.Geometry();

    for (let point of self.currentPointData) {
      points.vertices.push(new THREE.Vector3(point.pos.x, point.pos.y, point.pos.z));
      points.colors.push(new THREE.Color(App.views.flowLegend.getColorOf(point.conc)));
    }

    self.particles = new THREE.Points(
      points,
      self.pMaterial);

    self.particles.rotation.y = particleRotation;

    self.scene.add(self.particles);
  }

  function render() {
    if (self.particles) {
      self.particles.rotation.y += 0.01;
    }

    self.renderer.render(self.scene, self.camera);

    setTimeout(function() {
      render();
    }, 30)
  }

  function setBackgroundColor(color) {
    self.scene.background = new THREE.Color(color);
  }

  function recolor(colorScale) {
    self.particles.geometry.colors = [];
    for (let point of self.currentPointData) {
      self.particles.geometry.colors.push(new THREE.Color(colorScale(point.conc)));
    }

    self.particles.geometry.colorsNeedUpdate = true;

    self.scene.remove(self.particles);
    self.scene.add(self.particles);
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
    setBackgroundColor,
    recolor,
    resize
  };
};
