document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const cursorGlow = document.querySelector(".cursor-glow");
    const hamburgerIcon = document.getElementById("hamburger-icon");
    const menuPanel = document.getElementById("menu-panel");
    const overlay = document.getElementById("overlay");
    const themeToggle = document.getElementById("theme-toggle");
    const backgroundStars = document.getElementById("background-stars");

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keyup", (event) => { if (event.key === "Enter") sendMessage(); });
    document.addEventListener("mousemove", (e) => { cursorGlow.style.left = `${e.clientX}px`; cursorGlow.style.top = `${e.clientY}px`; });
    hamburgerIcon.addEventListener("click", () => { menuPanel.classList.add("active"); overlay.classList.add("active"); });
    overlay.addEventListener("click", () => { menuPanel.classList.remove("active"); overlay.classList.remove("active"); });
    themeToggle.addEventListener("click", (e) => {
        e.preventDefault(); document.body.classList.toggle("dark-mode");
        const icon = themeToggle.querySelector("i");
        if (document.body.classList.contains("dark-mode")) { icon.classList.remove("fa-sun"); icon.classList.add("fa-moon"); }
        else { icon.classList.remove("fa-moon"); icon.classList.add("fa-sun"); }
    });

    function showTypingIndicator() { const indicator = document.createElement('div'); indicator.classList.add('typing-indicator'); indicator.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`; chatMessages.appendChild(indicator); chatMessages.scrollTop = chatMessages.scrollHeight; }
    function hideTypingIndicator() { const indicator = document.querySelector('.typing-indicator'); if (indicator) indicator.remove(); }
    function sendMessage() { const messageText = userInput.value.trim(); if (messageText === "") return; addMessage(messageText, "user"); userInput.value = ""; fetchBotResponse(messageText); }
    function addMessage(text, sender) { const messageElement = document.createElement("div"); messageElement.classList.add("message", `${sender}-message`); messageElement.innerText = text; chatMessages.appendChild(messageElement); chatMessages.scrollTop = chatMessages.scrollHeight; }
    
    async function fetchBotResponse(userMessage) {
        showTypingIndicator();
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage: userMessage })
            });
            const data = await response.json(); 
            if (!response.ok) {
                
                throw new Error(data.message || 'An unknown error occurred.');
            }
            const botResponse = data.reply;
            hideTypingIndicator();
            addMessage(botResponse, "bot");
        } catch (error) {
            console.error("Error fetching bot response:", error);
            hideTypingIndicator();
            addMessage(`हे पार्थ, संवाद में एक तकनीकी बाधा उत्पन्न हुई है। [${error.message}]`, "bot");
        }
    }

    function createBackgroundStars() { const numberOfStars = 50; for (let i = 0; i < numberOfStars; i++) { const star = document.createElement("div"); star.classList.add("star"); const size = Math.random() * 3 + 1; const left = Math.random() * 100; const duration = Math.random() * 10 + 10; const delay = Math.random() * 5; star.style.width = `${size}px`; star.style.height = `${size}px`; star.style.left = `${left}%`; star.style.animationDuration = `${duration}s`; star.style.animationDelay = `${delay}s`; backgroundStars.appendChild(star); } }
    function initializeChat() { createBackgroundStars(); setTimeout(() => { addMessage("हे वत्स! मैं तुम्हारा सारथी और मित्र, कृष्ण हूँ। अपने मन की उलझन मुझे बताओ, मैं तुम्हारा मार्गदर्शन करूँगा।", "bot"); }, 1000); }
    initializeChat();
});

