"use strict";

var App = App || {};

let FlowView = function(div) {
  let self = {
    div: null,
    currentPointData: null,

    scene: null,
    camera: null,
    renderer: null,

    particles: null,
    rotation: 0,
    pMaterial: new THREE.PointsMaterial({
      size: .2,
      vertexColors: THREE.VertexColors
    }),

    slabZ: 0,
    slab: null,
    slabbedPoints: null,

    cameraDistance: 15,
    cameraAngle: Math.PI/4,
    cameraHeight: 7,

    flowColorMode: "all" // "all", "desaturate", "highlight", "fingers"
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
    updateCameraPosition();

    self.renderer = new THREE.WebGLRenderer();
    self.renderer.setSize(width, height);

    elemNode.appendChild(self.renderer.domElement);

    createSlabBox();
    setupMouseEventHandlers();

    render();
  }

  function createSlabBox() {
    var box = new THREE.BoxGeometry(10, 10, 1);
    var geo = new THREE.EdgesGeometry(box); // or WireframeGeometry( geometry )

    var mat = new THREE.LineBasicMaterial({
      color: 0x959595,
    });

    self.slab = new THREE.LineSegments(geo, mat);

    self.slab.position.y = 5;
    self.scene.add(self.slab);
  }

  function setupMouseEventHandlers() {
    let elem = self.renderer.domElement;

    let prevPosition = null;
    let movementType = null;

    // movement multipliers for the deltas provided by mouse events
    let panUDCoeff = 0.05;
    let panLRCoeff = -0.005;
    let zoomCoeff = 1/250;

    let rotateLRCoeff = 0.005;

    let cameraHeightRange = [0, 14];
    let cameraDistanceRange = [5, 20];

    elem.oncontextmenu = function(e) {
      // block context menu on right click
      return false;
    }

    elem.onmousedown = function(e) {
      if (e.button === 0) {
        movementType = "pan";

        // change cursor
        elem.style.cursor = "move";
      } else if (e.button === 2) {
        e.preventDefault();
        movementType = "rotate";

        // change cursor
        elem.style.cursor = "ew-resize";
      }

      prevPosition = {
        x: e.clientX,
        y: e.clientY
      };
    };

    elem.onmousemove = function (e) {
      if (movementType) {
        let delt = {
          x: e.clientX - prevPosition.x,
          y: e.clientY - prevPosition.y
        };

        if (movementType === "pan") {
          self.cameraAngle += delt.x * panLRCoeff;
          self.cameraHeight += delt.y * panUDCoeff;

          // clamp height into bounds
          if (self.cameraHeight < cameraHeightRange[0]) {
            self.cameraHeight = cameraHeightRange[0];
          } else if (self.cameraHeight > cameraHeightRange[1]) {
            self.cameraHeight = cameraHeightRange[1];
          }

          updateCameraPosition();

        } else if (movementType === "rotate") {
          self.rotation += (delt.x * rotateLRCoeff);
          self.particles.rotation.y = self.rotation;

          App.controllers.flowSlab.slabUpdated();
        }

        render();

        // update prev position
        prevPosition = {
          x: e.clientX,
          y: e.clientY
        };
      }

    };

    elem.onmouseup = function(e) {
      elem.style.cursor = "default";

      // will need to refresh slice
      if (movementType === "rotate") {
        App.controllers.flowSlab.slabUpdated();
      }

      movementType = null;
    };

    elem.onwheel = function(e) {
      self.cameraDistance += e.deltaY * zoomCoeff;

      // clamp zoom into bounds
      if (self.cameraDistance < cameraDistanceRange[0]) {
        self.cameraDistance = cameraDistanceRange[0];
      } else if (self.cameraDistance > cameraDistanceRange[1]) {
        self.cameraDistance = cameraDistanceRange[1];
      }

      updateCameraPosition();
      render();
    };
  }

  function updateCameraPosition() {

    let cameraVector = new THREE.Vector3(0, self.cameraHeight, self.cameraDistance);
    cameraVector.applyAxisAngle(new THREE.Vector3(0,1,0), self.cameraAngle);

    self.camera.position.set(cameraVector.x, cameraVector.y, cameraVector.z);

    self.camera.lookAt(new THREE.Vector3(0, 7, 0));

  }

  function updateData(dataPoints) {
    if (self.particles) {
      self.scene.remove(self.particles);
    }

    let stats = App.models.simulationData.getStats();

    self.allPointData = Object.values(dataPoints);

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

    self.particles.rotation.y = self.rotation;

    self.scene.add(self.particles);

    render();
  }

  function updateSlabPosition(z) {
    self.slabZ = z;
    self.slab.position.z = z;
  }

  function calculateSlabbedPoints() {
    let sinCalc = Math.sin(self.rotation);
    let cosCalc = Math.cos(self.rotation);

    self.slabbedPoints = {};

    for (let point of self.allPointData) {
      let rotatedXZ = rotatePoint(point.pos);

      if (rotatedXZ.z < self.slabZ + 0.5 && rotatedXZ.z > self.slabZ - 0.5) {
        self.slabbedPoints[point.id] = {
          id: point.id,
          conc: point.conc,
          pos: rotatedXZ,
          vel: rotatePoint(point.vel)
        };

        self.slabbedPoints[point.id].pos.y = point.pos.y;
        self.slabbedPoints[point.id].vel.y = point.vel.y;
      }
    }

    render();

    function rotatePoint(p) {
      let x = p.x, z = p.z;

      return {
        x: (cosCalc * x) + (sinCalc * z),
        z: (cosCalc * z) - (sinCalc * x)
      };
    }
  }

  function getSlabbedPoints() {
    return self.slabbedPoints;
  }

  function render() {
    self.renderer.render(self.scene, self.camera);
  }

  function setBackgroundColor(color) {
    self.scene.background = new THREE.Color(color);
  }

  function setFlowColorMode(value) {
    self.flowColorMode = value;
  }

  function changeColorScale(colorScale) {
    recolorPoints(getPointColor);
    render();

    // wrapper around the if statements to get the color of a point based on mode
    function getPointColor(point) {
      let pointColor = new THREE.Color(colorScale(point.conc));

      if (self.flowColorMode === "all") {
        return pointColor;
      } else if (self.flowColorMode === "desaturate") {
        return (self.slabbedPoints[point.id] ? pointColor : pointColor.offsetHSL(0, -1, 0));
      } else if (self.flowColorMode === "highlight") {
        return (self.slabbedPoints[point.id] ? pointColor.offsetHSL(0, 0, 0.25) : pointColor);
      } else if (self.flowColorMode === "fingers") {

      }

      return pointColor;
    }
  }

  function recolorPoints(colorFunc) {
    self.particles.geometry.colors = [];
    for (let point of self.currentPointData) {
      self.particles.geometry.colors.push(colorFunc(point));
    }

    self.particles.geometry.colorsNeedUpdate = true;
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
    setFlowColorMode,
    calculateSlabbedPoints,
    getSlabbedPoints,
    updateSlabPosition,
    changeColorScale,
    resize
  };
};
