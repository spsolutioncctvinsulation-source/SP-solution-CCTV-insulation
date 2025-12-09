// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu ---
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // --- Navbar Background ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(5, 10, 20, 0.95)';
        } else {
            navbar.style.background = 'rgba(5, 10, 20, 0.8)';
        }
    });

    // --- THREE.JS SCENE SETUP ---
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();
    // Fog for depth
    scene.fog = new THREE.FogExp2(0x050a14, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 0;
    camera.position.x = 0;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x0ea5e9, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 1, 50);
    blueLight.position.set(-5, -5, 5);
    scene.add(blueLight);

    // --- 3D OBJECTS ---

    // 1. CCTV Camera Group
    const cctvGroup = new THREE.Group();

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.8
    });
    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.5,
        metalness: 0.5
    });
    const lensMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.1,
        metalness: 0.9,
    });
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.8
    });

    // Main Body (Cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.7, 2, 32);
    bodyGeo.rotateZ(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    cctvGroup.add(body);

    // Front Cap (Black)
    const capGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, blackMat);
    cap.position.x = 1.05;
    cctvGroup.add(cap);

    // Lens
    const lensGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
    lensGeo.rotateZ(Math.PI / 2);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.x = 1.15;
    cctvGroup.add(lens);

    // Glow Ring (Lens)
    const ringGeo = new THREE.TorusGeometry(0.35, 0.02, 16, 50);
    ringGeo.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, glowMat);
    ring.position.x = 1.16;
    cctvGroup.add(ring);

    // Pivot Arm
    const armGeo = new THREE.BoxGeometry(0.4, 0.4, 1.5);
    const arm = new THREE.Mesh(armGeo, blackMat);
    arm.position.set(-0.5, 0.8, 0);
    arm.rotation.z = Math.PI / 4;
    cctvGroup.add(arm);

    // Base Mount
    const mountGeo = new THREE.CylinderGeometry(0.5, 0.8, 0.2, 32);
    const mount = new THREE.Mesh(mountGeo, bodyMat);
    mount.position.set(-1, 1.3, 0);
    cctvGroup.add(mount);

    // Add Camera Group to Scene
    scene.add(cctvGroup);

    // Initial Position
    cctvGroup.position.set(2, 0, -2);
    cctvGroup.rotation.y = -Math.PI / 4;

    // 2. Tech Grid (Floor/Background)
    const gridHelper = new THREE.GridHelper(50, 50, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -5;
    gridHelper.rotation.x = 0; // Flat
    scene.add(gridHelper);

    // 3. Security Particles/Lines
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 30;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.6
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // 4. Glowing Shield (Hidden initially)
    const shieldGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const shieldMat = new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0,
        wireframe: true
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0, 0); // Center relative to camera end position
    shield.visible = false;
    scene.add(shield);


    // --- GSAP ANIMATION ---
    gsap.registerPlugin(ScrollTrigger);

    // Timeline for Camera Movement
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
        }
    });

    // 1. Move to "About"
    tl.to(cctvGroup.position, {
        x: -2,
        y: 0.5,
        z: 0,
        duration: 2,
        ease: "power2.out"
    }, "start")
        .to(cctvGroup.rotation, {
            y: Math.PI / 4,
            x: 0.2,
            duration: 2
        }, "start");

    // 2. Move to "Services" (Center zoom)
    tl.to(cctvGroup.position, {
        x: 0,
        y: -1,
        z: 3, // Zoom in
        duration: 2,
        ease: "power2.out"
    }, "services")
        .to(cctvGroup.rotation, {
            y: 0,
            x: -0.2,
            duration: 2
        }, "services");

    // 3. Move to "Why Us"
    tl.to(cctvGroup.position, {
        x: 3,
        y: 1,
        z: -2,
        duration: 2,
        ease: "power2.out"
    }, "advantages")
        .to(cctvGroup.rotation, {
            y: -Math.PI / 2,
            duration: 2
        }, "advantages");

    // 4. Final Contact (Lock Position + Shield)
    tl.to(cctvGroup.position, {
        x: 0,
        y: 0,
        z: 1, // Close up
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
            // Pulse shield opacity when near end?
        }
    }, "contact")
        .to(cctvGroup.rotation, {
            y: 0,
            x: 0,
            duration: 2,
            onComplete: () => {
                gsap.to(shieldMat, { opacity: 0.5, duration: 1 });
                shield.visible = true;
                shield.position.copy(cctvGroup.position);
                // Pulse animation for shield
                gsap.to(shield.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1, yoyo: true, repeat: -1 });
            }
        }, "contact");


    // Text Animations
    gsap.utils.toArray('.section').forEach(section => {
        gsap.fromTo(section.querySelectorAll('h2, p, .card, .feature-item'),
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        // Gentle float for CCTV
        cctvGroup.position.y += Math.sin(Date.now() * 0.001) * 0.002;

        // Rotate Grid slightly
        gridHelper.rotation.y += 0.001;

        // Rotate Particles
        particlesMesh.rotation.y -= 0.0005;

        // Rotate Shield
        if (shield.visible) {
            shield.rotation.y += 0.01;
            shield.rotation.z += 0.005;
        }

        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
