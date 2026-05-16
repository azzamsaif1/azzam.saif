const PASSWORD_HASH = '07c155663188f19cfc8294cb270916ff9bb6d6986de19a8e6ad3210afd385f12';

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

(function () {
    // --- Loading Screen ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) loadingScreen.classList.add('hide');
        }, 1500);
    });

    // --- Three.js Background ---
    // --- Three.js Background ---
    let renderer;  //  renderer   
    const canvas3d = document.getElementById('canvas3d');
    if (canvas3d) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0a0a2a, 1);

        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 1500;
        const starsPositions = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount; i++) {
            starsPositions[i * 3] = (Math.random() - 0.5) * 2000;
            starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 500 - 200;
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
        const starsMaterial = new THREE.PointsMaterial({ color: 0x00DBDE, size: 0.4 });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00DBDE, wireframe: true });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(3, 2, -5);
        scene.add(cube);

        camera.position.z = 5;
        function animate3d() {
            requestAnimationFrame(animate3d);
            stars.rotation.y += 0.0003;
            stars.rotation.x += 0.0002;
            cube.rotation.x += 0.008;
            cube.rotation.y += 0.008;
            renderer.render(scene, camera);
        }
        animate3d();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- Pixel Drawing (Profile Image) ---
    const canvas = document.getElementById('pixelCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const statusDiv = document.getElementById('drawStatus');
        const SIZE = 380;
        canvas.width = SIZE;
        canvas.height = SIZE;
        ctx.clearRect(0, 0, SIZE, SIZE);

        const MY_PHOTO = "10001142789.png";
        const img = new Image();
        img.src = "/static/assets/images/10001142789.png";

        img.onload = function () {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = SIZE;
            offCanvas.height = SIZE;
            const offCtx = offCanvas.getContext('2d');
            offCtx.drawImage(img, 0, 0, SIZE, SIZE);
            const imageData = offCtx.getImageData(0, 0, SIZE, SIZE);
            const data = imageData.data;
            let pixels = [];
            for (let y = 0; y < SIZE; y++) {
                for (let x = 0; x < SIZE; x++) {
                    const idx = (y * SIZE + x) * 4;
                    pixels.push({ x, y, r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3] });
                }
            }
            for (let i = pixels.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
            }
            let index = 0;
            const BATCH_SIZE = 300;
            function drawBatch() {
                const end = Math.min(index + BATCH_SIZE, pixels.length);
                for (let i = index; i < end; i++) {
                    const p = pixels[i];
                    if (p.a > 0) {
                        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.a / 255})`;
                        ctx.fillRect(p.x, p.y, 1, 1);
                    }
                }
                index = end;
                if (index < pixels.length) requestAnimationFrame(drawBatch);
            }
            drawBatch();
        };

        img.onerror = function () {
            if (statusDiv) {
                statusDiv.innerHTML = `❌ ERROR: Photo "${MY_PHOTO}" not found.<br>📁 Please upload your photo.`;
            }
            ctx.fillStyle = "#1a0a2a";
            ctx.fillRect(0, 0, SIZE, SIZE);
            ctx.fillStyle = "#00DBDE";
            ctx.font = "14px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Image not found", SIZE / 2, SIZE / 2);
            ctx.fillText(`Expected: ${MY_PHOTO}`, SIZE / 2, SIZE / 2 + 30);
        };
    } else {
        console.log("pixelCanvas not found - check if canvas exists in HTML");
    }

    // --- Typing Effect ---
    const phrases = ["Future Software Engineer", "Python & AI Specialist", "Digital Creator", "Problem Solver"];
    let idxP = 0, charIdx = 0;
    const typedEl = document.getElementById('typedText');
    if (typedEl) {
        function type() {
            if (charIdx < phrases[idxP].length) {
                typedEl.innerHTML = phrases[idxP].substring(0, charIdx + 1) + '<span class="typed-cursor">|</span>';
                charIdx++;
                setTimeout(type, 100);
            } else {
                setTimeout(() => {
                    charIdx = 0;
                    idxP = (idxP + 1) % phrases.length;
                    type();
                }, 2000);
            }
        }
        type();
    }

    // --- Counters ---
    function animateCounter(element, target) {
        if (!element) return;
        let current = 0;
        const increment = target / 50;
        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.innerText = target;
                clearInterval(interval);
            } else {
                element.innerText = Math.floor(current);
            }
        }, 30);
    }
    animateCounter(document.getElementById('counterProjects'), 3);
    animateCounter(document.getElementById('counterCerts'), 10);
    animateCounter(document.getElementById('counterSkills'), 6);

    // --- Modal Protection ---
    const modal = document.getElementById('certModal');
    const openBtn = document.getElementById('openModalBtn');
    const unlockBtn = document.getElementById('unlockModalBtn');
    const modalPassword = document.getElementById('modalPassword');
    const modalError = document.getElementById('modalError');
    const documentsList = document.getElementById('documentsList');

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (modal) modal.classList.add('show');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                if (documentsList) documentsList.classList.remove('show');
                if (modalPassword) modalPassword.value = '';
                if (modalError) modalError.textContent = '';
            }
        });
    }

    if (unlockBtn) {
        unlockBtn.addEventListener('click', async () => {
            const enteredPassword = modalPassword ? modalPassword.value : '';

            if (!enteredPassword) {
                if (modalError) modalError.textContent = '❌ Please enter a password!';
                return;
            }

            try {
                const enteredHash = await sha256(enteredPassword);

                if (enteredHash === PASSWORD_HASH) {
                    sessionStorage.setItem('certPassword', enteredPassword);
                    if (documentsList) documentsList.classList.add('show');
                    if (modalError) {
                        modalError.textContent = '✅ Access granted!';
                        modalError.style.color = '#00DBDE';
                    }
                    if (modalPassword) modalPassword.style.display = 'none';
                    if (unlockBtn) unlockBtn.style.display = 'none';
                    setTimeout(() => { if (modalError) modalError.textContent = ''; }, 2000);
                } else {
                    if (modalError) {
                        modalError.textContent = '❌ ACCESS DENIED - Wrong password!';
                        modalError.style.color = '#ff2d75';
                    }
                    if (documentsList) documentsList.classList.remove('show');
                }
            } catch (error) {
                console.error('SHA-256 error:', error);
                if (modalError) modalError.textContent = '❌ System error - Please try again!';
            }
        });

        if (modalPassword) {
            modalPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') unlockBtn.click();
            });
        }
    }

    // --- Scroll Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.skill-card, .project-card, .experience-card, .education-card').forEach(el => observer.observe(el));

    // --- Dark/Light Mode ---
    // --- Dark/Light Mode ---
    let isPinned = false;
    const toggleBtn = document.getElementById('themeToggle');

    function setLight() {
        document.body.style.background = '#f0f2f5';
        document.body.style.color = '#1a1a2e';
        if (toggleBtn) toggleBtn.textContent = '☀️';
        if (renderer) {
            renderer.setClearColor(0xf0f2f5, 1);
        }
    }

    function setDark() {
        document.body.style.background = '#0a0a2a';
        document.body.style.color = '#fff';
        if (toggleBtn) toggleBtn.textContent = '🌙';
        if (renderer) {
            renderer.setClearColor(0x0a0a2a, 1);
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('mouseenter', () => { setLight(); });
        toggleBtn.addEventListener('mouseleave', () => { if (!isPinned) setDark(); else setLight(); });
        toggleBtn.addEventListener('click', () => { isPinned = !isPinned; if (isPinned) setLight(); else setDark(); });
    }
})();

// ===== Interactive Portrait Effect =====
const profileFrame = document.getElementById('profileFrame');
if (profileFrame) {
    profileFrame.addEventListener('click', () => { profileFrame.classList.toggle('active'); });
    profileFrame.addEventListener('touchstart', () => { profileFrame.classList.toggle('active'); });
}

// ===== Smooth Navigation =====
document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#home') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        target.animate([
            { transform: 'scale(0.98)', filter: 'brightness(1.8)' },
            { transform: 'scale(1)', filter: 'brightness(1)' }
        ], { duration: 700, easing: 'ease-out' });
    });
});

// ===== Open Certificate Function =====
async function deriveKeyFromPassword(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );
}

function openCert(encryptedFilePath) {
    let userPassword = sessionStorage.getItem('certPassword');

    if (!userPassword) {
        userPassword = prompt("🔐 Enter password to view this certificate:");
        if (!userPassword) return;
    }

    const viewer = document.createElement('div');
    viewer.style = `position:fixed; inset:0; background:rgba(0,0,0,0.95); display:flex; justify-content:center; align-items:center; z-index:9999;`;
    viewer.innerHTML = `
        <div style="width:85%;height:90%;position:relative;">
            <button id="closeCertBtn" style="position:absolute; top:-45px; right:0; background:#00DBDE; border:none; padding:10px 18px; border-radius:50px; cursor:pointer; font-weight:bold;">✖ Close</button>
            <div id="pdfLoader" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; color:#00DBDE; gap:20px;">
                <div class="loader"></div>
                <span>🔐 Verifying & Decrypting...</span>
            </div>
            <iframe id="pdfFrame" style="width:100%;height:100%;border:none;border-radius:12px;display:none;"></iframe>
        </div>
    `;
    document.body.appendChild(viewer);

    const closeBtn = document.getElementById('closeCertBtn');
    const pdfFrame = document.getElementById('pdfFrame');
    const pdfLoader = document.getElementById('pdfLoader');

    closeBtn.onclick = () => viewer.remove();
    viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.remove(); });

    crypto.subtle.digest('SHA-256', new TextEncoder().encode(userPassword))
        .then(hash => {
            const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
            if (hashHex !== PASSWORD_HASH) throw new Error('Wrong password');
            return fetch(encryptedFilePath);
        })
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.arrayBuffer();
        })
        .then(async (encryptedData) => {
            const bytes = new Uint8Array(encryptedData);
            const salt = bytes.slice(0, 16);
            const iv = bytes.slice(16, 28);
            const encryptedContent = bytes.slice(28);

            const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(userPassword), { name: "PBKDF2" }, false, ["deriveKey"]);
            const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
            const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encryptedContent);

            const blob = new Blob([decrypted], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            pdfLoader.style.display = 'none';
            pdfFrame.style.display = 'block';
            pdfFrame.src = url;
        })
        .catch((error) => {
            console.error('Error:', error);
            pdfLoader.innerHTML = '<div style="color:#ff2d75; text-align:center;">❌ Wrong password or corrupted file!</div>';
            sessionStorage.removeItem('certPassword');
        });
}

// ===== Search functionality =====
const searchInputCert = document.getElementById('certSearch');
const certGrid = document.getElementById('certGrid');
const certItems = certGrid ? Array.from(certGrid.children) : [];
const noResultsCert = document.getElementById('noResultsMsg');

if (searchInputCert) {
    searchInputCert.addEventListener('input', function () {
        const term = this.value.toLowerCase();
        let visible = 0;
        certItems.forEach(item => {
            const text = item.innerText.toLowerCase();
            if (text.includes(term)) {
                item.style.display = '';
                visible++;
            } else {
                item.style.display = 'none';
            }
        });
        if (noResultsCert) noResultsCert.style.display = visible === 0 ? 'block' : 'none';
    });
}