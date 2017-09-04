// holographic imports
import { HolographicCamera } from 'three-holographic';

// three.js imports
import 'three/examples/js/controls/OrbitControls.js' // attach plugins
import { WebGLRenderer, Scene, PerspectiveCamera, Raycaster, Clock, Color, Vector3, OrbitControls, TextureLoader, MeshStandardMaterial, MeshLambertMaterial, MeshBasicMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshPhysicalMaterial, ShaderMaterial, RawShaderMaterial, VertexColors, DataTexture, AmbientLight, DirectionalLight, PointLight, BoxBufferGeometry, SphereBufferGeometry, ConeBufferGeometry, TetrahedronBufferGeometry, TorusKnotBufferGeometry, RingBufferGeometry, DodecahedronGeometry, CylinderGeometry, RGBFormat, Mesh, BufferAttribute } from 'three';

// spatial map
import SpatialMap from './spatial-map.js';

// shaders/textures
import texture from '../res/texture.png';
import basicVertShader from './shaders/vert-basic.vert';
import basicFragShader from './shaders/frag-basic.frag';
import rawVertShader from './shaders/vert-raw.vert';
import rawFragShader from './shaders/frag-raw.frag';

// create canvas
let canvas = document.createElement(window.getViewMatrix ? 'canvas3D' : 'canvas');
if (!window.getViewMatrix) {
    document.body.appendChild(canvas);
    document.body.style.margin = document.body.style.padding = 0;
    canvas.style.width = canvas.style.height = "100%";
    let webarLink = document.getElementById('webar-link');
    webarLink.setAttribute('href', `web-ar:${webarLink.href}`);
}

// basics
let renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
let scene = new Scene();
let camera = window.experimentalHolographic === true ? new HolographicCamera() : new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
let raycaster = new Raycaster();
let clock = new Clock();
let loader = new TextureLoader();
let controls;

// spatial
let spatialMap = new SpatialMap();
let lastLocation;
let lastPress = 0;
let mappingOptions = { scanExtentMeters: { x: 5, y: 3, z: 5 }, trianglesPerCubicMeter: 100 };

// lighting
let ambientLight = new AmbientLight(0xFFFFFF, 0.5);
let directionalLight = new DirectionalLight(0xFFFFFF, 0.5);
let pointLight = new PointLight(0xFFFFFF, 0.5);

// objects
let cube = new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), new MeshLambertMaterial({ vertexColors: VertexColors }));
let sphere = new Mesh(new SphereBufferGeometry(0.1, 10, 10), new MeshPhongMaterial({ color: 0xff0000, shininess: 200 }));
let cone = new Mesh(new ConeBufferGeometry(0.1, 0.2, 10, 10), new MeshNormalMaterial());
let torus = new Mesh(new TorusKnotBufferGeometry(0.2, 0.02, 50, 50), new MeshPhysicalMaterial({ color: 0x00ff00, roughness: 0.5, metalness: 1.0 }));
let cursor = new Mesh(new RingBufferGeometry(0.005, 0.015, 20, 20), new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthTest: false }));
let dodecahedron = new Mesh(new DodecahedronGeometry(0.05), new ShaderMaterial({ vertexShader: basicVertShader, fragmentShader: basicFragShader, uniforms: { color: { value: new Color(0x00ffff) } } }));
let cylinder = new Mesh(new CylinderGeometry(0.05, 0.05, 0.1, 20), new RawShaderMaterial({ vertexShader: rawVertShader, fragmentShader: rawFragShader, uniforms: { color: { value: new Color(0x0000ff) } } }));
let tetrahedron = new Mesh(new TetrahedronBufferGeometry(0.15), new MeshStandardMaterial({ color: 0xffff00 }));

// initialisation
renderer.setSize(window.innerWidth, window.innerHeight);
loader.setCrossOrigin('anonymous');
directionalLight.position.set(0, 1, 1);
cube.position.set(0, 0, -1.5);
cube.geometry.addAttribute('color', new BufferAttribute(Float32Array.from([1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, /* right - red */ 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, /* left - blue */ 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, /* top - green */ 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, /* bottom - yellow */ 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, /* back - cyan */ 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 /* front - purple */]), 3));
sphere.position.set(0.4, 0, -1.5);
cone.position.set(-0.4, 0, -1.5);
torus.scale.set(1.5, 1.5, 1.5);
cylinder.position.set(-0.2, 0.3, -1.2);
dodecahedron.position.set(0.2, 0.3, -1.2);
tetrahedron.position.set(0, 0, 3.5);
spatialMap.visible = false;

// scene setup
camera.add(cursor);
scene.add(ambientLight, directionalLight, pointLight, cube, sphere, cone, cylinder, dodecahedron, tetrahedron, spatialMap, camera);
if (window.experimentalHolographic !== true) {
    camera.position.set(0, 0, 0.0001);
    controls = new OrbitControls(camera, canvas);
}

// listen for spatial input
canvas.addEventListener("sourcepress", (e) => onSpatialSourcePress(e));
canvas.addEventListener("sourcedetected", (e) => onSpatialSourceDetected(e));
canvas.addEventListener("sourceupdate", (e) => onSpatialSourceUpdate(e));
canvas.addEventListener("sourcerelease", (e) => onSpatialSourceDetected(e));
canvas.addEventListener("sourcelost", (e) => onSpatialSourceLost(e));

// load textures
loader.load(texture, tex => { cube.material.map = tex; start(); }, x => x, err => start());

function update (delta, elapsed) {
    window.requestAnimationFrame(() => update(clock.getDelta(), clock.getElapsedTime()));

    if (camera.update) camera.update();

    // animate moving objects
    pointLight.position.set(0 + 2.0 * Math.cos(elapsed * 0.5), 0, -1.5 + 2.0 * Math.sin(elapsed * 0.5));
    cube.rotation.y += 0.01;
    sphere.scale.x = sphere.scale.y = sphere.scale.z = Math.abs(Math.cos(elapsed * 0.3)) * 0.6 + 1.0;
    cone.position.y = Math.sin(elapsed * 0.5) * 0.1;
    torus.position.z = -2 - Math.abs(Math.cos(elapsed * 0.2));
    tetrahedron.rotation.x += 0.01;
    tetrahedron.rotation.y += 0.01;

    // raycasting
    raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        cursor.position.setZ(-(intersects[0].distance - 0.01));
        let direction = intersects[0].face.normal.clone().transformDirection(intersects[0].object.matrixWorld);
        cursor.lookAt(direction);
    }
    else {
        cursor.position.setZ(-2);
        cursor.lookAt(new Vector3(0, 0, 1));
    }

    renderer.render(scene, camera);
}

function start () {
    update(clock.getDelta(), clock.getElapsedTime());
}

function onSpatialSourceLost (spatialInputEvent) {
    cursor.material.color.set(0xFFFFFF);
    cursor.material.opacity = 0.5;
}

function onSpatialSourceDetected (spatialInputEvent) {
    cursor.material.color.set(0xFFFF00);
    cursor.material.opacity = 0.8;
}

function onSpatialSourcePress (spatialInputEvent) {
    cursor.material.color.set(0x00FF00);
    cursor.material.opacity = 0.8;

    let timestamp = performance.now();
    if (timestamp - lastPress < 300) {
        spatialMap.visible = !spatialMap.visible;
        if (spatialMap.visible) window.requestSpatialMappingData(onSpatialMapData, mappingOptions);
        else window.removeEventListener('spatialmapping', onSpatialMapData); // requestSpatialMappingData sets this internally
    }
    lastPress = timestamp;
}

function onSpatialMapData (spatialMapData) {
    spatialMap.setMeshData(spatialMapData);
}

function onSpatialSourceUpdate (spatialInputEvent) {
    if (spatialInputEvent.isPressed && lastLocation != null) {
        let delta = new Vector3(spatialInputEvent.location.x - lastLocation.x, spatialInputEvent.location.y - lastLocation.y, spatialInputEvent.location.z - lastLocation.z);
        delta.multiplyScalar(2.0);
        cube.position.add(delta);
    }
    if (spatialInputEvent.isPressed === true) {
        lastLocation = spatialInputEvent.location;
    }
    else {
        lastLocation = null;
    }
}