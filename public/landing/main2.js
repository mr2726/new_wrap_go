const submitBTN = document.getElementById("submitBTN");
const _name = document.getElementById("name");
const email = document.getElementById("email");
const vehicle = document.getElementById("vehicle");
const city = document.getElementById("city");
const textArea = document.getElementById("textArea");

// ===== TELEGRAM CONFIG =====
// ⚠️ Не храните токен в frontend в продакшене!
const BOT_TOKEN = "8204330335:AAF1r8x6amHYFOLN0jG11kzZdMkXs2vIoNs";
const CHAT_ID = "8451182399"; // или @channel, или -100...

// ===== MAIN FUNCTION =====
async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML"
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram error:", data);
            alert("❌ Failed to send. Try again later.");
        } else {
            alert("✅ Application sent!");
            // очистка формы после отправки
            _name.value = "";
            email.value = "";
            vehicle.value = "";
            city.value = "";
            textArea.value = "";
        }
    } catch (error) {
        console.error("Request failed:", error);
        alert("❌ Failed to send. Try again later.");
    }
}

// ===== DRIVER FORM VALIDATION + SEND =====
submitBTN.addEventListener("click", (e) => {
    e.preventDefault();

    // Trim values
    const nameVal = _name.value.trim();
    const emailVal = email.value.trim();
    const vehicleVal = vehicle.value.trim();
    const cityVal = city.value.trim();
    const infoVal = textArea.value.trim();

    // Проверка обязательных полей
    if (!nameVal || !emailVal || !vehicleVal || !cityVal) {
        alert("❌ Please fill all required fields.");
        return;
    }

    // Проверка формата email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailVal)) {
        alert("❌ Enter a valid email address.");
        return;
    }

    // Всё ок, формируем сообщение
    const message = `
<b>🚗 NEW DRIVER</b>

<b>Name:</b> ${nameVal}
<b>Email:</b> ${emailVal}
<b>Vehicle:</b> ${vehicleVal}
<b>City:</b> ${cityVal}
<b>Info:</b> ${infoVal}
    `;

    sendToTelegram(message);
});