document.addEventListener("DOMContentLoaded", function() {
  particlesJS.load('particles-js', 'js/particlesjs-config.json', function () {
    console.log('callback - particles.js config loaded');
  });

  //Setup WebGL
  var scene = new THREE.Scene();

  var loader = new THREE.FBXLoader();

  var material2 = new THREE.MeshStandardMaterial({
    color: 0x33cccc,
    metalness: 0.7,
    roughness: 0.7,
  });

  var color

  loader.load('Drone.fbx', function (mesh) {
    /*mesh.children.forEach(function (element) {
        var material = new THREE.MeshStandardMaterial({
            color: element.material.color,
            metalness: 1,
            roughness: 0.7,
        });
        element.material = material;
    });*/

    scene.add(mesh);
  });

  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
  scene.add(ambientLight);

  light = new THREE.DirectionalLight(0xdfebff, 1);
  light.position.set(50, 200, 100);
  light.position.multiplyScalar(1.3);

  camera.add(light);

  scene.add(camera);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.domElement.id = "glCanvas";
  document.getElementById("aboutme").appendChild(renderer.domElement);

  camera.position.z = 13;

  // controls

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;

  window.addEventListener('resize', onWindowResize, false);

  //Functions for rendering frames and handling window resizes

  var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  function onWindowResize() {
    if (window.innerWidth < 1200) {
      camera.aspect = (window.innerWidth - 300) / (window.innerWidth - 300);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth - 300, window.innerWidth - 300);
    }
    else if (window.innerWidth > 1800) {
      camera.aspect = (window.innerWidth - 1100) / (window.innerHeight * 0.66);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth - 1100, window.innerHeight * 0.66);
    }
    else {
      camera.aspect = (window.innerWidth - 600) / (window.innerHeight * 0.66);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth - 600, window.innerHeight * 0.66);
    }
  }

  //Resize the Window according to the current size
  onWindowResize();

  //Begin rendering frames
  animate();

  //Remove Loading Screen
  var loadingDiv = document.getElementById('loading-screen');
  loadingDiv.setAttribute("id", "loading-fade");
});