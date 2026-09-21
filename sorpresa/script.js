const canvas = document.getElementById("galaxy");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

let mouseX = 0;
let mouseY = 0;

// Cámara
let cameraZ = 0;
let targetCameraZ = 0;

let entrando = false;
let viajando = false;

let lastTime = performance.now();

const TRAVEL_SPEED = 150; // unidades por segundo
const WORLD_END = 8000;

const isMobile = window.innerWidth <= 768;

const STAR_COUNT = isMobile ? 300 : 600;
const FLOOR_COUNT = isMobile ? 700 : 1400;

const stars = [];
const floorParticles = [];

/* =========================================
   CORAZÓN DE PARTÍCULAS
========================================= */

const heartParticles = [];

function createHeart() {

    heartParticles.length = 0;

    const total = 260;

    for (let i = 0; i < total; i++) {

        const t =
            (i / total) *
            Math.PI *
            2;

        /*
           Fórmula paramétrica de corazón
        */

        const hx =
            16 *
            Math.pow(
                Math.sin(t),
                3
            );

        const hy =
            13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t);

        heartParticles.push({

            x: hx,

            y: -hy,

            phase:
                Math.random() *
                Math.PI *
                2,

            size:
                Math.random() *
                1.7 +
                0.7

        });
    }
}

createHeart();

const worldMessages = [

    // ESCENA 1
    {
        text: "Eres preciosa",
        x: -500,
        y: -140,
        z: 1200
    },

    {
        text: "Eres mi persona favorita",
        x: 520,
        y: -130,
        z: 1500
    },

    // ESCENA 2
    {
        text: "Desde que llegaste...",
        x: 0,
        y: -200,
        z: 2200
    },

    {
        text: "mis días tienen algo diferente",
        x: 300,
        y: -30,
        z: 2600
    },

    // ESCENA 3
    {
        text: "Me encanta compartir",
        x: -350,
        y: -100,
        z: 3300
    },

    {
        text: "mi tiempo contigo",
        x: 350,
        y: 30,
        z: 3650
    },

    // ESCENA 4
    {
        text: "No sé qué nos espera...",
        x: 0,
        y: -180,
        z: 4500
    },

    {
        text: "pero quiero descubrirlo contigo",
        x: 0,
        y: 40,
        z: 5000
    },

    // ESCENA 5
    {
        text: "Gracias por existir",
        x: -300,
        y: -80,
        z: 5800
    },

    {
        text: "Gracias por coincidir conmigo",
        x: 300,
        y: -50,
        z: 6200
    },

    // FINAL
    {
        text: "Entre millones de estrellas...",
        x: 0,
        y: -180,
        z: 7000
    },

    {
        text: "yo te elegiría a ti.",
        x: 0,
        y: 20,
        z: 7500
    }

];

function drawWorldMessages() {

    worldMessages.forEach(message => {

        const z = message.z - cameraZ;

        if (z <= 80) {
            return;
        }

        if (z > 2300) {
            return;
        }

        const perspective = 750 / z;

        const x =
            W / 2 +
            message.x * perspective +
            mouseX * 15;

        const y =
            H * 0.45 +
            message.y * perspective +
            mouseY * 10;

        const fontSize =
            Math.min(
                58,
                Math.max(
                    11,
                    28 * perspective
                )
            );

        let alpha = 1;

        if (z > 1800) {
            alpha = 1 - (z - 1800) / 500;
        }

        if (z < 250) {
            alpha = z / 250;
        }

        alpha = Math.max(0, Math.min(1, alpha));

        ctx.save();

        ctx.globalAlpha = alpha;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font =
            `italic ${fontSize}px Georgia`;

        ctx.fillStyle = "#fff4b0";

        ctx.shadowBlur = 12 * alpha;

        ctx.shadowColor = "#ffe45c";

        ctx.fillText(
            message.text,
            x,
            y
        );

        ctx.restore();

    });

}

const worldFlowers = [

    { x: -600, y: 120, z: 1300, size: 70 },
    { x: 600, y: 100, z: 1600, size: 65 },

    { x: -450, y: 160, z: 2400, size: 75 },
    { x: 500, y: 130, z: 2750, size: 80 },

    { x: -700, y: 120, z: 3500, size: 90 },
    { x: 650, y: 150, z: 3900, size: 75 },

    { x: -500, y: 140, z: 4700, size: 85 },
    { x: 500, y: 110, z: 5200, size: 90 },

    { x: -650, y: 130, z: 6000, size: 80 },
    { x: 650, y: 150, z: 6400, size: 80 },

    { x: -400, y: 130, z: 7200, size: 100 },
    { x: 400, y: 130, z: 7200, size: 100 }

];

document.querySelectorAll(".mensaje, #corazon").forEach(element => {
    element.style.display = "none";
});


function drawHeart() {

    ctx.save();

    /*
       El corazón también reacciona
       al acercamiento inicial.
    */

    const progress =
        Math.min(
            cameraZ / 500,
            1
        );

    const scale =
        4 +
        progress * 2.2;

    const time =
        performance.now() *
        0.002;


    ctx.translate(
        W / 2,
        H * 0.24
    );


    /* =============================
       PARTÍCULAS
    ============================= */

    heartParticles.forEach(
        particle => {

            /*
               Pequeño movimiento individual
            */

            const pulse =
                Math.sin(
                    time +
                    particle.phase
                ) *
                0.8;

            const x =
                particle.x *
                scale;

            const y =
                particle.y *
                scale;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                Math.max(
                    0.7,
                    particle.size +
                    pulse * 0.3
                ),
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(255,235,100,.95)";

            ctx.shadowBlur = 12;

            ctx.shadowColor =
                "#ffe34d";

            ctx.fill();
        }
    );


    /* =============================
       TEXTO CENTRAL
    ============================= */

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "#ffe86b";

    ctx.fillStyle =
        "#fff6ba";

    ctx.font = "italic 18px Georgia";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        "Te amo",
        0,
        12
    );


    ctx.restore();
}

/* =========================================
   CANVAS
========================================= */

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);


/* =========================================
   ESTRELLAS
========================================= */

class Star {

    constructor() {
        this.reset(true);
    }

    reset(randomZ = false) {

        this.x = (Math.random() - 0.5) * 2400;
        this.y = (Math.random() - 0.5) * 1600;

        this.z = randomZ
            ? Math.random() * 2000 + 100
            : 2000;

        this.size = Math.random() * 1.5 + 0.3;
    }

    update() {

        /*
         * Si la estrella quedó detrás de la cámara,
         * la mandamos nuevamente hacia delante.
         */

        if (this.z < cameraZ + 50) {

            this.x =
                (Math.random() - 0.5) * 2400;

            this.y =
                (Math.random() - 0.5) * 1600;

            this.z =
                cameraZ +
                1500 +
                Math.random() * 2500;

            this.size =
                Math.random() * 1.5 + 0.3;
        }
    }

    draw() {

        const z = this.z - cameraZ;

        if (z <= 10) {
            return;
        }

        const perspective = 500 / z;

        const x =
            W / 2 +
            this.x * perspective +
            mouseX * 20;

        const y =
            H / 2 +
            this.y * perspective +
            mouseY * 15;

        if (
            x < -20 ||
            x > W + 20 ||
            y < -20 ||
            y > H + 20
        ) {
            return;
        }

        const size = Math.min(
            3,
            Math.max(
                0.3,
                this.size * perspective * 4
            )
        );

        const alpha = Math.min(
            1,
            0.3 + perspective
        );

        ctx.fillStyle = `rgba(255, 232, 90, ${alpha})`;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            Math.max(0.6, size),
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


/* =========================================
   SUELO
========================================= */

class FloorParticle {

    constructor() {
        this.reset(true);
    }

    reset(randomZ = false) {

        this.x = (Math.random() - 0.5) * 3000;

        this.y = Math.random() * 300 + 80;

        this.z = randomZ
            ? Math.random() * 2200 + 100
            : 2200;

        this.size = Math.random() * 1.5 + 0.5;
    }

    update() {

        if (this.z < cameraZ + 50) {

            this.x =
                (Math.random() - 0.5) * 3000;

            this.y =
                Math.random() * 300 + 80;

            this.z =
                cameraZ +
                1500 +
                Math.random() * 2500;

            this.size =
                Math.random() * 1.5 + 0.5;
        }
    }

    draw() {

        const z = this.z - cameraZ;

        if (z <= 10) {
            return;
        }

        const perspective = 550 / z;

        const horizon = H * 0.50;

        const x =
            W / 2 +
            this.x * perspective +
            mouseX * 30;

        const y =
            horizon +
            this.y * perspective * 3;

        if (
            x < -20 ||
            x > W + 20 ||
            y < horizon ||
            y > H + 30
        ) {
            return;
        }

        const size = Math.min(
            5,
            Math.max(
                0.4,
                this.size * perspective * 4
            )
        );

        ctx.fillStyle = "rgba(255, 215, 45, .9)";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            Math.max(0.7, size),
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


/* =========================================
   CREAR PARTÍCULAS
========================================= */

for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
}

for (let i = 0; i < FLOOR_COUNT; i++) {
    floorParticles.push(
        new FloorParticle()
    );
}


/* =========================================
   GALAXIA CENTRAL
========================================= */

function drawGalaxy() {

    ctx.save();

    /*
       cameraZ va de 0 a 500.
       Esto hace que la galaxia aumente de
       tamaño durante la entrada.
    */

    const progress =
        Math.min(cameraZ / 500, 1);

    const scale =
        0.45 + progress * 0.8;

    ctx.translate(
        W / 2 + mouseX * 15,
        H * 0.50 + mouseY * 10
    );

    ctx.scale(scale, scale);

    const time =
        performance.now() * 0.00025;


    /* =============================
       ESPIRAL
    ============================= */

    ctx.shadowColor = "#ffe86b";
    ctx.shadowBlur = 7;

    for (let i = 0; i < 350; i++) {

        const angle =
            i * 0.19 + time;

        const radius =
            i * 0.20;

        const x =
            Math.cos(angle) * radius;

        const y =
            Math.sin(angle) *
            radius *
            0.25;

        const size =
            Math.random() * 0.8 + 0.3;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(255,235,110,.65)";

        ctx.fill();
    }


    /* =============================
       NÚCLEO
    ============================= */

    ctx.shadowBlur = 0;

    const glow =
        ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            80
        );

    glow.addColorStop(
        0,
        "rgba(255,255,230,1)"
    );

    glow.addColorStop(
        0.15,
        "rgba(255,235,100,.9)"
    );

    glow.addColorStop(
        0.45,
        "rgba(255,210,40,.3)"
    );

    glow.addColorStop(
        1,
        "rgba(255,200,0,0)"
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        80,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


/* =========================================
   ANIMACIÓN
========================================= */

function animate() {

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* =============================
       MOVIMIENTO DE CÁMARA
    ============================= */

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.05);

    lastTime = now;

    if (entrando && !viajando) {

        // Acercamiento inicial suave
        cameraZ +=
            (targetCameraZ - cameraZ) * 0.025;

        if (Math.abs(targetCameraZ - cameraZ) < 3) {

            cameraZ = targetCameraZ;

            viajando = true;
        }

    }

    if (viajando) {

        cameraZ +=
            TRAVEL_SPEED * delta;

        if (cameraZ >= WORLD_END) {

            cameraZ = WORLD_END;
            viajando = false;

        }
    }


    /* =============================
       ESTRELLAS
    ============================= */

    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
    }


    /* =============================
       GALAXIA
    ============================= */

    drawGalaxy();
    drawHeart();
    drawWorldMessages();
    drawWorldFlowers();


    /* =============================
       SUELO
    ============================= */

    for (let i = 0; i < floorParticles.length; i++) {
        floorParticles[i].update();
        floorParticles[i].draw();
    }


    requestAnimationFrame(animate);
}

animate();


/* =========================================
   MOUSE
========================================= */

document.addEventListener(
    "mousemove",
    event => {

        mouseX =
            event.clientX / W - 0.5;

        mouseY =
            event.clientY / H - 0.5;

    }
);


/* =========================================
   TOUCH
========================================= */

document.addEventListener(
    "touchmove",
    event => {

        if (!event.touches.length) {
            return;
        }

        const touch =
            event.touches[0];

        mouseX =
            touch.clientX / W - 0.5;

        mouseY =
            touch.clientY / H - 0.5;

    },
    {
        passive: true
    }
);


/* =========================================
   BOTÓN ENTRAR
========================================= */

const boton =
    document.getElementById("entrar");

const inicio =
    document.getElementById("inicio");

const universo =
    document.getElementById("universo");

const musica =
    document.getElementById("musica");


if (boton && inicio && universo) {

    boton.addEventListener(
        "click",
        () => {

            musica.volume = 0.5;

            musica.play().catch(error => {
                console.log("No se pudo reproducir la música:", error);
            });

            console.log("Entrando a la galaxia 🌻");

            /*
               Quitamos la portada
            */

            inicio.style.opacity = "0";

            /*
               Mostramos universo
            */

            universo.style.opacity = "1";

            /*
               Comienza movimiento
            */

            entrando = true;

            /*
               La cámara viaja hacia delante
            */

            targetCameraZ = 500;


            /*
               Quitamos completamente
               la portada después del fade
            */

            setTimeout(() => {

                inicio.style.display = "none";

            }, 1500);

        }
    );

} else {

    console.error(
        "No encontré #entrar, #inicio o #universo"
    );

}

function drawWorldFlowers() {

    worldFlowers.forEach(flower => {

        const z = flower.z - cameraZ;

        if (z <= 80 || z > 2200) {
            return;
        }

        const perspective = 700 / z;

        const x =
            W / 2 +
            flower.x * perspective;

        const y =
            H * 0.53 +
            flower.y * perspective;

        const size = Math.min(
            160,
            Math.max(
                10,
                flower.size * perspective
            )
        );

        let alpha = 1;

        if (z > 1800) {
            alpha = 1 - (z - 1800) / 400;
        }

        if (z < 200) {
            alpha = z / 200;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${size}px Arial`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ffd92f";
        ctx.fillText("🌻", x, y);
        ctx.restore();
    });
}