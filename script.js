import { background, estuary, wordmark } from "asciify-engine/kit";

const hero = document.querySelector("#hero");
const bg = hero ? background(hero, {
    preset: estuary,
    clear: document.querySelector("#hero .copy"),
    cellSize: 12,
    cursor: "lantern",
}) : null;

const footerMarkEl = document.querySelector("#footer-wordmark");
let footerMark = null;
if (footerMarkEl) {
    try {
        footerMark = wordmark(footerMarkEl, {
            text: "IИFINITE",
            assemble: "scroll",
            look: { hover: "trail" }
        });
        if (footerMark && footerMark.supported !== false) {
            const fallback = footerMarkEl.querySelector(".ascii-fallback");
            if (fallback) fallback.style.display = "none";
        }
    } catch (err) {
        console.warn("Using static ASCII banner fallback for footer wordmark:", err);
    }
}

window.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !bg?.field) return;
    bg.field.pulse({ x: e.clientX, y: e.clientY });
});

window.addEventListener("pagehide", () => {
    bg?.destroy();
    footerMark?.destroy?.();
}, { once: true });

async function fixlink(link) {
    if (link.includes("/https/")) {
        const match = link.match(/\/https\/(.+)\.png/);
        if (match) {
            const extractedUrl = "https://" + match[1];
            return decodeURIComponent(extractedUrl);
        } else {
            console.error("Invalid URL format for external URL");
            return link;
        }
    } else {
        return link;
    }
}

async function fetchPresence() {
    try {
        const response = await fetch("https://fatbotproject-9826f501d8ba.herokuapp.com/infinite");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching presence:", error);
    }
}

async function create() {
    const loader = document.querySelector(".loader");
    const body = document.querySelector("body");
    body.style.overflow = "hidden";

    const data = await fetchPresence();
    if (!data) {
        body.style.overflowY = "auto";
        loader.style.opacity = "0%";
        setTimeout(() => {
            loader.style.display = "none";
        }, 1500);
        return;
    }

    const stleft = document.querySelector(".stleft");
    const stdown = document.querySelector(".stdown");
    const mar = document.createElement("div");
    mar.className = "marquee-text";
    
    const img = document.createElement("img");
    img.src = data.avatar;
    if (data.status == "Online") {
        img.style.border = "2px solid #d8d6cf";
    } else if (data.status == "Offline") {
        img.style.border = "2px solid #54534e";
    } else if (data.status == "Idle") {
        img.style.border = "2px solid #9a9890";
    } else if (data.status == "Dnd") {
        img.style.border = "2px solid #78766f";
    }
    stleft.appendChild(img);   

    if (data.status == "Offline") {
        const delta = data.delta;
        const p = document.createElement("p");
        p.className = "marquee";
        p.textContent = `Offline | Last seen ${delta}`;
        const stpresence = document.querySelector(".stpresence");
        stpresence.style.display = "none";
        mar.appendChild(p);
        stdown.appendChild(mar);
    }
    else {
        if (data.return == "None") {
            const p = document.createElement("p");
            p.className = "marquee";
            p.textContent = "...";
            const stpresence = document.querySelector(".stpresence");
            stpresence.style.display = "none";
            mar.appendChild(p);
            stdown.appendChild(mar);
        }
        if (data.return == "status") {
            const p = document.createElement("p");
            p.className = "marquee";
            p.textContent = data.name;
            const stpresence = document.querySelector(".stpresence");
            stpresence.style.display = "none";
            mar.appendChild(p);
            stdown.appendChild(mar);
        }
        if (data.return == "presence") {
            if (data.image == null) {
                const stpresence = document.querySelector(".stpresence");
                stpresence.style.display = "none";
            }
            if (data.image != null) {
                const stpresence = document.querySelector(".stpresence");
                const i = document.createElement("img");
                i.src = await fixlink(data.image);
                stpresence.appendChild(i);
            }
            const p = document.createElement("p");
            p.className = "marquee";
            if (data.type == "Listening to") {
                const i = document.createElement("i");
                i.className = "fa-solid fa-music";
                stdown.appendChild(i);

                const time = document.createElement("p");
                time.className = "time";
                stdown.appendChild(time);
                time.style.fontWeight = "500";
                time.style.marginLeft = "5px";
                time.style.width = "28px";
                time.textContent = "0:00";
                const duration = document.createElement("p");
                duration.className = "duration";
                stdown.appendChild(duration);
                duration.style.fontWeight = "500";
                duration.style.marginLeft = "5px";
            }
            if (data.type == "Playing") {
                const i = document.createElement("i");
                i.className = "fa-solid fa-gamepad";
                stdown.appendChild(i);
            }
            if (data.type == "Watching") {
                const i = document.createElement("i");
                i.className = "fa-solid fa-film";
                stdown.appendChild(i);
            }
            const content = data.type + " " + data.name;
            p.textContent = content;
            mar.appendChild(p);
            stdown.appendChild(mar);
        }
    }
    const marqueeText = document.querySelector(".marquee");
    const marqueeContainer = document.querySelector(".marquee-text");

    if (!marqueeText || !marqueeContainer) return;

    const containerWidth = marqueeContainer.offsetWidth;
    const maxAllowedWidth = containerWidth;

    if ((marqueeText.scrollWidth - containerWidth) > maxAllowedWidth) {
        marqueeText.style.animation = "marquee 10s linear infinite";
    } else {
        marqueeText.style.animation = "none";
        marqueeText.style.paddingLeft = "0px";
    }

    if (data.type == "Listening to") {
        const time = document.querySelector(".time");
        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
        }

        const duration = document.querySelector(".duration");
        duration.textContent = ` / ${formatTime(data.duration)}`;
        time.textContent = `${formatTime(data.currentTime)}`;
        data.currentTime++;
        const interval = setInterval(() => {
            if (data.currentTime < data.duration) {
                time.textContent = `${formatTime(data.currentTime)}`;
                data.currentTime++;
            } else {
                clearInterval(interval);
                document.location.reload();
            }
        }, 1000);
    }

    body.style.overflowY = "auto";
    loader.style.opacity = "0%";
    setTimeout(() => {
        loader.style.display = "none";
    }, 1500);
}
create();

const bgMusic = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = muteBtn.querySelector('i');
const volumeSlider = document.getElementById('volume-slider');
const volumeText = document.getElementById('volume-text');

bgMusic.volume = 0.5;

const updateVolumeIcon = () => {
    if (bgMusic.muted || bgMusic.volume === 0) {
        muteIcon.className = 'fa-solid fa-volume-xmark';
    } else if (bgMusic.volume < 0.5) {
        muteIcon.className = 'fa-solid fa-volume-low';
    } else {
        muteIcon.className = 'fa-solid fa-volume-high';
    }
};

const startAudio = () => {
    bgMusic.play().then(() => {
        updateVolumeIcon();
        document.removeEventListener('click', startAudio);
    }).catch(() => {
        muteIcon.className = 'fa-solid fa-volume-xmark';
    });
};

document.addEventListener('click', startAudio, { once: true });

muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    bgMusic.muted = !bgMusic.muted;
    updateVolumeIcon();
});

volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    bgMusic.volume = val / 100;
    volumeText.textContent = `${val}%`;
    if (val > 0) bgMusic.muted = false;
    updateVolumeIcon();
});