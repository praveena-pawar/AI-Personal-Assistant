// ==========================
// Global Elements
// ==========================

const askForm = document.getElementById("askForm");
const emailForm = document.getElementById("emailForm");

const answer = document.getElementById("answer");
const summary = document.getElementById("summary");

const loading = document.getElementById("ans-loading");
const summaryLoading = document.getElementById("summary-loading");

const historyContainer = document.getElementById("historyContainer");

let historyData = [];


// ==========================
// Ask AI
// ==========================

askForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    loading.style.display = "flex";

    const formData = new FormData(askForm);

    const res = await fetch("/ask", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    loading.style.display = "none";

    if (data.error) {
        answer.innerHTML = `<p style="color:red;">${data.error}</p>`;
        return;
    }

    answer.innerHTML = marked.parse(data.response);

    historyData = data.history;

    displayHistory(historyData);

    askForm.reset();

});


// ==========================
// Email Summary
// ==========================

emailForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    summaryLoading.style.display = "flex";

    const formData = new FormData(emailForm);

    const res = await fetch("/summarize", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    summaryLoading.style.display = "none";

    if (data.error) {
        summary.innerHTML = `<p style="color:red;">${data.error}</p>`;
        return;
    }

    summary.innerHTML = marked.parse(data.response);

    emailForm.reset();

});


// ==========================
// Chat History
// ==========================

function displayHistory(history) {

    historyContainer.innerHTML = "";

    if (history.length === 0) {

        historyContainer.innerHTML =
            "<p class='empty-history'>No conversations yet.</p>";

        return;
    }

    history.forEach((chat, index) => {

        const preview =
            chat.answer.length > 100
                ? chat.answer.substring(0, 100) + "..."
                : chat.answer;

        historyContainer.innerHTML += `

            <div class="history-card" onclick="loadConversation(${index})">

                <strong>You</strong>

                <p>${chat.question}</p>

                <br>

                <strong>Assistant</strong>

                <p>${preview}</p>

            </div>

        `;

    });

}


// ==========================
// Load Conversation
// ==========================

function loadConversation(index) {

    const chat = historyData[index];

    if (!chat) return;

    document.querySelector("input[name='question']").value = chat.question;

    answer.innerHTML = marked.parse(chat.answer);

}


// ==========================
// Clear History
// ==========================

document.getElementById("clearHistory").addEventListener("click", async () => {

    await fetch("/clear-history", {
        method: "POST"
    });

    historyData = [];

    historyContainer.innerHTML =
        "<p class='empty-history'>No conversations yet.</p>";

    answer.innerHTML = "";

});


// ==========================
// Copy AI Response
// ==========================

document.getElementById("copyAnswer").addEventListener("click", () => {

    navigator.clipboard.writeText(answer.innerText);

    alert("Response copied!");

});


// ==========================
// Copy Summary
// ==========================

document.getElementById("copySummary").addEventListener("click", () => {

    navigator.clipboard.writeText(summary.innerText);

    alert("Summary copied!");

});