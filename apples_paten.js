const { chromium } = require('playwright');

// Fungsi untuk menghasilkan nama acak
function generateRandomName() {
    const firstNames = ['John', 'Jane', 'Alex', 'Chris', 'Taylor', 'Jordan', 'Cameron'];
    const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return { firstName, lastName };
}

// Fungsi untuk menghasilkan tanggal lahir acak
function generateRandomBirthday() {
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = Math.floor(Math.random() * (2002 - 1980 + 1)) + 1980;
    return `${day}/${month}/${year}`;
}

// Fungsi untuk merotasi exit node Tor
async function rotateTorExitNode() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        const command = `(
            echo authenticate \"\";
            echo signal newnym;
            ) | telnet 127.0.0.1 9051`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Gagal merotasi exit node Tor:', error.message);
                reject(error);
            } else {
                console.log('Exit node Tor berhasil dirotasi:', stdout);
                resolve();
            }
        });
    });
}


// Fungsi untuk mendapatkan User-Agent acak
function getRandomUserAgent() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Fungsi untuk otomatisasi pendaftaran akun
async function automateAppleMusicSignup() {
    console.log("Menjalankan Tor proxy pada port 9050...");
    await rotateTorExitNode(); // Rotasi exit node Tor sebelum memulai

    const browser = await chromium.launch({
        headless: false,
        proxy: {
            server: 'socks5://127.0.0.1:9050', // Proxy Tor
        },
    });

    const context = await browser.newContext({
        userAgent: getRandomUserAgent(), // Rotasi User-Agent
    });
    const page = await context.newPage();

    try {
        console.log("Membuka halaman pendaftaran akun Apple Music...");
        await page.goto('https://music.apple.com/includes/commerce/account/create/form');
        await page.waitForLoadState('load');
        console.log("Halaman pendaftaran berhasil dimuat melalui Tor.");

        // 1. Mengisi email
        const emailLocal = `user${Math.floor(Math.random() * 9000) + 1000}@princeftlian.site`;
        await page.fill('#acAccountName', emailLocal);
        console.log(`Email diisi: ${emailLocal}`);

        // 2. Mengisi password
        const password = "Mines123!";
        await page.fill('#acAccountPassword', password);

        // 3. Mengisi nama
        const { firstName, lastName } = generateRandomName();
        await page.fill('#firstName', firstName);
        await page.fill('#lastName', lastName);
        console.log(`Nama diisi: ${firstName} ${lastName}`);

        // 4. Mengisi tanggal lahir
        const birthday = generateRandomBirthday();
        await page.fill('#birthday', birthday);
        console.log(`Tanggal lahir diisi: ${birthday}`);

        // 5. Uncheck marketing dan check agreedToTerms
        await page.uncheck('#marketing');
        await page.check('#agreedToTerms');

        // 6. Klik tombol Continue
        await page.click('button.web-button-form--primary');
        console.log("Formulir berhasil dikirim!");

        // Tunggu beberapa detik sebelum memeriksa inbox
        await page.waitForTimeout(Math.random() * 5000 + 2000); // Delay acak 2-7 detik

        console.log("Mencoba mendapatkan OTP dari YOPmail...");
        const otp = await scrapeYopmailInbox(emailLocal);
        if (otp) {
            console.log(`OTP diterima: ${otp}`);
            await page.fill('#passcode-input', otp);
            await page.click('button[type="submit"]');
            console.log("Akun berhasil dibuat!");
        } else {
            console.log("Gagal mendapatkan OTP.");
        }
    } catch (error) {
        console.error(`Error selama otomatisasi: ${error.message}`);
    } finally {
        await browser.close();
    }
}

// Fungsi untuk mendapatkan OTP dari YOPmail
async function scrapeYopmailInbox(emailLocal) {
    console.log("Menjalankan Tor proxy pada port 9050 untuk YOPmail...");
    await rotateTorExitNode(); // Rotasi exit node Tor sebelum memulai

    const browser = await chromium.launch({
        headless: false,
        proxy: {
            server: 'socks5://127.0.0.1:9050', // Proxy Tor
        },
    });
    const context = await browser.newContext({
        userAgent: getRandomUserAgent(), // Rotasi User-Agent
    });
    const page = await context.newPage();

    try {
        const username = emailLocal.split('@')[0];
        const inboxUrl = `https://www.yopmail.com/en/?login=${username}`;
        console.log(`Membuka kotak masuk: ${inboxUrl}`);
        await page.goto(inboxUrl);
        await page.waitForLoadState('load');
        console.log("Kotak masuk YOPmail berhasil dimuat.");

        // Tunggu email muncul
        await page.waitForSelector('iframe#ifinbox');
        const iframe = await page.frame({ name: 'ifinbox' });

        if (!iframe) {
            throw new Error("Iframe untuk inbox tidak ditemukan.");
        }

        // Klik email pertama
        await iframe.click('div.m');
        await page.waitForTimeout(Math.random() * 5000 + 2000); // Delay acak 2-7 detik

        // Tunggu isi email
        const mailFrame = await page.frame({ name: 'ifmail' });
        if (!mailFrame) {
            throw new Error("Iframe untuk isi email tidak ditemukan.");
        }

        const emailContent = await mailFrame.innerText('body');
        console.log(`Isi email: ${emailContent}`);

        // Cari OTP
        const otpMatch = emailContent.match(/\b\d{6}\b/);
        if (otpMatch) {
            console.log(`OTP ditemukan: ${otpMatch[0]}`);
            return otpMatch[0];
        } else {
            console.log("OTP tidak ditemukan dalam isi email.");
            return null;
        }
    } catch (error) {
        console.error(`Error saat mengambil OTP: ${error.message}`);
        return null;
    } finally {
        await browser.close();
    }
}

// Jalankan fungsi utama
automateAppleMusicSignup();
