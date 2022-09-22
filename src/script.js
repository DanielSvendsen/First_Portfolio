import './style.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

//* ------------- Texture ------------- //

const textureLoader = new THREE.TextureLoader()

const sunTexture = textureLoader.load('./map/UV_SUN_MAP.jpg')
const mercuryTexture = textureLoader.load('./map/UV_MERCURY_MAP.jpg')
const venusTexture = textureLoader.load('./map/UV_VENUS_MAP.jpg')
const earthTexture = textureLoader.load('./map/UV_EARTH_MAP.jpg')
const marsTexture = textureLoader.load('./map/UV_MARS_MAP.jpg')
const jupiterTexture = textureLoader.load('./map/UV_JUPITER_MAP.jpg')
const saturnTexture = textureLoader.load('./map/UV_SATURN_MAP.jpg')
const uranusTexture = textureLoader.load('./map/UV_URANUS_MAP.jpg')
const neptuneTexture = textureLoader.load('./map/UV_NEPTUNE_MAP.jpg')

const saturnRingTexture = textureLoader.load('./map/UV_SATURN_RING_MAP.png')

const starsTexture = textureLoader.load('./map/UV_STARS_MAP.jpg')

//* ------------- Debug ------------- //

const gui = new dat.GUI()

//* ------------- Canvas ------------- //

const canvas = document.querySelector('canvas.webgl')

//* ------------- Scene ------------- //

const scene = new THREE.Scene()

//* ------------- Lights ------------- //

const sunLight = new THREE.PointLight(0xFFFFFF, 0, 0.2);
scene.add(sunLight);

//* ------------- Sizes ------------- //

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//* ------------- Camera ------------- //

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
scene.add(camera)

//* ------------- Controls ------------- //

const controls = new OrbitControls(camera, canvas)
controls.enabled = true
controls.enableZoom = false
controls.mouseButtons.RIGHT = false

//* ------------- Renderer ------------- //

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//* ------------- Background Stars ------------- //

const geoStar = new THREE.SphereGeometry(300, 20, 20)
const matStar = new THREE.MeshBasicMaterial()
matStar.map = starsTexture
matStar.side = THREE.BackSide

const meshStars = new THREE.Mesh(geoStar, matStar)
scene.add(meshStars)

//* ------------- Create Planets ------------- //

const createPlanet = (name, texture, size, position) => {
    const geo = new THREE.SphereGeometry(size, 50, 50)
    const mat = new THREE.MeshBasicMaterial()
    mat.wireframe = false
    mat.roughness = 1
    mat.metalness = 0
    mat.map = texture


    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    if (name == 'saturn') {
        const geoRing = new THREE.RingGeometry(1, 3, 64)
        const matRing = new THREE.MeshBasicMaterial()
        matRing.wireframe = false
        matRing.roughness = 1
        matRing.metalness = 0
        matRing.map = saturnRingTexture
        matRing.side = THREE.DoubleSide
        matRing.transparent = 1

        let pos = geoRing.attributes.position;
        let v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            geoRing.attributes.uv.setXY(i, v3.length() < 2 ? 0 : 1, 1);
        }

        const meshPlane = new THREE.Mesh(geoRing, matRing)
        mesh.add(meshPlane)
    }

    if (position) {

        const geoRing = new THREE.TorusGeometry(position, 0.03, position, 128)
        const matRing = new THREE.MeshBasicMaterial()
        matRing.wireframe = false
        matRing.roughness = 1
        matRing.metalness = 1
        matRing.side = THREE.DoubleSide
        matRing.color = new THREE.Color("rgb(100, 100, 100)");
        geoRing.rotateX(1.571)

        const meshPlane = new THREE.Mesh(geoRing, matRing)
        scene.add(meshPlane)

    }


    const light = new THREE.PointLight(0xFFFFFF, 1.5, 0.2);
    light.name = name + 'Light'
    scene.add(light);
    return { mesh }
}

//+ ------------- Planet Data ------------- //

let time = 0.01

let Away = 3

let planetData = {
    sun: {
        time: 5000 / time,
    },
    mercury: {
        position: 1.36 * Away,
        time: 88 / time,
    },
    venus: {
        position: 1.67 * Away,
        time: 225 / time,
    },
    earth: {
        position: 1.93 * Away,
        time: 365 / time,
    },
    mars: {
        position: 2.42 * Away,
        time: 687 / time,
    },
    jupiter: {
        position: 4.84 * Away,
        time: 4333 / time,
    },
    saturn: {
        position: 8.86 * Away,
        time: 11000 / time,
    },
    uranus: {
        position: 13 * Away,
        time: 30660 / time,
    },
    neptune: {
        position: 18 * Away,
        time: 60200 / time,
    },
}

let size = 20

//+ ------------- Create The Planets ------------- //

const sun = createPlanet('sun', sunTexture, 0.696340 * 4)
const mercury = createPlanet('mercury', mercuryTexture, 0.002439 * size, planetData.mercury.position)
const venus = createPlanet('venus', venusTexture, 0.006051 * size, planetData.venus.position)
const earth = createPlanet('earth', earthTexture, 0.006371 * size, planetData.earth.position)
const mars = createPlanet('mars', marsTexture, 0.003389 * size, planetData.mars.position)
const jupiter = createPlanet('jupiter', jupiterTexture, 0.069911 * size, planetData.jupiter.position)
const saturn = createPlanet('saturn', saturnTexture, 0.058232 * size, planetData.saturn.position)
const uranus = createPlanet('uranus', uranusTexture, 0.025362 * size, planetData.uranus.position)
const neptune = createPlanet('neptune', neptuneTexture, 0.024622 * size, planetData.neptune.position)


//* ------------- Text Box And Slide ------------- //

let planetArray = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune]
let planetLoop = sun
let planetIndex = 0

let ZoomIn = true

//+ ------------- Buttons ------------- //

const btnUI = document.querySelector('.UI')

const timeNum = document.querySelector('.Time')

const PrevPlanet = document.querySelector('.PrevPlanet')
const NextPlanet = document.querySelector('.NextPlanet')

const btnBack = document.querySelector('.Back')
const btnZoom = document.querySelector('.Zoom')

//+ ------------- Container ------------- //

const ContainerUI = document.querySelector('.ContainerUI')

//+ ------------- Boxs ------------- //

const boxInfo = document.querySelector('.boxInfo')

const boxSun = document.querySelector('.boxSun')
const boxMercury = document.querySelector('.boxMercury')
const boxVenus = document.querySelector('.boxVenus')
const boxEarth = document.querySelector('.boxEarth')
const boxMars = document.querySelector('.boxMars')
const boxJupiter = document.querySelector('.boxJupiter')
const boxSaturn = document.querySelector('.boxSaturn')
const boxUranus = document.querySelector('.boxUranus')
const boxNeptune = document.querySelector('.boxNeptune')

let boxList = [boxSun, boxMercury, boxVenus, boxEarth, boxMars, boxJupiter, boxSaturn, boxUranus, boxNeptune]

let autoPosition = true;

let btnBackBool = false

//+ ------------- Funtion That Runs When You Click Back Button And When Website Starts ------------- //

const start = () => {

    controls.enabled = true

    ZoomIn = false

    btnBack.style.display = 'none'
    btnZoom.style.display = 'none'
    timeNum.style.display = 'block'

    boxList.forEach(elm => {
        elm.style.display = 'none'
    });

    boxInfo.style.display = 'block'


    if (!btnBackBool) {
        planetIndex = -1

        camera.position.x = 0
        camera.position.y = 45
        camera.position.z = 0
    }

}

start()

if (planetLoop == sun) {
    autoPosition = true;
}

let btnZoomData = true

//+ ------------- UI Button Click ------------- //

btnUI.addEventListener('click', function () {
    if (btnUI.textContent == 'Close UI') {
        btnUI.textContent = 'Open UI'
        ContainerUI.style.display = 'none'
    } else {
        btnUI.textContent = 'Close UI'
        ContainerUI.style.display = 'block'
    }
})

//+ ------------- Zoom Button Click ------------- //

btnZoom.addEventListener('click', function () {
    if (btnZoomData) {
        btnZoomData = false
    } else {
        btnZoomData = true
    }
    animateZoom()
})

//+ ------------- Animate Zoom ------------- //

const animateZoom = () => {

    autoPosition = false
    controls.enabled = false

    var xx = planetLoop.mesh.position.x
    var yy = planetLoop.mesh.position.y
    var zz = planetLoop.mesh.position.z

    if (camera.position.z > planetLoop.mesh.position.z) {

        zz = planetLoop.mesh.position.z + 1

    } else {

        zz = planetLoop.mesh.position.z - 1

    }

    if (btnZoomData) {

        yy = planetLoop.mesh.geometry.parameters.radius * 3.2
        
    } else {
        
        yy = 10
        zz = planetLoop.mesh.position.z

    }


    new TWEEN.Tween(camera.position)
        .to(
            {
                x: xx,
                y: yy,
                z: zz,
            },
            1000
        )
        .start()

    autoPosition = true
}

//+ ------------- Back Button Click ------------- //

btnBack.addEventListener('click', function () {

    btnBackBool = true

    controls.enabled = false

    let a = planetLoop


    new TWEEN.Tween(camera.position)
        .to(
            {
                x: a.mesh.position.x,
                y: 0,
                z: 30,
            },
            3000
        ).start()

    controls.target.set(a.mesh.position.x, a.mesh.position.y, a.mesh.position.z)

    start()


    setTimeout(() => {

        btnBackBool = false
        controls.enabled = true

    }, 3000);
})

//+ ------------- Prev Button Click ------------- //

PrevPlanet.addEventListener('click', function () {

    boxInfo.style.display = 'none'

    boxList.forEach(elm => {
        elm.style.display = 'none'
    });

    ZoomIn = true

    timeNum.style.display = 'none'
    btnBack.style.display = 'block'
    btnZoom.style.display = 'block'

    if (planetIndex <= 0) {
        planetIndex = planetArray.length - 1
    } else {
        planetIndex -= 1
    }
    planetLoop = planetArray[planetIndex]
    boxList[planetIndex].style.display = 'block'

    animateZoom()

})

//+ ------------- Next Button Click ------------- //

NextPlanet.addEventListener('click', function () {

    timeNum.style.display = 'none'
    boxInfo.style.display = 'none'

    boxList.forEach(elm => {
        elm.style.display = 'none'
    });

    ZoomIn = true

    timeNum.style.display = 'none'
    btnBack.style.display = 'block'
    btnZoom.style.display = 'block'

    if (planetIndex + 1 == planetArray.length) {
        planetIndex = 0
    } else {
        planetIndex += 1
    }
    planetLoop = planetArray[planetIndex]
    boxList[planetIndex].style.display = 'block'

    animateZoom()
})

//+ ------------- Wheel Scoll ------------- //

addEventListener('wheel', function (event) {

    boxInfo.style.display = 'none'

    boxList.forEach(elm => {
        elm.style.display = 'none'
    });

    ZoomIn = true

    timeNum.style.display = 'none'
    btnBack.style.display = 'block'
    btnZoom.style.display = 'block'

    if (event.deltaY < 0) {
        if (planetIndex + 1 == planetArray.length) {
            planetIndex = 0
        } else {
            planetIndex += 1
        }
        planetLoop = planetArray[planetIndex]
        boxList[planetIndex].style.display = 'block'
    }
    else if (event.deltaY > 0) {
        if (planetIndex <= 0) {
            planetIndex = planetArray.length - 1
        } else {
            planetIndex -= 1
        }
        planetLoop = planetArray[planetIndex]
        boxList[planetIndex].style.display = 'block'
    }

    animateZoom()
})

//* -------------------------------------------- Animate Loop -------------------------------------------- //

const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    let startTime = 10000 * timeNum.value

    const planetPos = (name, nameMesh, rotationY, rotationX, time, position, elapsedTimePlanet) => {

        name = name + 'Light'

        nameMesh.mesh.rotation.x = rotationX * (elapsedTime + startTime / 10000) / (time * 100) * 30000
        nameMesh.mesh.rotation.z = rotationY * (elapsedTime + startTime / 10000) / (time * 100) * 30000

        if (position) {

            if (elapsedTimePlanet == 0) {
                elapsedTimePlanet = elapsedTime + startTime
            } else {
                elapsedTimePlanet += elapsedTime
            }

            nameMesh.mesh.position.x = position * Math.cos(elapsedTimePlanet / time)
            nameMesh.mesh.position.z = position * Math.sin(elapsedTimePlanet / time)

            scene.children.forEach(elm => {

                if (elm.name == name) {
                    elm.position.x = nameMesh.mesh.position.x
                    elm.position.y = nameMesh.mesh.position.y
                    elm.position.z = nameMesh.mesh.position.z
                }

            });

        }
    }

    let rota = 50


    planetPos('sun', sun, rota, rota, planetData.sun.time)
    planetPos('mercury', mercury, rota, rota, planetData.mercury.time, planetData.mercury.position, 0)
    planetPos('venus', venus, rota, rota, planetData.venus.time, planetData.venus.position, 0)
    planetPos('earth', earth, rota, rota, planetData.earth.time, planetData.earth.position, 0)
    planetPos('mars', mars, rota, rota, planetData.mars.time, planetData.mars.position, 0)
    planetPos('jupiter', jupiter, rota, rota, planetData.jupiter.time, planetData.jupiter.position, 0)
    planetPos('saturn', saturn, rota, rota, planetData.saturn.time, planetData.saturn.position, 0)
    planetPos('uranus', uranus, rota, rota, planetData.uranus.time, planetData.uranus.position, 0)
    planetPos('neptune', neptune, rota, rota, planetData.neptune.time, planetData.neptune.position, 0)

    //+ Update Orbital Controls
    controls.update()

    if (ZoomIn) {
        if (autoPosition) {

            camera.position.x = planetLoop.mesh.position.x
            camera.position.y = planetLoop.mesh.position.y

            if (btnZoomData) {

                camera.position.y = planetLoop.mesh.geometry.parameters.radius * 3.2

            } else {

                camera.position.y = 10
            }

        }

        camera.lookAt(planetLoop.mesh.position.x, planetLoop.mesh.position.y, planetLoop.mesh.position.z)


    }


    TWEEN.update()

    //+ Render
    renderer.render(scene, camera);

    //+ Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

