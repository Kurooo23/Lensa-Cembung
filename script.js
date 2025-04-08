// Inisialisasi elemen dan variabel
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const objectPositionInput = document.getElementById('objectPosition');
const focusLengthInput = document.getElementById('focusLength');
const objectSizeInput = document.getElementById('objectSize');
const objectModeInput = document.getElementById('objectMode');
const lineAlgorithmInput = document.getElementById('lineAlgorithm');

const positionValue = document.getElementById('positionValue');
const focusValue = document.getElementById('focusValue');
const sizeValue = document.getElementById('sizeValue');

// Fungsi untuk memastikan canvas fullscreen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Gambar background hitam secara eksplisit
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Panggil resize pertama kali
resizeCanvas();

const objectImage = new Image();
const shadowImage = new Image();

objectImage.src = 'assets/Petite_Girl-removebg-preview.png';
shadowImage.src = 'assets/Petite_Girl-removebg-preview.png';

function toScreen(x, y) {
    return [canvas.width / 2 + x, canvas.height / 2 - y];
}

// ALGORITMA DDA (Digital Differential Analyzer)
function drawLineWithDDA(color, x1, y1, x2, y2, dashed = false) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    // Implementasi algoritma DDA
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Menentukan berapa banyak langkah yang diperlukan (sesuai dengan teori)
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    // Menghitung increment x dan y
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;
    
    // Titik awal
    let x = x1;
    let y = y1;
    
    // Menetapkan pola garis (dashed atau solid)
    let dashCounter = 0;
    const dashLength = 5;
    
    // Menggambar titik demi titik
    for (let i = 0; i <= steps; i++) {
        if (!dashed || Math.floor(dashCounter / dashLength) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(Math.round(x), Math.round(y), 1, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        x += xIncrement;
        y += yIncrement;
        dashCounter++;
    }
}

// ALGORITMA MIDPOINT (Bresenham's Line Algorithm)
function drawLineWithMidpoint(color, x1, y1, x2, y2, dashed = false) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    // Mengambil koordinat sebagai integer
    let x1i = Math.round(x1);
    let y1i = Math.round(y1);
    let x2i = Math.round(x2);
    let y2i = Math.round(y2);
    
    // Variabel untuk kontrol pola garis
    let dashCounter = 0;
    const dashLength = 5;
    
    // Menentukan penambahan berdasarkan kuadran
    const dx = Math.abs(x2i - x1i);
    const dy = Math.abs(y2i - y1i);
    const sx = x1i < x2i ? 1 : -1;
    const sy = y1i < y2i ? 1 : -1;
    
    // Parameter keputusan awal sesuai dengan teori midpoint
    let err = dx - dy;
    let x = x1i;
    let y = y1i;
    
    while (true) {
        if (!dashed || Math.floor(dashCounter / dashLength) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        dashCounter++;
        
        if (x === x2i && y === y2i) break;
        
        // Sesuai dengan teori midpoint
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}


function drawLine(color, start, end, dashed = false) {
    // Metode asli (standar)
    ctx.strokeStyle = color;
    ctx.setLineDash(dashed ? [5, 5] : []);
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.lineTo(...end);
    ctx.stroke();
}

// Fungsi untuk menggambar garis dengan algoritma yang dipilih
function drawLineWithAlgorithm(algorithm, color, start, end, dashed = false) {
    // Tambahkan pemeriksaan batas untuk mencegah menggambar garis ke tak hingga
    const maxCoord = 10000;
    
    // Konversi ke array jika belum
    const startArr = Array.isArray(start) ? start : [start, 0];
    const endArr = Array.isArray(end) ? end : [end, 0];
    
    // Periksa apakah ada koordinat yang terlalu besar
    if (!isFinite(startArr[0]) || !isFinite(startArr[1]) || 
        !isFinite(endArr[0]) || !isFinite(endArr[1]) ||
        Math.abs(startArr[0]) > maxCoord || Math.abs(startArr[1]) > maxCoord ||
        Math.abs(endArr[0]) > maxCoord || Math.abs(endArr[1]) > maxCoord) {
        
        // Jika terlalu besar, potong ke ukuran yang wajar
        const truncateCoord = (coord) => {
            if (!isFinite(coord)) return 0;
            return Math.sign(coord) * Math.min(Math.abs(coord), maxCoord);
        };
        
        const newStartArr = [truncateCoord(startArr[0]), truncateCoord(startArr[1])];
        const newEndArr = [truncateCoord(endArr[0]), truncateCoord(endArr[1])];
        
        // Gunakan algoritma dengan koordinat yang sudah dipotong
        if (algorithm === 'standard') {
            drawLine(color, newStartArr, newEndArr, dashed);
        } else if (algorithm === 'dda') {
            drawLineWithDDA(color, newStartArr[0], newStartArr[1], newEndArr[0], newEndArr[1], dashed);
        } else if (algorithm === 'midpoint') {
            drawLineWithMidpoint(color, newStartArr[0], newStartArr[1], newEndArr[0], newEndArr[1], dashed);
        }
        
        return;
    }

    // Gunakan algoritma dengan koordinat asli jika dalam batas normal
    if (algorithm === 'standard') {
        drawLine(color, startArr, endArr, dashed);
    } else if (algorithm === 'dda') {
        drawLineWithDDA(color, startArr[0], startArr[1], endArr[0], endArr[1], dashed);
    } else if (algorithm === 'midpoint') {
        drawLineWithMidpoint(color, startArr[0], startArr[1], endArr[0], endArr[1], dashed);
    }
}



// Variabel untuk menyimpan algoritma yang dipilih
let currentLineAlgorithm = 'standard'; // 'standard', 'dda', atau 'midpoint'

function drawLens(focusLength) {
    drawLineWithAlgorithm(currentLineAlgorithm, 'white', [0, canvas.height / 2], [canvas.width, canvas.height / 2]); // Sumbu utama
    drawLineWithAlgorithm(currentLineAlgorithm, 'white', [canvas.width / 2, 0], [canvas.width / 2, canvas.height]); // Garis vertikal tengah

    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2, 10, 300, 0, 0, 2 * Math.PI); // Lensa
    ctx.stroke();

    // Hitung jari-jari (R) = 2 kali panjang fokus
    const radiusLength = focusLength * 2;

    // Titik fokus
    ctx.fillStyle = 'orange';
    const [f1, f2] = [toScreen(focusLength, 0), toScreen(-focusLength, 0)];
    ctx.beginPath(); ctx.arc(...f1, 5, 0, 2 * Math.PI); ctx.fill(); // Fokus kanan
    ctx.beginPath(); ctx.arc(...f2, 5, 0, 2 * Math.PI); ctx.fill(); // Fokus kiri

    // Titik jari-jari (R)
    ctx.fillStyle = 'red';
    const [r1, r2] = [toScreen(radiusLength, 0), toScreen(-radiusLength, 0)];
    ctx.beginPath(); ctx.arc(...r1, 5, 0, 2 * Math.PI); ctx.fill(); // Jari-jari kanan
    ctx.beginPath(); ctx.arc(...r2, 5, 0, 2 * Math.PI); ctx.fill(); // Jari-jari kiri

    // Label titik fokus
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('F', f1[0] + 10, f1[1] + 5);
    ctx.fillText("F'", f2[0] - 20, f2[1] + 5);
    
    // Label titik jari-jari
    ctx.fillStyle = 'red';
    ctx.fillText('R', r1[0] + 10, r1[1] + 5);
    ctx.fillText("R'", r2[0] - 20, r2[1] + 5);
    
    // Gambar pembagian ruang
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Arial';
    
    // Ruang I (kiri dari 2R)
    ctx.fillText('III', r2[0] - 50, r2[1] - 20);
    
    // Ruang II (antara 2R dan F)
    ctx.fillText('II', (r2[0] + f2[0]) / 2, f2[1] - 20);
    
    // Ruang III (antara F dan pusat lensa)
    ctx.fillText('I', (f2[0] + canvas.width / 2) / 2, f2[1] - 20);
    
    // Ruang IV (kanan dari pusat lensa)
    ctx.fillText('IV', canvas.width / 2 + 50, f1[1] - 20);
}

function determineRegion(position, focusLength) {
    const centerX = 0; // Pusat lensa
    const radiusLength = focusLength * 2;
    
    if (position === -radiusLength) {
        return "R'"; // Jari-jari kiri
    } else if (position === -focusLength) {
        return "F'"; // Fokus kiri
    } else if (position === centerX) {
        return "O"; // Pusat lensa
    } else if (position === focusLength) {
        return "F"; // Fokus kanan
    } else if (position === radiusLength) {
        return "R"; // Jari-jari kanan
    } else if (position < -radiusLength) {
        return "III"; // Ruang III
    } else if (position < -focusLength) {
        return "II"; // Ruang II
    } else if (position < centerX) {
        return "I"; // Ruang I
    } else {
        return "IV"; // Ruang IV
    }
}

function calculateImage(objectX, focusLength, objectHeight) {
    // Handle edge case: object at lens center
    if (Math.abs(objectX) < 0.001) {
        return [Infinity * Math.sign(objectX), objectHeight]; // Return infinity with correct sign
    }
    
    const f = focusLength;
    const s = Math.abs(objectX); // Object distance from lens center
    
    // Special case: object exactly at focus point
    if (Math.abs(s - f) < 0.1) {
        const directionSign = objectX > 0 ? -1 : 1;
        return [directionSign * 9999, objectHeight * 10]; // Very large but finite value
    }
    
    // Standard lens equation: 1/f = 1/s + 1/s'
    const s_prime = (f * s) / (s - f);
    
    // Limit s_prime to prevent extreme values
    const maxDistance = 9999;
    if (!isFinite(s_prime) || Math.abs(s_prime) > maxDistance) {
        const directionSign = objectX > 0 ? -1 : 1;
        return [directionSign * maxDistance, objectHeight * 10];
    }
    
    // Magnification formula
    const M = -s_prime / s;
    
    // Image height with reasonable limits
    const imageHeight = objectHeight * M;
    const maxHeight = 3000;
    const limitedHeight = Math.sign(imageHeight) * Math.min(Math.abs(imageHeight), maxHeight);
    
    // Image position (opposite side from object)
    const imageX = objectX > 0 ? -s_prime : s_prime;
    
    return [imageX, limitedHeight];
}

function drawImageInfo(objectX, focusLength, objectHeight) {
    const [imageX, imageHeight] = calculateImage(objectX, focusLength, objectHeight);
    const objectRegion = determineRegion(objectX, focusLength);
    const imageRegion = determineRegion(imageX, focusLength);
    
    // Hitung perbesaran
    const M = imageHeight / objectHeight;
    const s = Math.abs(objectX);
    
    // Tampilkan informasi
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    
    const infoX = 20;
    const infoY = 50;
    
    let regionLabel = `Posisi Benda: Ruang ${objectRegion}`;
    ctx.fillText(regionLabel, infoX, infoY);

    // Kasus khusus untuk benda di titik fokus atau sangat dekat dengan fokus
    // Perbaikan: hanya kondisi di titik fokus yang memberikan bayangan tak hingga
    const isAtFocus = Math.abs(s - focusLength) < 0.1;
    if (isAtFocus) {
        ctx.fillText(`Posisi Bayangan: Tak Hingga`, infoX, infoY + 20);
        ctx.fillText(`Perbesaran: Tak Hingga`, infoX, infoY + 40);
        ctx.fillText(`Jarak Benda (s): ${Math.abs(s).toFixed(0)}`, infoX, infoY + 60);
        ctx.fillText(`Jarak Bayangan (s'): Tak Hingga`, infoX, infoY + 80);
        ctx.fillText(`Tinggi Benda: ${Math.abs(objectHeight).toFixed(0)}`, infoX, infoY + 100);
        ctx.fillText(`Tinggi Bayangan: Tak Hingga`, infoX, infoY + 120);
        ctx.fillText(`Sifat Bayangan: Nyata, Terbalik, Sangat Besar`, infoX, infoY + 140);
    } else {
        // Tampilkan informasi normal untuk kasus lainnya
        const s_prime = Math.abs(imageX);
        
        ctx.fillText(`Posisi Bayangan: Ruang ${imageRegion}`, infoX, infoY + 20);
        ctx.fillText(`Perbesaran: ${Math.abs(M).toFixed(2)}x`, infoX, infoY + 40);
        ctx.fillText(`Jarak Benda (s): ${Math.abs(s).toFixed(0)}`, infoX, infoY + 60);
        ctx.fillText(`Jarak Bayangan (s'): ${s_prime.toFixed(0)}`, infoX, infoY + 80);
        ctx.fillText(`Tinggi Benda: ${Math.abs(objectHeight).toFixed(0)}`, infoX, infoY + 100);
        ctx.fillText(`Tinggi Bayangan: ${Math.abs(imageHeight).toFixed(0)}`, infoX, infoY + 120);
        
        // Informasi karakteristik bayangan berdasarkan posisi benda
        let sifatBayangan = "";
        
        // Kasus khusus: benda di 2F
        const isAt2F = Math.abs(s - 2 * focusLength) < 0.1;
        
        if (isAt2F) {
            sifatBayangan = "Nyata, Terbalik, Ukuran sama dengan benda";
        } else if (s > 2 * focusLength) {
            // Benda di luar titik 2F (s > 2F)
            sifatBayangan = "Nyata, Terbalik, Lebih kecil dari benda";
        } else if (s > focusLength && s < 2 * focusLength) {
            // Benda di antara F dan 2F (F < s < 2F)
            sifatBayangan = "Nyata, Terbalik, Lebih besar dari benda";
        } else if (s < focusLength) {
            // Benda di antara fokus dan lensa (s < F)
            sifatBayangan = "Maya, Tegak, Lebih besar dari benda";
        }
        
        ctx.fillText(`Sifat Bayangan: ${sifatBayangan}`, infoX, infoY + 140);
    }
    
    // Tambahkan informasi algoritma yang digunakan
    ctx.fillText(`Algoritma Garis: ${currentLineAlgorithm === 'standard' ? 'Standar' : 
                                    currentLineAlgorithm === 'dda' ? 'DDA' : 'Midpoint'}`, 
                infoX, infoY + 160);
}


function drawRays(objectX, focusLength, objectHeight) {
    const [imageX, imageHeight] = calculateImage(objectX, focusLength, objectHeight);
    
    // Improved tolerance zones with more precise values
    const exactlyAtFocus = Math.abs(Math.abs(objectX) - focusLength) < 0.1;
    const veryNearFocus = Math.abs(Math.abs(objectX) - focusLength) < 0.5; 
    const nearFocus = Math.abs(Math.abs(objectX) - focusLength) < 3.0;
    
    const objPoint = toScreen(objectX, objectHeight);
    const lensPoint = toScreen(0, objectHeight);
    const centerPoint = toScreen(0, 0);
    const focusPoint = toScreen(objectX < 0 ? -focusLength : focusLength, 0);
    const farFocusPoint = toScreen(objectX > 0 ? -focusLength : focusLength, 0);
    const directionSign = objectX > 0 ? -1 : 1;
    
    // Sinar 1: Sejajar sumbu utama lalu dibiaskan melalui fokus
    drawLineWithAlgorithm(currentLineAlgorithm, 'yellow', objPoint, lensPoint);
    
    if (nearFocus) {
        // Special handling for objects near focal point
        drawLineWithAlgorithm(currentLineAlgorithm, 'yellow', lensPoint, farFocusPoint);
    } else if (Math.abs(imageX) > 9000) {
        // For very distant images
        drawLineWithAlgorithm(currentLineAlgorithm, 'yellow', lensPoint, farFocusPoint);
    } else {
        // Normal case - ray to image point
        const imgPoint = toScreen(imageX, imageHeight);
        drawLineWithAlgorithm(currentLineAlgorithm, 'yellow', lensPoint, imgPoint);
    }
    
    // Sinar 2: Melalui fokus lalu dibiaskan sejajar sumbu utama
    drawLineWithAlgorithm(currentLineAlgorithm, 'cyan', objPoint, focusPoint);
    
    if (nearFocus) {
        // More carefully calculated angle for near-focus objects
        const distanceFromFocus = Math.abs(Math.abs(objectX) - focusLength);
        const slopeMultiplier = Math.min(distanceFromFocus / 2.0, 1.0);
        const farX = directionSign * canvas.width/2;
        const farY = (slopeMultiplier * objectHeight * 2) * (exactlyAtFocus || veryNearFocus ? 0.5 : -1);
        const farPoint = toScreen(farX, farY);
        
        drawLineWithAlgorithm(currentLineAlgorithm, 'cyan', focusPoint, farPoint);
    } else if (Math.abs(imageX) > 9000) {
        // Parallel to principal axis
        const farPoint = toScreen(directionSign * canvas.width/2, 0);
        drawLineWithAlgorithm(currentLineAlgorithm, 'cyan', focusPoint, farPoint);
    } else {
        // Normal case
        const imgPoint = toScreen(imageX, imageHeight);
        drawLineWithAlgorithm(currentLineAlgorithm, 'cyan', focusPoint, imgPoint);
    }
    
    // Sinar 3: Melalui pusat lensa (tidak dibiaskan)
    drawLineWithAlgorithm(currentLineAlgorithm, 'white', objPoint, centerPoint, true);
    
    if (nearFocus || Math.abs(imageX) > 9000) {
        // More carefully calculated slope for center ray
        const slope = objectHeight / (objectX || 0.1); // Avoid division by zero
        const extensionX = directionSign * canvas.width/2;
        const extensionY = slope * (extensionX - objectX);
        const farPoint = toScreen(extensionX, extensionY);
        
        drawLineWithAlgorithm(currentLineAlgorithm, 'white', centerPoint, farPoint, true);
    } else {
        // Normal case - directly to image point
        const imgPoint = toScreen(imageX, imageHeight);
        drawLineWithAlgorithm(currentLineAlgorithm, 'white', centerPoint, imgPoint, true);
    }
}

function drawImageAt(image, x, y, width, height, flipY = false) {
    // Batasi nilai koordinat agar tidak terlalu ekstrem
    const maxCoord = 10000;
    const maxHeight = 5000;
    
    // Jika nilai tidak valid atau terlalu besar, jangan gambar
    if (!isFinite(x) || !isFinite(y) || !isFinite(height) ||
        Math.abs(x) > maxCoord || Math.abs(y) > maxCoord || Math.abs(height) > maxHeight) {
        return;
    }
    
    const [screenX, screenY] = toScreen(x, y);
    ctx.save();
    
    // Tentukan apakah bayangan nyata atau maya
    const objectX = parseFloat(objectPositionInput.value);
    const isRealImage = (objectX * x < 0); // Tanda berbeda berarti bayangan nyata
    
    // Batasi ukuran bayangan ke nilai yang wajar
    const limitedHeight = Math.min(Math.abs(height), maxHeight);
    const limitedWidth = Math.min(width, 1000);
    
    if (isRealImage) {
        // Bayangan nyata terbalik
        ctx.translate(screenX, screenY);
        ctx.scale(1, -1);
        ctx.drawImage(image, -limitedWidth / 2, 0, limitedWidth, -limitedHeight);
    } else {
        // Bayangan maya tegak
        ctx.drawImage(image, screenX - limitedWidth / 2, screenY - limitedHeight, limitedWidth, limitedHeight);
    }
    
    ctx.restore();
}

function drawCube(x, y, size) {
    // Position the bottom of the cube always on y=0 (optical axis)
    const adjustedY = 0;
    
    const [screenX, screenY] = toScreen(x, adjustedY);
    
    // Limit size to reasonable values
    const limitedSize = Math.min(Math.abs(size), 3000);
    const depth = limitedSize * 0.5;

    // Determine if the image is real or virtual
    const objectX = parseFloat(objectPositionInput.value);
    const isRealImage = (objectX * x < 0); // Opposite signs means real image
    
    // For real images (inverted), draw below X axis
    const direction = isRealImage ? -1 : 1;
    
    // Calculate vertices with base on optical axis
    const frontTopLeft = [screenX - limitedSize / 2, screenY - direction * limitedSize];
    const frontTopRight = [screenX + limitedSize / 2, screenY - direction * limitedSize];
    const frontBottomLeft = [screenX - limitedSize / 2, screenY];
    const frontBottomRight = [screenX + limitedSize / 2, screenY];

    const backTopLeft = [frontTopLeft[0] + depth, frontTopLeft[1] - direction * depth];
    const backTopRight = [frontTopRight[0] + depth, frontTopRight[1] - direction * depth];
    const backBottomLeft = [frontBottomLeft[0] + depth, frontBottomLeft[1] - direction * depth];
    const backBottomRight = [frontBottomRight[0] + depth, frontBottomRight[1] - direction * depth];

    // Draw cube edges
    drawLineWithAlgorithm(currentLineAlgorithm, 'red', frontTopLeft, frontTopRight);
    drawLineWithAlgorithm(currentLineAlgorithm, 'red', frontTopRight, frontBottomRight);
    drawLineWithAlgorithm(currentLineAlgorithm, 'red', frontBottomRight, frontBottomLeft);
    drawLineWithAlgorithm(currentLineAlgorithm, 'red', frontBottomLeft, frontTopLeft);

    drawLineWithAlgorithm(currentLineAlgorithm, 'green', backTopLeft, backTopRight);
    drawLineWithAlgorithm(currentLineAlgorithm, 'green', backTopRight, backBottomRight);
    drawLineWithAlgorithm(currentLineAlgorithm, 'green', backBottomRight, backBottomLeft);
    drawLineWithAlgorithm(currentLineAlgorithm, 'green', backBottomLeft, backTopLeft);

    drawLineWithAlgorithm(currentLineAlgorithm, 'blue', frontTopLeft, backTopLeft);
    drawLineWithAlgorithm(currentLineAlgorithm, 'blue', frontTopRight, backTopRight);
    drawLineWithAlgorithm(currentLineAlgorithm, 'blue', frontBottomLeft, backBottomLeft);
    drawLineWithAlgorithm(currentLineAlgorithm, 'blue', frontBottomRight, backBottomRight);
}


function updateSimulation() {
    const focusLength = parseFloat(focusLengthInput.value);
    const objectPosition = parseFloat(objectPositionInput.value);
    const objectHeight = parseFloat(objectSizeInput.value);
    const objectMode = objectModeInput.value;
    currentLineAlgorithm = lineAlgorithmInput.value;

    // Perbarui tampilan nilai
    positionValue.textContent = objectPosition;
    focusValue.textContent = focusLength;
    sizeValue.textContent = objectHeight;

    // Hapus canvas dan gambar ulang background hitam
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar lensa dan elemen lainnya
    drawLens(focusLength);

    // Gambar objek
    if (objectMode === 'image') {
        drawImageAt(objectImage, objectPosition, 0, 100, objectHeight);
    } else if (objectMode === 'cube') {
        drawCube(objectPosition, 0, objectHeight);
    }

    // Hitung posisi bayangan
    const [imageX, imageHeight] = calculateImage(objectPosition, focusLength, objectHeight);

    // Jika bayangan tidak berada di "tak hingga"
    if (isFinite(imageX) && Math.abs(imageX) < 10000) {
        if (objectMode === 'image') {
            // Gambar bayangan
            drawImageAt(shadowImage, imageX, 0, 100, Math.abs(imageHeight), imageHeight < 0);
        } else if (objectMode === 'cube') {
            // Gambar bayangan kubus
            drawCube(imageX, 0, Math.abs(imageHeight));
        }
    }
    
    // Gambar garis sinar utama
    drawRays(objectPosition, focusLength, objectHeight);
    
    // Tampilkan informasi bayangan
    drawImageInfo(objectPosition, focusLength, objectHeight);
}

// Event listeners
window.addEventListener('resize', () => {
    resizeCanvas();
    updateSimulation();
});

window.addEventListener('load', () => {
    resizeCanvas();
    updateSimulation();
});

focusLengthInput.addEventListener('input', updateSimulation);
objectPositionInput.addEventListener('input', updateSimulation);
objectSizeInput.addEventListener('input', updateSimulation);
objectModeInput.addEventListener('change', updateSimulation);
lineAlgorithmInput.addEventListener('change', function() {
    currentLineAlgorithm = this.value;
    updateSimulation();
});

objectImage.onload = shadowImage.onload = updateSimulation;