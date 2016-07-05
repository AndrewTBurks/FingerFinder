/**
* @file <p>Visualization of particular ensembles to identify viscous fingers.</p>
* <p>Scientific Visualization Contest 2016</p>
* <p>EVL - University of Illinois at Chicago
* @author Andrew Burks
* @author Cassiano Sugiyama
*/

// constants for width and height of the scene
var WIDTH = 450,
HEIGHT = 632;
var WIDTH_SLICE = 380;
var folderPath = "clean.44/";
var numFiles = 121;
// Range of file data available
var startFile = 23;
var endFile = 45;

var data = [];
var clusterData = [];
var fingersOverTime;

var keyboard = new THREEx.KeyboardState();
var sliceWidth;
var sliceGroup;

// number of blocks in the slice
var sliceResolution = 50;
var sliced = [];
var sliceAccumulated = [];
var colorSchemeChoice = 3;

/**
* <p>Used to select the coloring mode for the 3D cylinder view.</p>
* <p>0 for Normal, 1 for desaturate outside of slice, 2 for highlight slice, 3 for highlight fingers.</p>
* @type {number}
*/
var sliceColorMode = Number(d3.select('input[name="viewCylinder"]:checked').node().value);

for(var i = 0; i < sliceResolution; i++) {
	sliceAccumulated.push(new Array(sliceResolution));
	for(var j = 0; j < sliceResolution; j++) {
		sliceAccumulated[i][j] = {x: i, y: j, conc: 0 , vel: new THREE.Vector3(0,0,0)};
	}
}

/**
* List containing different color schemes for the visualization.
* @type {list}
*/
var colorScheme = ["000004,010005,010106,010108,020109,02020b,02020d,03030f,030312,040414,050416,060518,06051a,07061c,08071e,090720,0a0822,0b0924,0c0926,0d0a29,0e0b2b,100b2d,110c2f,120d31,130d34,140e36,150e38,160f3b,180f3d,19103f,1a1042,1c1044,1d1147,1e1149,20114b,21114e,221150,241253,251255,271258,29115a,2a115c,2c115f,2d1161,2f1163,311165,331067,341069,36106b,38106c,390f6e,3b0f70,3d0f71,3f0f72,400f74,420f75,440f76,451077,471078,491078,4a1079,4c117a,4e117b,4f127b,51127c,52137c,54137d,56147d,57157e,59157e,5a167e,5c167f,5d177f,5f187f,601880,621980,641a80,651a80,671b80,681c81,6a1c81,6b1d81,6d1d81,6e1e81,701f81,721f81,732081,752181,762181,782281,792282,7b2382,7c2382,7e2482,802582,812581,832681,842681,862781,882781,892881,8b2981,8c2981,8e2a81,902a81,912b81,932b80,942c80,962c80,982d80,992d80,9b2e7f,9c2e7f,9e2f7f,a02f7f,a1307e,a3307e,a5317e,a6317d,a8327d,aa337d,ab337c,ad347c,ae347b,b0357b,b2357b,b3367a,b5367a,b73779,b83779,ba3878,bc3978,bd3977,bf3a77,c03a76,c23b75,c43c75,c53c74,c73d73,c83e73,ca3e72,cc3f71,cd4071,cf4070,d0416f,d2426f,d3436e,d5446d,d6456c,d8456c,d9466b,db476a,dc4869,de4968,df4a68,e04c67,e24d66,e34e65,e44f64,e55064,e75263,e85362,e95462,ea5661,eb5760,ec5860,ed5a5f,ee5b5e,ef5d5e,f05f5e,f1605d,f2625d,f2645c,f3655c,f4675c,f4695c,f56b5c,f66c5c,f66e5c,f7705c,f7725c,f8745c,f8765c,f9785d,f9795d,f97b5d,fa7d5e,fa7f5e,fa815f,fb835f,fb8560,fb8761,fc8961,fc8a62,fc8c63,fc8e64,fc9065,fd9266,fd9467,fd9668,fd9869,fd9a6a,fd9b6b,fe9d6c,fe9f6d,fea16e,fea36f,fea571,fea772,fea973,feaa74,feac76,feae77,feb078,feb27a,feb47b,feb67c,feb77e,feb97f,febb81,febd82,febf84,fec185,fec287,fec488,fec68a,fec88c,feca8d,fecc8f,fecd90,fecf92,fed194,fed395,fed597,fed799,fed89a,fdda9c,fddc9e,fddea0,fde0a1,fde2a3,fde3a5,fde5a7,fde7a9,fde9aa,fdebac,fcecae,fceeb0,fcf0b2,fcf2b4,fcf4b6,fcf6b8,fcf7b9,fcf9bb,fcfbbd,fcfdbf",
"000004,010005,010106,010108,02010a,02020c,02020e,030210,040312,040314,050417,060419,07051b,08051d,09061f,0a0722,0b0724,0c0826,0d0829,0e092b,10092d,110a30,120a32,140b34,150b37,160b39,180c3c,190c3e,1b0c41,1c0c43,1e0c45,1f0c48,210c4a,230c4c,240c4f,260c51,280b53,290b55,2b0b57,2d0b59,2f0a5b,310a5c,320a5e,340a5f,360961,380962,390963,3b0964,3d0965,3e0966,400a67,420a68,440a68,450a69,470b6a,490b6a,4a0c6b,4c0c6b,4d0d6c,4f0d6c,510e6c,520e6d,540f6d,550f6d,57106e,59106e,5a116e,5c126e,5d126e,5f136e,61136e,62146e,64156e,65156e,67166e,69166e,6a176e,6c186e,6d186e,6f196e,71196e,721a6e,741a6e,751b6e,771c6d,781c6d,7a1d6d,7c1d6d,7d1e6d,7f1e6c,801f6c,82206c,84206b,85216b,87216b,88226a,8a226a,8c2369,8d2369,8f2469,902568,922568,932667,952667,972766,982766,9a2865,9b2964,9d2964,9f2a63,a02a63,a22b62,a32c61,a52c60,a62d60,a82e5f,a92e5e,ab2f5e,ad305d,ae305c,b0315b,b1325a,b3325a,b43359,b63458,b73557,b93556,ba3655,bc3754,bd3853,bf3952,c03a51,c13a50,c33b4f,c43c4e,c63d4d,c73e4c,c83f4b,ca404a,cb4149,cc4248,ce4347,cf4446,d04545,d24644,d34743,d44842,d54a41,d74b3f,d84c3e,d94d3d,da4e3c,db503b,dd513a,de5238,df5337,e05536,e15635,e25734,e35933,e45a31,e55c30,e65d2f,e75e2e,e8602d,e9612b,ea632a,eb6429,eb6628,ec6726,ed6925,ee6a24,ef6c23,ef6e21,f06f20,f1711f,f1731d,f2741c,f3761b,f37819,f47918,f57b17,f57d15,f67e14,f68013,f78212,f78410,f8850f,f8870e,f8890c,f98b0b,f98c0a,f98e09,fa9008,fa9207,fa9407,fb9606,fb9706,fb9906,fb9b06,fb9d07,fc9f07,fca108,fca309,fca50a,fca60c,fca80d,fcaa0f,fcac11,fcae12,fcb014,fcb216,fcb418,fbb61a,fbb81d,fbba1f,fbbc21,fbbe23,fac026,fac228,fac42a,fac62d,f9c72f,f9c932,f9cb35,f8cd37,f8cf3a,f7d13d,f7d340,f6d543,f6d746,f5d949,f5db4c,f4dd4f,f4df53,f4e156,f3e35a,f3e55d,f2e661,f2e865,f2ea69,f1ec6d,f1ed71,f1ef75,f1f179,f2f27d,f2f482,f3f586,f3f68a,f4f88e,f5f992,f6fa96,f8fb9a,f9fc9d,fafda1,fcffa4",
"0d0887,100788,130789,16078a,19068c,1b068d,1d068e,20068f,220690,240691,260591,280592,2a0593,2c0594,2e0595,2f0596,310597,330597,350498,370499,38049a,3a049a,3c049b,3e049c,3f049c,41049d,43039e,44039e,46039f,48039f,4903a0,4b03a1,4c02a1,4e02a2,5002a2,5102a3,5302a3,5502a4,5601a4,5801a4,5901a5,5b01a5,5c01a6,5e01a6,6001a6,6100a7,6300a7,6400a7,6600a7,6700a8,6900a8,6a00a8,6c00a8,6e00a8,6f00a8,7100a8,7201a8,7401a8,7501a8,7701a8,7801a8,7a02a8,7b02a8,7d03a8,7e03a8,8004a8,8104a7,8305a7,8405a7,8606a6,8707a6,8808a6,8a09a5,8b0aa5,8d0ba5,8e0ca4,8f0da4,910ea3,920fa3,9410a2,9511a1,9613a1,9814a0,99159f,9a169f,9c179e,9d189d,9e199d,a01a9c,a11b9b,a21d9a,a31e9a,a51f99,a62098,a72197,a82296,aa2395,ab2494,ac2694,ad2793,ae2892,b02991,b12a90,b22b8f,b32c8e,b42e8d,b52f8c,b6308b,b7318a,b83289,ba3388,bb3488,bc3587,bd3786,be3885,bf3984,c03a83,c13b82,c23c81,c33d80,c43e7f,c5407e,c6417d,c7427c,c8437b,c9447a,ca457a,cb4679,cc4778,cc4977,cd4a76,ce4b75,cf4c74,d04d73,d14e72,d24f71,d35171,d45270,d5536f,d5546e,d6556d,d7566c,d8576b,d9586a,da5a6a,da5b69,db5c68,dc5d67,dd5e66,de5f65,de6164,df6263,e06363,e16462,e26561,e26660,e3685f,e4695e,e56a5d,e56b5d,e66c5c,e76e5b,e76f5a,e87059,e97158,e97257,ea7457,eb7556,eb7655,ec7754,ed7953,ed7a52,ee7b51,ef7c51,ef7e50,f07f4f,f0804e,f1814d,f1834c,f2844b,f3854b,f3874a,f48849,f48948,f58b47,f58c46,f68d45,f68f44,f79044,f79143,f79342,f89441,f89540,f9973f,f9983e,f99a3e,fa9b3d,fa9c3c,fa9e3b,fb9f3a,fba139,fba238,fca338,fca537,fca636,fca835,fca934,fdab33,fdac33,fdae32,fdaf31,fdb130,fdb22f,fdb42f,fdb52e,feb72d,feb82c,feba2c,febb2b,febd2a,febe2a,fec029,fdc229,fdc328,fdc527,fdc627,fdc827,fdca26,fdcb26,fccd25,fcce25,fcd025,fcd225,fbd324,fbd524,fbd724,fad824,fada24,f9dc24,f9dd25,f8df25,f8e125,f7e225,f7e425,f6e626,f6e826,f5e926,f5eb27,f4ed27,f3ee27,f3f027,f2f227,f1f426,f1f525,f0f724,f0f921",
"440154,440256,450457,450559,46075a,46085c,460a5d,460b5e,470d60,470e61,471063,471164,471365,481467,481668,481769,48186a,481a6c,481b6d,481c6e,481d6f,481f70,482071,482173,482374,482475,482576,482677,482878,482979,472a7a,472c7a,472d7b,472e7c,472f7d,46307e,46327e,46337f,463480,453581,453781,453882,443983,443a83,443b84,433d84,433e85,423f85,424086,424186,414287,414487,404588,404688,3f4788,3f4889,3e4989,3e4a89,3e4c8a,3d4d8a,3d4e8a,3c4f8a,3c508b,3b518b,3b528b,3a538b,3a548c,39558c,39568c,38588c,38598c,375a8c,375b8d,365c8d,365d8d,355e8d,355f8d,34608d,34618d,33628d,33638d,32648e,32658e,31668e,31678e,31688e,30698e,306a8e,2f6b8e,2f6c8e,2e6d8e,2e6e8e,2e6f8e,2d708e,2d718e,2c718e,2c728e,2c738e,2b748e,2b758e,2a768e,2a778e,2a788e,29798e,297a8e,297b8e,287c8e,287d8e,277e8e,277f8e,27808e,26818e,26828e,26828e,25838e,25848e,25858e,24868e,24878e,23888e,23898e,238a8d,228b8d,228c8d,228d8d,218e8d,218f8d,21908d,21918c,20928c,20928c,20938c,1f948c,1f958b,1f968b,1f978b,1f988b,1f998a,1f9a8a,1e9b8a,1e9c89,1e9d89,1f9e89,1f9f88,1fa088,1fa188,1fa187,1fa287,20a386,20a486,21a585,21a685,22a785,22a884,23a983,24aa83,25ab82,25ac82,26ad81,27ad81,28ae80,29af7f,2ab07f,2cb17e,2db27d,2eb37c,2fb47c,31b57b,32b67a,34b679,35b779,37b878,38b977,3aba76,3bbb75,3dbc74,3fbc73,40bd72,42be71,44bf70,46c06f,48c16e,4ac16d,4cc26c,4ec36b,50c46a,52c569,54c568,56c667,58c765,5ac864,5cc863,5ec962,60ca60,63cb5f,65cb5e,67cc5c,69cd5b,6ccd5a,6ece58,70cf57,73d056,75d054,77d153,7ad151,7cd250,7fd34e,81d34d,84d44b,86d549,89d548,8bd646,8ed645,90d743,93d741,95d840,98d83e,9bd93c,9dd93b,a0da39,a2da37,a5db36,a8db34,aadc32,addc30,b0dd2f,b2dd2d,b5de2b,b8de29,bade28,bddf26,c0df25,c2df23,c5e021,c8e020,cae11f,cde11d,d0e11c,d2e21b,d5e21a,d8e219,dae319,dde318,dfe318,e2e418,e5e419,e7e419,eae51a,ece51b,efe51c,f1e51d,f4e61e,f6e620,f8e621,fbe723,fde725"];
var colorSplit = colorScheme[colorSchemeChoice].split(","); // change the number to change the color scheme used

// three.js setup for the scene to work

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color("#050505")); // scene background color
renderer.setSize(WIDTH, HEIGHT); // scene size
var container = document.getElementById('cylinder'); // to add the scene to the correct div
container.appendChild( renderer.domElement );

// scene camera setup

scene.add(camera);
camera.position.z = 9;
camera.position.x = 15;
camera.up = new THREE.Vector3(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 6));
var controls = new THREE.TrackballControls(camera, renderer.domElement);

// call control functions

mouseDragRotate();
drawSlice();
createColorLegend();
mouseWheelZoom();
sliderMove();
menuListener();
populateDropdown();

/**
* Used to choose which file will be load into the visualization.
* @type {number}
*/
var filePick = Number(d3.select('select[name="time"]').node().value);

var tooltip = d3.select("body")
	.append("div")
	.attr("class", "hidden tooltip");

/**
* Draws the cylinder slice using three.js lines.
*/
function drawSlice() {
	sliceWidth = 1;
	sliceGroup = new THREE.Group();
	var lineMat = new THREE.LineBasicMaterial({
		color: 0xAAAAAA
	});
	var arrowMat = new THREE.LineBasicMaterial({
		color: 0xAAAAAA,
		linewidth: 5
	});
	// FRONT
	var line1g = new THREE.Geometry();
	line1g.vertices.push(new THREE.Vector3(5,-(sliceWidth/2),10.25), new THREE.Vector3(5,-(sliceWidth/2),-0.25),
	new THREE.Vector3(5,(sliceWidth/2),-0.25), new THREE.Vector3(5,(sliceWidth/2),10.25), new THREE.Vector3(5,-(sliceWidth/2),10.25));
	// BACK
	var line2g = new THREE.Geometry();
	line2g.vertices.push(new THREE.Vector3(-5,-(sliceWidth/2),10.25), new THREE.Vector3(-5,-(sliceWidth/2),-0.25),
	new THREE.Vector3(-5,(sliceWidth/2),-0.25), new THREE.Vector3(-5,(sliceWidth/2),10.25), new THREE.Vector3(-5,-(sliceWidth/2),10.25));
	// SIDES
	var line3g = new THREE.Geometry();
	line3g.vertices.push(new THREE.Vector3(-5,-(sliceWidth/2),10.25), new THREE.Vector3(5,-(sliceWidth/2),10.25));
	var line4g = new THREE.Geometry();
	line4g.vertices.push(new THREE.Vector3(-5,(sliceWidth/2),10.25), new THREE.Vector3(5,(sliceWidth/2),10.25));
	var line5g = new THREE.Geometry();
	line5g.vertices.push(new THREE.Vector3(-5,-(sliceWidth/2),-0.25), new THREE.Vector3(5,-(sliceWidth/2),-0.25));
	var line6g = new THREE.Geometry();
	line6g.vertices.push(new THREE.Vector3(-5,(sliceWidth/2),-0.25), new THREE.Vector3(5,(sliceWidth/2),-0.25));
	// BOTTOM ARROWS
	var line7g = new THREE.Geometry();
	line7g.vertices.push(new THREE.Vector3(4, 0, -0.25), new THREE.Vector3(5, 0, -0.25), new THREE.Vector3(4.5, -sliceWidth/2 + 0.1, -0.25), new THREE.Vector3(5, 0, -0.25), new THREE.Vector3(4.5, sliceWidth/2- 0.1, -0.25));
	var line8g = new THREE.Geometry();
	line8g.vertices.push(new THREE.Vector3(-5, 0, -0.25), new THREE.Vector3(-4, 0, -0.25), new THREE.Vector3(-4.5, -sliceWidth/2+ 0.1, -0.25), new THREE.Vector3(-4, 0, -0.25), new THREE.Vector3(-4.5, sliceWidth/2 - 0.1, -0.25));

	// CREATE LINES
	var line1 = new THREE.Line(line1g, lineMat);
	var line2 = new THREE.Line(line2g, lineMat);
	var line3 = new THREE.Line(line3g, lineMat);
	var line4 = new THREE.Line(line4g, lineMat);
	var line5 = new THREE.Line(line5g, lineMat);
	var line6 = new THREE.Line(line6g, lineMat);
	var line7 = new THREE.Line(line7g, arrowMat);
	var line8 = new THREE.Line(line8g, arrowMat);

	// ADD TO SCENE
	sliceGroup.add(line1);
	sliceGroup.add(line2);
	sliceGroup.add(line3);
	sliceGroup.add(line4);
	sliceGroup.add(line5);
	sliceGroup.add(line6);
	sliceGroup.add(line7);
	sliceGroup.add(line8);
	scene.add(sliceGroup);
	sliceGroup.position.setZ(1);
}


/**
* Creates a color legend to show the concentration scale. Uses canvas.
*/
function createColorLegend() {

	d3.select("#canvas").remove();

	var canvas = d3.select("#legend").append("canvas")
	.attr("id", "canvas")
	.attr("width", 450)
	.attr("height", 1);

	var context = canvas.node().getContext("2d");
	var image = context.createImageData(450, 1);

	for (var i=0, j=-1, c; i<450; ++i) {
		c = colorSplit[Math.floor(i/450 * colorSplit.length)];
		image.data[++j] = +("0x" + c.slice(0, 2));
		image.data[++j] = +("0x" + c.slice(2, 4));
		image.data[++j] = +("0x" + c.slice(4, 6));
		image.data[++j] = 255;
	}

	context.putImageData(image, 0, 0);
}

// set up slice vis
// set up slice vis

var svg = d3.select("#slice").append("svg")
// .attr("class", "svg")
.attr("width", WIDTH_SLICE)
.attr("height", WIDTH_SLICE);

var svg2 = d3.select("#slice2").append("svg")
// .attr("class", "svg")
.attr("width", WIDTH_SLICE)
.attr("height", WIDTH_SLICE);

svg2.append("rect")
.attr("width", "100%")
.attr("height", "100%")
.style("fill", "#050505");

var sliceArrow1 = svg.append("path")
.attr("class", "arrow")
.attr("d", "M " + (WIDTH_SLICE-15) + " " + (WIDTH_SLICE-10) +
" l " + 8 + " " + 0 +
" m " + 2 + " " + 0 +
" l " + -5 + " " + -5 +
" m " + -5 + " " + 5 +
" l " + 8 + " " + 0 +
" m " + 2 + " " + 0 +
" l " + -5 + " " + 5)
.style("stroke", "white")
.style("stroke-width", 2);

var sliceArrow2 = svg2.append("path")
.attr("class", "arrow")
.attr("d", "M " + (WIDTH_SLICE-15) + " " + (WIDTH_SLICE-10) +
" l " + 8 + " " + 0 +
" m " + 2 + " " + 0 +
" l " + -5 + " " + -5 +
" m " + -5 + " " + 5 +
" l " + 8 + " " + 0 +
" m " + 2 + " " + 0 +
" l " + -5 + " " + 5)
.style("stroke", "white")
.style("stroke-width", 2);



// render scene

var particleSystem;

/**
* Renders the three.js scene.
*/
function render() {
	requestAnimationFrame(render);
	// menuListener();
	keyboardListener();
	controls.update();

	renderer.render(scene, camera);
}

/**
* Handles window resize by adjusting the scene and camera.
*/
function onWindowResize(){
	camera.updateProjectionMatrix();
	renderer.setSize(500,500);
	controls.handleResize();
}


// MOVE TO CALLBACK FROM FILE READ VV

var color = d3.scale.quantile()
.range(colorSplit);

var colorSlice = d3.scale.quantile()
.range(colorSplit);

var velWidth;
var velLength;

// FOR DRAWING SLICES:
// [-5,5] -> [0, sliceResolution)
var xScale = d3.scale.quantize()
.domain([-5, 5])
.range(Array.apply(null, {length: sliceResolution}).map(Number.call, Number));

// [0,10] -> [0, sliceResolution)
var yScale = d3.scale.quantize()
.domain([0,10])
.range(Array.apply(null, {length: sliceResolution}).map(Number.call, Number));


var particles,
pMaterial = new THREE.PointsMaterial({
	size: .2,
	vertexColors: THREE.VertexColors,
});

/**
* Draws the particle system by receiving the file number (timestep).
* @param fileNum - The number of the file.
*/
function drawParticles(fileNum) {

	var oldRotation = 0;
	if (particleSystem) oldRotation = particleSystem.rotation.z;

	scene.remove(particleSystem);
	scene.remove(particles);

	var particleCount = data.length, // 40th step
	particles = new THREE.Geometry();


	// now create the individual particles
	for(var p = 0; p < particleCount; p++) {

		var pX = data[p].concentration < (mean + stddev/8) ? 1001 : data[p].Points0,
		pY = data[p].concentration < (mean + stddev/8) ? 1001 : data[p].Points1,
		pZ = data[p].Points2,
		// pZ = data[p].Points2,
		particle = new THREE.Vector3(pX, pY, pZ);

		// add it to the geometry
		particles.vertices.push(particle);

	}

	// create the particle system
	particleSystem = new THREE.Points(
		particles,
		pMaterial);

		for(var p = 0; p < particleCount; p++) {
			particleSystem.geometry.colors[p] = new THREE.Color("#" + color(Number(data[p].concentration)));
		}


		particleSystem.geometry.colorsNeedUpdate = true;


		// add it to the scene
		scene.add(particleSystem);
		particleSystem.position.setZ(1);
		particleSystem.rotation.z = oldRotation;


		// render again after particles created
		refreshSlice();
		// render();

	}

	/**
	* Updates the slice view to match the current position and rotation.
	*/
	function refreshSlice() {
		var currRotation = particleSystem.rotation.z;

		sliced = [];
		for(var i = 0; i < data.length; i++){
			var loc = new THREE.Vector3(data[i].Points0, data[i].Points1, data[i].Points2);
			loc.applyAxisAngle(new THREE.Vector3(0,0,1), currRotation + (0*Math.PI/2));
			if(loc.y > (sliceGroup.position.y - (sliceWidth/2)) && loc.y < (sliceGroup.position.y + (sliceWidth/2)))
			{
				var vel = new THREE.Vector3(data[i].velocity0, data[i].velocity1, data[i].velocity2);
				vel.applyAxisAngle(new THREE.Vector3(0,0,1), currRotation + (0*Math.PI/2));
				sliced.push({num: i, position: loc, velocity: vel, concentration: data[i].concentration});
			}
		}

		for(var i = 0; i < sliceResolution; i++) {
			for(var j = 0; j < sliceResolution; j++) {
				sliceAccumulated[i][j].conc = 0;
				sliceAccumulated[i][j].vel = new THREE.Vector3(0,0,0);
			}
		}

		// highlight the points which are within the slice
		// draw all points as their normal colors first (gets rid of old hignlighted points)

		for(var i = 0; i < sliced.length; i++) {

			var thisX = xScale(sliced[i].position.x),
			thisZ = yScale(sliced[i].position.z);

			sliceAccumulated[thisX][sliceResolution - thisZ - 1].conc += sliced[i].concentration;
			sliceAccumulated[thisX][sliceResolution - thisZ - 1].vel.x += data[sliced[i].num].velocity0;
			sliceAccumulated[thisX][sliceResolution - thisZ - 1].vel.y += data[sliced[i].num].velocity1;
			sliceAccumulated[thisX][sliceResolution - thisZ - 1].vel.z += data[sliced[i].num].velocity2;
		}

		// create/color rectangles of slice

		var maxConcSlice = d3.max(sliceAccumulated, function(e) { return d3.max(e, function(e){ return e.conc;}); });
		var minConcSlice = d3.min(sliceAccumulated, function(e) { return d3.max(e, function(e){ return e.conc;}); });

		var maxVelSlice = d3.max(sliceAccumulated, function(e) {
			return d3.max(e, function(e) {
				return e.vel.length();
			});
		});

		colorSlice.domain([0, maxConcSlice]);

		d3.selectAll(".slicePixel").remove();
		d3.selectAll(".sliceLine").remove();

		var gridWidth = d3.min([WIDTH_SLICE, WIDTH_SLICE])/(sliceResolution);

		velLength = d3.scale.linear()
		.range([0.5, gridWidth*15]);

		velWidth = d3.scale.linear()
		.range([0.5, 3]);

		velLength.domain([0, maxVelSlice]);
		velWidth.domain([0, maxVelSlice]);


		// add colored values for concentration
		for(var i = 0; i < sliceResolution; i++) {
			for(var j = 0; j < sliceResolution; j++) {
				svg.append("rect")
				.attr("class", "slicePixel")
				.attr("width", gridWidth)
				.attr("height", gridWidth)
				.attr("x", (sliceAccumulated[i][j].x*gridWidth))
				.attr("y", (sliceAccumulated[i][j].y*gridWidth))
				.style("fill", d3.rgb("#" + color(sliceAccumulated[i][j].conc/3)));


				svg2.append("rect")
				.attr("class", "slicePixel")
				.attr("width", gridWidth)
				.attr("height", gridWidth)
				.attr("x", (sliceAccumulated[i][j].x*gridWidth))
				.attr("y", (sliceAccumulated[i][j].y*gridWidth))
				.style("fill", d3.rgb("#" + color(sliceAccumulated[i][j].conc/3)))
				.style("fill-opacity", 0.3);

			}
		}
		// draw lines for velocity
		for(var i = 0; i < sliceResolution; i++) {
			for(var j = 0; j < sliceResolution; j++) {

				var vecX = sliceAccumulated[i][j].vel.x < 0 ?
				-velLength(+sliceAccumulated[i][j].vel.x) :
				velLength(+sliceAccumulated[i][j].vel.x),

				vecY = sliceAccumulated[i][j].vel.z < 0 ?
				-velLength(+sliceAccumulated[i][j].vel.z) :
				velLength(+sliceAccumulated[i][j].vel.z); // z <-> y here

				var xCenter = (sliceAccumulated[i][j].x * gridWidth) + (gridWidth/2),
				yCenter = (sliceAccumulated[i][j].y * gridWidth) + (gridWidth/2);

				var xStart = xCenter,
				xEnd = xCenter + vecX,
				yStart = yCenter,
				yEnd = yCenter + vecY;

				var slope = (yEnd-yStart)/(xEnd-xStart);

				var slopeInv = -1*(1/slope);

				var dXSlopeInv = 1,
				dYSlopeInv = dXSlopeInv * slopeInv,
				dHSlopeInv = Math.sqrt(Math.pow(dXSlopeInv,2) + Math.pow(dYSlopeInv,2));

				var ratio = velWidth(sliceAccumulated[i][j].vel.length()) / dHSlopeInv,
				dXEndLine = ratio * dXSlopeInv;
				dYEndLine = ratio * dYSlopeInv;

				svg2.append("path")
				.attr("class", "sliceLine")
				.attr("d", "M " + (xStart-dXEndLine) + " " + (yStart-dYEndLine) +
				" L " + (xStart+dXEndLine) + " " + (yStart+dYEndLine) +
				" L " + xEnd + " " + yEnd + " Z")
				.attr('stroke-linecap', 'round')
				.style("fill", d3.rgb("#" + color(sliceAccumulated[i][j].conc/3)))
				.style("stroke-width", velWidth(sliceAccumulated[i][j].vel.length()));
			}
		}
		sliceArrow1.remove();
		sliceArrow1 = svg.append("path")
		.attr("class", "arrow")
		.attr("stroke-linecap", "round")
		.attr("d", "M " + (WIDTH_SLICE-15) + " " + (WIDTH_SLICE-10) +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + -5 +
		" m " + -5 + " " + 5 +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + 5)
		.style("stroke", "white")
		.style("stroke-width", 2);

		sliceArrow2.remove();
		sliceArrow2 = svg2.append("path")
		.attr("class", "arrow")
		.attr("stroke-linecap", "round")
		.attr("d", "M " + (WIDTH_SLICE-15) + " " + (WIDTH_SLICE-10) +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + -5 +
		" m " + -5 + " " + 5 +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + 5)
		.style("stroke", "white")
		.style("stroke-width", 2);

		recolor3DModel();
	}

	/**
	* Recolors the all parts of vis according to the option selected.
	* Also invokes {@link recolor3DModel}, {@link recolorHeatMaps}, {@link recolorFingerGraph},
	* and {@link createColorLegend}.
	*/
	function recolorAll() {
		color.range(colorSplit);
		fingerColor.range(colorSplit);

		if (colorSchemeChoice == 0 || colorSchemeChoice == 1) {
			renderer.setClearColor("#454545");
		}
		if (colorSchemeChoice == 2 || colorSchemeChoice == 3) {
			renderer.setClearColor("#050505");
		}

		recolor3DModel();
		recolorHeatMaps();
		recolorFingerGraph();
		createColorLegend();
	}


	/**
	* Recolors the particle system according to the option selected.
	*/
	function recolor3DModel() {
		var particleCount = data.length;
		color.range(colorSplit);

		for(var p = 0; p < particleCount; p++) {
			particleSystem.geometry.colors[p] = new THREE.Color("#" + color(Number(data[p].concentration)));

			if(sliceColorMode === 1 || sliceColorMode === 3) {
				var oldHSL = particleSystem.geometry.colors[p].getHSL();
				particleSystem.geometry.colors[p].setHSL(oldHSL.h, .05, oldHSL.l);
			}
		}

		// makes all sliced points white
		for(var i = 0; i < sliced.length; i++) {

			if(sliceColorMode === 1) {
				// keep particles in slice same color
				particleSystem.geometry.colors[sliced[i].num] = new THREE.Color("#" + color(Number(data[sliced[i].num].concentration)));
			}
			else if(sliceColorMode === 2) {
				// hilight particles in slice
				particleSystem.geometry.colors[sliced[i].num].r += .2;
				particleSystem.geometry.colors[sliced[i].num].g += .2;
				particleSystem.geometry.colors[sliced[i].num].b += .2;
			}

		}

		// color the points that (we think) are viscous fingers
		if(sliceColorMode === 3){
			for(var i = 0; i < clusterData[filePick].length; i++) {
				for(var j = 0; j < clusterData[filePick][i].length; j++) {
					particleSystem.geometry.colors[clusterData[filePick][i][j]] = new THREE.Color("#" + color(Number(data[clusterData[filePick][i][j]].concentration)));
				}
			}
		}
		particleSystem.geometry.colorsNeedUpdate = true;

	}

	/**
	* Recolors the heatmaps according to the option selected.
	*/
	function recolorHeatMaps() {
		var gridWidth = d3.min([WIDTH_SLICE, WIDTH_SLICE])/(sliceResolution);

		d3.selectAll(".slicePixel").remove();
		d3.selectAll(".sliceLine").remove();

		// add colored values for concentration
		for(var i = 0; i < sliceResolution; i++) {
			for(var j = 0; j < sliceResolution; j++) {
				svg.append("rect")
				.attr("class", "slicePixel")
				.attr("width", gridWidth)
				.attr("height", gridWidth)
				.attr("x", (sliceAccumulated[i][j].x*gridWidth))
				.attr("y", (sliceAccumulated[i][j].y*gridWidth))
				.style("fill", d3.rgb("#" + color(sliceAccumulated[i][j].conc/3)));


				svg2.append("rect")
				.attr("class", "slicePixel")
				.attr("width", gridWidth)
				.attr("height", gridWidth)
				.attr("x", (sliceAccumulated[i][j].x*gridWidth))
				.attr("y", (sliceAccumulated[i][j].y*gridWidth))
				.style("fill", d3.rgb("#" + color(sliceAccumulated[i][j].conc/3)))
				.style("fill-opacity", 0.3);

			}
		}
		// draw lines for velocity
		for(var i = 0; i < sliceResolution; i++) {
			for(var j = 0; j < sliceResolution; j++) {

				var vecX = sliceAccumulated[i][j].vel.x < 0 ?
				-velLength(+sliceAccumulated[i][j].vel.x) :
				velLength(+sliceAccumulated[i][j].vel.x),

				vecY = sliceAccumulated[i][j].vel.z < 0 ?
				-velLength(+sliceAccumulated[i][j].vel.z) :
				velLength(+sliceAccumulated[i][j].vel.z); // z <-> y here

				var xCenter = (sliceAccumulated[i][j].x * gridWidth) + (gridWidth/2),
				yCenter = (sliceAccumulated[i][j].y * gridWidth) + (gridWidth/2);

				var xStart = xCenter,
				xEnd = xCenter + vecX,
				yStart = yCenter,
				yEnd = yCenter + vecY;

				var slope = (yEnd-yStart)/(xEnd-xStart);

				var slopeInv = -1*(1/slope);

				var dXSlopeInv = 1,
				dYSlopeInv = dXSlopeInv * slopeInv,
				dHSlopeInv = Math.sqrt(Math.pow(dXSlopeInv,2) + Math.pow(dYSlopeInv,2));

				var ratio = velWidth(sliceAccumulated[i][j].vel.length()) / dHSlopeInv,
				dXEndLine = ratio * dXSlopeInv;
				dYEndLine = ratio * dYSlopeInv;

				svg2.append("path")
				.attr("class", "sliceLine")
				.attr("d", "M " + (xStart-dXEndLine) + " " + (yStart-dYEndLine) +
				" L " + (xStart+dXEndLine) + " " + (yStart+dYEndLine) +
				" L " + xEnd + " " + yEnd + " Z")
				.attr('stroke-linecap', 'round')
				.style("fill", d3.rgb("#" + color(sliceAccumulated[i][j].conc/3)))
				.style("stroke-width", velWidth(sliceAccumulated[i][j].vel.length()));
			}
		}
		sliceArrow1.remove();
		sliceArrow1 = svg.append("path")
		.attr("class", "arrow")
		.attr("stroke-linecap", "round")
		.attr("d", "M " + (WIDTH_SLICE-15) + " " + (WIDTH_SLICE-10) +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + -5 +
		" m " + -5 + " " + 5 +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + 5)
		.style("stroke", "white")
		.style("stroke-width", 2);

		sliceArrow2.remove();
		sliceArrow2 = svg2.append("path")
		.attr("class", "arrow")
		.attr("stroke-linecap", "round")
		.attr("d", "M " + (WIDTH_SLICE-15) + " " + (WIDTH_SLICE-10) +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + -5 +
		" m " + -5 + " " + 5 +
		" l " + 8 + " " + 0 +
		" m " + 2 + " " + 0 +
		" l " + -5 + " " + 5)
		.style("stroke", "white")
		.style("stroke-width", 2);
	}

	/**
	* Recolors the viscous finger graph according to the option selected.
	*/
	function recolorFingerGraph() {
		fingerColor.range(colorSplit); // update range
		drawFingerGraph(startFile, endFile); // unfortunately this is the only way to recolor
	}

	// file reading
	// read 1 file

	// readFileNumCSV(filePick);
	readFileNumJSON(filePick);

	d3.json(folderPath + "allClusterCenters.json", function(err, json) {
		fingersOverTime = json;
		drawFingerGraph(startFile, endFile);

	});

	var fingerSize = d3.scale.linear()
	.range([2, 10])
	.clamp(true);

	var fingerColor = d3.scale.quantize()
	.range(colorSplit);

	var lineThickness = d3.scale.linear()
		.range([1, 6]);

	var xSpacing;
	var indexMap;
	var maxConcAllTimesteps;

	var prevIDs;

	function drawFingerGraph(start, end) {
		var myDiv = d3.select("#fingerGraph");
		// no idea how to size this stuff
		var width = 494;
		var height = 799;

		// horribly inefficient, need to fix badly
		d3.selectAll(".fingerPoint").remove();
		d3.selectAll(".fingerTransition").remove();
		d3.selectAll(".fingerFileIndicator").remove();
		d3.selectAll(".graphSVG").remove();

		var mySVG = myDiv.append("svg")
		.attr("class", "graphSVG")
		.attr("width", width)
		.attr("height", height);



		var numClusters = d3.max(fingersOverTime, function(el) {
			return d3.max(el, function(el2) {
				return el2.clusterID;
			})
		}) + 1;

		xSpacing = (width/(end - start + 1));
		var ySpacing = height/(numClusters + 1);

		var maxFingerConc = d3.max(fingersOverTime, function(el) {
			return d3.max(el, function(el2) {
				return el2.concTotal;
			})
		});

		var minFingerConc = d3.min(fingersOverTime, function(el) {
			return d3.min(el, function(el2) {
				return el2.concTotal;
			})
		});

		var maxFingerSize = d3.max(fingersOverTime, function(el) {
			return d3.max(el, function(el2) {
				return (el2.xMax - el2.xMin) + (el2.yMax - el2.yMin) + (el2.zMax - el2.zMin);
			})
		});

		var minFingerSize = d3.min(fingersOverTime, function(el) {
			return d3.min(el, function(el2) {
				return (el2.xMax - el2.xMin) + (el2.yMax - el2.yMin) + (el2.zMax - el2.zMin);
			})
		});

		console.log(maxFingerConc, minFingerConc);
		console.log(maxFingerSize, minFingerSize);

		fingerSize.domain([minFingerSize, maxFingerSize]);
		fingerSize.range([2,d3.min([xSpacing/2, ySpacing/2])-1]);



		fingerColor.domain([minFingerConc, maxFingerConc]);

		lineThickness.domain([minFingerConc, maxFingerConc]);

		// draw background
		mySVG.append("rect")
		.attr("width", "100%")
		.attr("height", "100%")
		.style("fill", "#0F0F0F");

		// draw horizontal lines

		// for(var i = 0; i < numClusters; i++){
		// 	mySVG.append("line")
		// 		.attr("x1", 0)
		// 		.attr("x2", width)
		// 		.attr("y1", ySpacing/2 + ySpacing*i)
		// 		.attr("y2", ySpacing/2 + ySpacing*i)
		// 		.style("stroke", "white");
		// }

		// vertical line for which file is currently selected
		mySVG.append("line")
		.attr("class", "fingerFileIndicator")
		.attr("x1", (xSpacing * (filePick-start)) + xSpacing/2)
		.attr("x2", (xSpacing * (filePick-start)) + xSpacing/2)
		.attr("y1", 0)
		.attr("y2", height)
		.style("stroke", "white")
		.style("stroke-width", xSpacing)
		.style("stroke-opacity", .1);

		console.log(xSpacing);

		// aggregate concentrations if more than one cluster is considered
		// to have the same index
		var concArray = new Array(numFiles);
		var sizeArray = new Array(numFiles);
		var includedArray = new Array(numFiles);
		var nextArray = new Array(numFiles);

		// initialize includedArray to be full of empty arrays
		for(var i = 0; i < numFiles; i++){
			includedArray[i] = new Array(numClusters);
			for(var j = 0; j < numClusters; j++) {
				includedArray[i][j] = [];
			}
		}

		for(var i = start; i <= end; i++){
			concArray[i] = new Array(numClusters).fill(0);
			sizeArray[i] = new Array(numClusters).fill(0);
			nextArray[i] = new Array(numClusters).fill(-1);

			for(var j = 0; j < fingersOverTime[i].length; j++) {
				var thisFinger = fingersOverTime[i][j];
				concArray[i][fingersOverTime[i][j].clusterID] += fingersOverTime[i][j].concTotal;
				sizeArray[i][fingersOverTime[i][j].clusterID] +=
					(thisFinger.xMax - thisFinger.xMin)
					+ (thisFinger.yMax - thisFinger.yMin)
					+ (thisFinger.zMax - thisFinger.zMin);

				includedArray[i][fingersOverTime[i][j].clusterID].push(j);

				if(nextArray[i][fingersOverTime[i][j].clusterID] === -1) { // only update if no value
						// max concentration nextClusterID will be chosen as concentration is in
						// descending order
						nextArray[i][fingersOverTime[i][j].clusterID] = fingersOverTime[i][j].nextClusterID;
				}
			}
		}

		maxConcAllTimesteps = new Array(numClusters).fill(0);
		indexMap = new Array(numClusters);

		// make mapping from ID to height to "sort"
		for(var i = 0; i < numClusters; i++){
			indexMap[i] = i;
		}

/* ===== BALANCE THE GRAPH! ===== */
		var rangeActive = new Array(numClusters); // range that each clusterID exists
		prevIDs = new Array(numClusters);

		// calculate the range that each clusterID exists
		// initiate to have earliest be end, latest be start
		for(var i = 0; i < numClusters; i++)
		{
			rangeActive[i] = {earliest: end, latest: start};
		}

		// for each ID, find all IDs which lead into it
		// initialize to have only its own value
		for(var i = 0; i < numClusters; i++)
		{
			prevIDs[i] = {fullSubArr: [], values: [i]};
		}

		// find ranges
		// and all IDs which lead into each ID
		for(var i = start; i <= end; i++)
		{
			// for each timestep
			for(var j = 0; j < fingersOverTime[i].length; j++) {
				// for each finger in the timestep
				var thisFinger = fingersOverTime[i][j];

				if(i < rangeActive[thisFinger.clusterID].earliest) {
					// change the earliest timestep
					rangeActive[thisFinger.clusterID].earliest = i;
				}

				if(i > rangeActive[thisFinger.clusterID].latest) {
					// change the latest timestep
					rangeActive[thisFinger.clusterID].latest = i;
				}

			}
		}

		for(var i = start; i <= end; i++){
			for(var j = 0; j < numClusters; j++) {
				// add the finger to the list of previous
				if(nextArray[i][j] !== -1) {
					if(arrGetIndOfVal(prevIDs[nextArray[i][j]].values, j) === -1){
						prevIDs[nextArray[i][j]].values.push(j);
						// console.log("Pushing", j, "to", nextArray[i][j]); // debug
					}
				}
			}
		}

		// Arrange values in each prevIDs index by the end time of the index
		// with the sameID in the middle, earlier clusters closer to the middle
		// later clusters to the sides
		for(var i = 0; i < numClusters; i++) {
			prevIDs[i].values.sort(function(a,b) {
				return rangeActive[b].latest - rangeActive[a].latest;
			});

			var newArr1 = [];
			var newArr2 = [];
			var addToNext = 1;

			// iterate through values and alternate pushing to 2 arrays
			// after we will have newArr1 and newArr2 each with every other
			// number in prevIDs (descending)
			var currentElement = 0;
			while(currentElement < prevIDs[i].values.length) {
				if(prevIDs[i].values[currentElement] !== i) {
					// if it's not the current ID
					if(addToNext === 1){
						newArr1.push(prevIDs[i].values[currentElement]);
						addToNext = 2;
					}
					else {
						newArr2.push(prevIDs[i].values[currentElement]);
						addToNext = 1;
					}
				}

				currentElement++;
			}

			// now that they are split into arrays, concatenate them back
			// after reversing newArr2
			// => [newArr1] + [i] + [newArr2].reverse()
			newArr2.reverse();
			prevIDs[i].values = newArr1.concat([i], newArr2);
			// console.log(prevIDs[i].values); // debug

		}
		// construct map [0, ... , numClusters] -> [(more balanced graph)]
		var mapArr = [];
		for(var i = 0; i < fingersOverTime[end].length; i++){
			mapArr = mapArr.concat(constructGraphMapArr(fingersOverTime[end][i].clusterID, prevIDs));
		}

		for(var i = 0; i < numClusters; i++){
			indexMap[i] = -1;
		}

		// create array to do mapping
		for(var i = 0; i < mapArr.length; i++){
			if(indexMap[mapArr[i]] === -1) {
				indexMap[mapArr[i]] = i;
			}
		}

		for(var i = start; i <= end; i++){

			for(var j = 0; j < numClusters; j++) {
				if(nextArray[i][j] != -1) {
					mySVG.append("line")
						.attr("class", "fingerTransition")
						.attr("x1", (xSpacing * (i-start)) + xSpacing/2)
						.attr("x2", (xSpacing * (i+1-start)) + xSpacing/2)
						.attr("y1", (height - (ySpacing + (ySpacing*indexMap[j]))))
						.attr("y2", (height - (ySpacing + (ySpacing*indexMap[nextArray[i][j]]))))
						.style("stroke", "white")
						.style("stroke-width", lineThickness(concArray[i][j]));
				}
			}

			for(var j = 0; j < numClusters; j++) {

				mySVG.append("circle")
					.datum({timestep: i, id: j, conc: concArray[i][j].toFixed(2), includes: includedArray[i][j]})
					.attr("class", "fingerPoint")
					.attr("cy", (height - (ySpacing + (ySpacing*indexMap[j]))))
					.attr("cx", (xSpacing * (i-start)) + xSpacing/2)
					.attr("r", concArray[i][j] === 0 ? 0 : fingerSize(sizeArray[i][j]))
					.style("fill", fingerColor(concArray[i][j]))
					.style("stroke", "white")
					// .on("click", function(d){ console.log(d); });

					.on('mousemove', function(d) {
						var matrix = this.getScreenCTM()
        			.translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
						tooltip.classed("hidden", false)
							.html("ID: " + d.id + "<br>Timestep: " + d.timestep + "<br>Concentration: " + d.conc)
							.style("left", (window.pageXOffset + matrix.e + 15) + "px")
			        .style("top", (window.pageYOffset + matrix.f - 80) + "px");
					})
					.on('mouseout', function() {
						tooltip.classed("hidden", true);
					});
			}
		}

	}

	function arrGetIndOfVal(arr, val) {
		// console.log("Finding", arr, val); // debug

		for(var i = 0; i < arr.length; i++) {
			if(arr[i] === val) {
				return i;
			}
		}
		return -1;
	}

	/*
	// arr MUST BE IN THE SAME FORMAT AS prevIDs FROM drawFingerGraph()
	// IN THE FORM [[],[],...] WHERE THE INNER ARRAYS HAVE VALUES WHICH
	// CORRESPOND TO THE OTHER IDs CONNECTED AT ANY POINT TO THE ID AT THAT
	// INDEX, ALSO CONTAINING ITS OWN ID.
	function getSubtreeWidths(arr) {
		var totalWidth;
		for(var i = 0; i < arr.length; i++) {
			if(arr[i].subSize === -1) {
				// if the subtree width is not yet known
				getSubtreeWidthsREC(arr, i);
			}
		}
	}

	// RECURSIVE HELPER METHOD - used since graph isn't rooted
	function getSubtreeWidthsREC(arr, index) {
		var totalWidth = 1; // starts with self
		for(var i = 0; i < arr[index].values.length; i++) {

		}
	}
	USING OTHER METHOD */

	// USE FOR EACH NODE IN THE LAST TIMESTEP, THEN CONCATENATE IN A NICE ORDER
	function constructGraphMapArr(index, prevIDs) {
		// console.log("construchGraphMapArr(", index); //debug

		var previousArr = [];
		var nextArr = [];
		var insertInto = 0; // 0-previous, 1-next

		if(prevIDs[index].values.length === 1){ // base case, has no prev besides itself
			// console.log("Index:",index,"Returning:",[index]); // debug
			return [index];
		}
		else if(prevIDs[index].fullSubArr.length != 0){ // if already calculated (shouldnt ever be though)
			// console.log("Index:",index,"Returning:",prevIDs[index].fullSubArr); // debug
			return prevIDs[index].fullSubArr;
		}
		else {
			for(var i = 0; i < prevIDs[index].values.length; i++) {
				if(prevIDs[index].values[i] === index) {
					insertInto = 1;
				}
				else {
					if(insertInto === 0){
						previousArr = previousArr.concat(constructGraphMapArr(prevIDs[index].values[i], prevIDs));
					}
					else{
						nextArr = nextArr.concat(constructGraphMapArr(prevIDs[index].values[i], prevIDs));
					}
				}
			}
			prevIDs[index].fullSubArr = previousArr.concat([index], nextArr);
			// console.log("Index:",index,"Returning:",prevIDs[index].fullSubArr); // debug
			return prevIDs[index].fullSubArr;
		}
	}

	function updateFingerGraphFileLine() {
		d3.select(".fingerFileIndicator")
		.attr("x1", (xSpacing * (filePick-startFile)) + xSpacing/2)
		.attr("x2", (xSpacing * (filePick-startFile)) + xSpacing/2);
	}

	var mean, stddev, maxConc;

	/**
	* Reads the csv file specified.
	*/
	function readFileNumCSV(n) {

		data = [];

		d3.csv(folderPath + ('000' + n).substr(-3) + ".csv")
		.row(function(d) {

			var el = {
				concentration: Number(d.concentration),
				Points0: Number(d.Points0),
				Points1: Number(d.Points1),
				Points2: Number(d.Points2),
				velocity0: Number(d.velocity0),
				velocity1: Number(d.velocity1),
				velocity2: Number(d.velocity2)

			};

			data.push(el);
		})
		.get(function(error, rows) {
			/*
			console.log(n, ":", d3.mean(data[n], function(d){
			return d.concentration;
		}));
		*/
		console.log(n, "read (CSV).");

		mean = d3.mean(data, function (e) { return e.concentration; });
		stddev = d3.deviation(data, function (e) { return e.concentration; });

		maxConc = d3.max(data, function(el) {
			return el.concentration;
		});
		/*
		window.onload = function() {
		document.getElementById("scaleMin").innerHTML = mean.toFixed(2);
		document.getElementById("scaleMax").innerHTML = maxConc.toFixed(2);
	}
	*/
	d3.select("#scaleMin").text(mean.toFixed(2));
	d3.select("#scaleMax").text(maxConc.toFixed(2));

	color.domain([mean, maxConc]);

	// read in cluster data
	d3.json(folderPath + "allClusters.json", function(error, json) {
		clusterData = json;
	});

	drawParticles(n);
	render();
	console.log("done");
});

}

function readFileNumJSON(n) {
	d3.json(folderPath + ('000' + n).substr(-3) + ".json", function(error, json) {
		data = json;

		for(var i = 0; i < data.length; i++){
			data[i].concentration = Number(data[i].concentration);
			data[i].Points0 = Number(data[i].Points0);
			data[i].Points1 = Number(data[i].Points1);
			data[i].Points2 = Number(data[i].Points2);
			data[i].velocity0 = Number(data[i].velocity0);
			data[i].velocity1 = Number(data[i].velocity1);
			data[i].velocity2 = Number(data[i].velocity2);

		}

		console.log(n, "read (JSON).");

		mean = d3.mean(data, function (e) { return e.concentration; });
		stddev = d3.deviation(data, function (e) { return e.concentration; });

		maxConc = d3.max(data, function(el) {
			return el.concentration;
		});

		d3.select("#scaleMin").text(mean.toFixed(2));
		d3.select("#scaleMax").text(maxConc.toFixed(2));

		color.domain([mean, maxConc]);

		// read in cluster data
		d3.json(folderPath + "allClusters.json", function(error, json) {
			clusterData = json;
		});

		drawParticles(n);
		render();
		console.log("done");
	});

}

function downloadJSON(data2JSON) {
	var json = JSON.stringify(data2JSON)

	var csvWin = window.open("","","");
	csvWin.document.write('<meta name="content-type" content="text/csv">');
	csvWin.document.write('<meta name="content-disposition" content="attachment;  filename=test.csv">  ');
	csvWin.document.write(json);
}

/**
* Draw a slider to move the slice position.
*/
function sliderMove() {
	var yMin = -5, yMax = 5;
	var sliderHeight = 50;

	var x = d3.scale.linear()
	.domain([yMin, yMax])
	.range([WIDTH * .04, WIDTH * .96])
	.clamp(true);

	var brush = d3.svg.brush()
	.x(x)
	.extent([0, 0])
	.on("brush", brushed);

	var svgSlider = d3.select("#sliderDiv").append("svg")
	.attr("class", "svgSlider")
	.attr("width", WIDTH)
	.attr("height", sliderHeight);

	svgSlider.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " + sliderHeight / 2 + ")")
	.call(d3.svg.axis()
	.scale(x)
	.orient("bottom")
	// .tickFormat(function(d){return d.toFixed(2)})
	.tickSize(0)
	.tickPadding(10)
	.tickValues([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]))
	.select(".domain")
	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	.attr("class", "halo");

	var slider = svgSlider.append("g")
	.attr("class", "slider")
	.call(brush);

	slider.selectAll(".extent,.resize")
	.remove();

	slider.select(".background")
	.attr("height", sliderHeight);

	var handle = slider.append("g")
	.attr("class", "handle")

	handle.append("path")
	.attr("transform", "translate(0, " + sliderHeight / 2 + ")")
	.attr("d", "M 0 -5 V 5")

	handle.append("text")
	.text(yMin)
	.attr("transform", "translate(" + -12 + ", " + (sliderHeight / 2 - 10) + ")")

	slider
	.call(brush.event);

	function brushed() {
		var value = brush.extent()[0];

		if (d3.event.sourceEvent) { // not a programmatic event
			value = x.invert(d3.mouse(this)[0]);
			brush.extent([value, value]);
		}

		handle.attr("transform", "translate(" + x(value) + ", 0)");
		handle.select("text").text(value.toFixed(2));
		sliceGroup.position.setY(value);
	}

}

// mouse and keyboard control funtions

/**
* Zoom in and out the scene using mouse wheel. This uses the TrackballControls.js file.
*/
function mouseWheelZoom() {
	controls.target.set(0, 0, 6);
	controls.zoomSpeed = 0.15;
	controls.noRotate = true;
	controls.noZoom = false;
	controls.noPan = true;
	controls.minDistance = 5.5;
	controls.maxDistance = 20;
}

/**
* Rotates the cylinder when mouse is clicked and dragged.
*/
function mouseDragRotate (){
	var myClock = new THREE.Clock();
	var isDragging = false;
	var isPanning = false;
	var previousMousePosition = {
		x: 0,
		y: 0
	};
	$(renderer.domElement).on('mousedown', function(e) {
			switch (e.which) {
				case 1:
					d3.select('#cylinder').style('cursor', 'ew-resize');
					isDragging = true;
					break;
				case 3:
					d3.select('#cylinder').style('cursor', 'move');
					isPanning = true;
					break;
			}
	})
	.on('mousemove', function(e) {
		//console.log(e);
		var deltaMove = {
			x: e.offsetX - previousMousePosition.x,
			y: e.offsetY - previousMousePosition.y
		};
		if(isDragging) {
			particleSystem.rotation.z += (deltaMove.x * 1) * Math.PI/180;
		}
		if(isPanning) {
			camera.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), deltaMove.x * -0.4 * Math.PI/180);
			if (camera.position.z >= 5 && camera.position.z <= 12.5)
				camera.position.z += deltaMove.y * 0.07;
			if (camera.position.z < 5)
				camera.position.z = 5;
			if (camera.position.z > 12.5)
			 camera.position.z = 12.5;
		}
		previousMousePosition = {
			x: e.offsetX,
			y: e.offsetY
		};
	});
	/* */

	$(document).on('mouseup', function(e) {
		isDragging = false;
		isPanning = false;
		// refresh the slice after the user is done dragging
		if (e.which === 1) { refreshSlice(); } // only needs slice refresh on left click up
		d3.select('#cylinder').style('cursor', 'default');
	});
}

/**
* Processes keyboad commands to move the camera up and down or rotate the scene.
*/
function keyboardListener() {
	var pressed = false;
	if (keyboard.pressed("up")) {
		if (camera.position.z <= 12.5) camera.position.z += 0.03;
		pressed = true;
	}
	if (keyboard.pressed("down")) {
		if (camera.position.z >= 5) camera.position.z -= 0.03;
		pressed = true;
	}
	if (keyboard.pressed("left")) {
		camera.position = camera.position.applyAxisAngle(new THREE.Vector3(0,0,1), -Math.PI * 0.3/180);
		pressed = true;
	}
	if (keyboard.pressed("right")) {
		camera.position = camera.position.applyAxisAngle(new THREE.Vector3(0,0,1), Math.PI * 0.3/180);
		pressed = true;
	}
	if (pressed) {
		camera.updateProjectionMatrix();
		camera.lookAt(new THREE.Vector3(0, 0, 6));
	}
}

function populateDropdown() {
	var select = document.getElementById("timeDropdown");
	// var first = 23, last = 45;
	var i;
	for(i = startFile; i <= endFile; i++) {
		var opt = i.toString();
		var el = document.createElement("option");
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	}
}

/**
* Processes the selected options in the menu.
*/
function menuListener() {
	d3.selectAll('input[name="viewCylinder"]').on("change", function() {
		sliceColorMode = Number(this.value);
		recolor3DModel();
	});
	d3.selectAll('select[name="time"]').on("change", function() {
		filePick = Number(this.value);
		// readFileNumCSV(filePick);
		readFileNumJSON(filePick);
		updateFingerGraphFileLine();
	});
	d3.selectAll('input[name="colorScheme"]').on("change", function() {
		colorSchemeChoice = Number(this.value);
		colorSplit = colorScheme[colorSchemeChoice].split(",");
		// color = d3.scale.quantile()
		// .range(colorSplit);
		// colorSlice = d3.scale.quantile()
		// .range(colorSplit);
		recolorAll();
	});

}
