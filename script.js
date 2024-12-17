const SITE_URL = "https://jadivila.com";
const SITE_NAME = "Jadivila Investment Assistant";

// Add these constants at the top of the file
const LOADING_MESSAGES = [
    "🤔 Analyzing your investment query...",
    "🔍 Checking Jadivila's project details...",
    "🏠 Calculating villa investment potential...",
    "💭 Preparing your personalized response...",
    "📊 Crunching the investment numbers...",
    "🌟 Getting the latest Jadivila insights...",
    "🎯 Tailoring information for you...",
    "📝 Crafting your detailed response..."
];

// Add these at the top of your script.js
let selectedLanguage = null;

const WELCOME_MESSAGES = {
    en: "Hello! I'm your Jadivila Investment Assistant. I specialize in our 360 sqft turnkey villa investment project. I can help you understand our unique offering, from construction specifications to ROI projections. What would you like to know about investing with Jadivila.com?",
    ms: "Hai! Saya Pembantu Pelaburan Jadivila. Saya pakar dalam projek pelaburan vila turnkey 360 kaki persegi kami. Saya boleh membantu anda memahami tawaran unik kami, dari spesifikasi pembinaan hingga unjuran ROI. Apa yang ingin anda ketahui tentang pelaburan dengan Jadivila.com?"
};

const SYSTEM_PROMPTS = {
    en: `You are Jadivila.com's professional turnkey villa investment consultant...`, // Your existing English prompt
    ms: `Anda adalah perunding pelaburan vila turnkey profesional Jadivila.com, yang mengkhusus dalam projek vila 360 kaki persegi di Malaysia.

Tanggungjawab utama anda:

1. Spesifikasi Projek Jadivila:
- Perincikan reka bentuk vila 360 kaki persegi dan pembinaan batu-bata premium kami
- Jelaskan bahawa pelanggan memerlukan tanah sendiri untuk projek turnkey
- Tonjolkan manfaat perkhidmatan pembinaan turnkey Jadivila

2. Pemahaman Sasaran Audiens:
- Penjawat awam (Gred 41)
- Guru
- Tentera yang merancang persaraan awal
- Pemilik perniagaan

3. Butiran Pelaburan:
- Berikan unjuran ROI yang jelas untuk vila Jadivila
- Terangkan potensi hasil sewa dalam pasaran semasa
- Perincikan pelan pembayaran dan pilihan pembiayaan Jadivila
- Bincangkan keperluan tanah minimum untuk reka bentuk 360 kaki persegi kami

Sentiasa format respons dengan:
- Tajuk yang jelas (menggunakan #)
- Poin bullet (menggunakan -)
- Perenggan yang teratur
- Contoh yang relevan

Ingat untuk menekankan pendekatan turnkey unik Jadivila.com sambil mengekalkan penjelasan yang mudah difahami untuk bukan profesional hartanah.`
};

// Add this new function
function selectLanguage(lang) {
    selectedLanguage = lang;
    document.getElementById('languageContainer').style.display = 'none';
    document.getElementById('setupContainer').style.display = 'block';
}

// Check if API key exists in localStorage
function checkAPIKey() {
    const apiKey = localStorage.getItem('openRouterApiKey');
    if (apiKey) {
        document.getElementById('setupContainer').style.display = 'none';
        document.getElementById('chatContainer').style.display = 'block';
        // Add welcome message in selected language
        addMessage(WELCOME_MESSAGES[selectedLanguage], 'assistant');
    }
}

// Save API key to localStorage
function saveAPIKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (apiKey) {
        localStorage.setItem('openRouterApiKey', apiKey);
        checkAPIKey();
    } else {
        alert('Please enter a valid API key');
    }
}

// Add message to chat
function addMessage(message, role) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    // Format the message if it's from the assistant
    if (role === 'assistant') {
        messageDiv.innerHTML = formatMessage(message);
    } else {
        messageDiv.textContent = message;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add this new function to format the message
function formatMessage(message) {
    // Split by new lines and process each paragraph
    const paragraphs = message.split('\n').filter(p => p.trim());
    let formattedText = '';
    
    paragraphs.forEach(paragraph => {
        // Check if it's a heading (starts with #)
        if (paragraph.startsWith('#')) {
            formattedText += `<h3>${paragraph.replace('#', '').trim()}</h3>`;
        }
        // Check if it's a list (starts with - or *)
        else if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
            const items = paragraph.split(/[\-\*]/).filter(item => item.trim());
            formattedText += '<ul>' + items.map(item => `<li>${item.trim()}</li>`).join('') + '</ul>';
        }
        // Regular paragraph
        else {
            formattedText += `<p>${paragraph}</p>`;
        }
    });
    
    return formattedText;
}

// Add this new function to show loading animation
function showLoading() {
    const chatMessages = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';
    loadingDiv.id = 'loadingMessage';
    
    const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    
    loadingDiv.innerHTML = `
        <span class="loading-text">${randomMessage}</span>
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add this function to remove loading animation
function removeLoading() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

// Send message to API
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    // Show loading animation
    showLoading();

    const apiKey = localStorage.getItem('openRouterApiKey');
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/learnlm-1.5-pro-experimental:free",
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPTS[selectedLanguage]
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ]
            })
        });

        const data = await response.json();
        // Remove loading animation
        removeLoading();
        const aiResponse = data.choices[0].message.content;
        addMessage(aiResponse, 'assistant');
    } catch (error) {
        removeLoading();
        addMessage("Sorry, I encountered an error. Please try again.", 'assistant');
        console.error('Error:', error);
    }
}

// Handle Enter key in textarea
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize the chat
document.getElementById('setupContainer').style.display = 'none';
document.getElementById('chatContainer').style.display = 'none';