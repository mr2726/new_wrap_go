const getAccessBTN = document.getElementById("getaccess");
const emailInput = document.getElementById("emailinput");

// ===== TELEGRAM CONFIG =====
// ⚠️ НЕ храните токен в frontend в продакшене!
const BOT_TOKEN = "8204330335:AAF1r8x6amHYFOLN0jG11kzZdMkXs2vIoNs";
const CHAT_ID = "-1003837482797";

// ===== MAIN FUNCTION =====
async function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML"
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram error:", data);
            alert("Failed to send. Try again later.");
        } else {
            alert("✅ Early access request sent!");
            emailInput.value = ""; // очистка поля
        }
    } catch (error) {
        console.error("Request failed:", error);
        alert("Failed to send. Try again later.");
    }
}

// ===== BUTTON CLICK WITH VALIDATION =====
getAccessBTN.addEventListener("click", (e) => {
    e.preventDefault();

    const emailValue = emailInput.value.trim();

    // Проверка пустого поля
    if (!emailValue) {
        emailInput.reportValidity(); // покажет встроенное сообщение "Please fill out this field"
        return;
    }

    // Проверка формата email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        alert("❌ Enter a valid email address");
        return;
    }

    // Если всё ок — отправляем
    sendToTelegram(`🚀 Early access → ${emailValue}`);
});
