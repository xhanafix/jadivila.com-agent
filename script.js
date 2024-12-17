// Add these functions at the beginning of the file

// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Use preset credentials
function usePresetCredentials() {
    document.getElementById('apiKey').value = 'YOUR_API_KEY';
    document.getElementById('siteUrl').value = 'https://jadivila.com';
    document.getElementById('siteName').value = 'jadivila.com';
    saveCredentials();
}

// Load theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Store credentials in localStorage
function saveCredentials() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiKey) {
        showApiStatus('Please enter an API key', false);
        return;
    }

    // Store credentials
    localStorage.setItem('openRouterApiKey', apiKey);
    localStorage.setItem('siteUrl', 'https://jadivila.com');
    localStorage.setItem('siteName', 'jadivila.com');

    showApiStatus('API key saved successfully!', true);
    
    // Hide setup section after short delay
    setTimeout(() => {
        document.getElementById('apiSetup').classList.add('hidden');
    }, 1500);
}

// Load credentials if they exist
function loadCredentials() {
    const apiKey = localStorage.getItem('openRouterApiKey');
    const siteUrl = localStorage.getItem('siteUrl');
    const siteName = localStorage.getItem('siteName');

    if (apiKey) document.getElementById('apiKey').value = apiKey;
    if (siteUrl) document.getElementById('siteUrl').value = siteUrl;
    if (siteName) document.getElementById('siteName').value = siteName;
}

// Add message to chat history
function addMessage(content, isUser = false) {
    const chatHistory = document.getElementById('chatHistory');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    if (isUser) {
        messageDiv.textContent = content;
    } else {
        // Format AI response with basic markdown-style formatting
        let formattedContent = content
            .replace(/\n\n/g, '<br><br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^\- (.*$)/gm, '• $1<br>');
        
        messageDiv.innerHTML = formattedContent;
    }
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Send message to AI
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const message = userInput.value.trim();
    
    if (!message) return;

    // Disable input and show loading state
    sendButton.disabled = true;
    userInput.disabled = true;
    loadingSpinner.style.display = 'inline-block';

    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';

    const apiKey = localStorage.getItem('openRouterApiKey');
    const siteUrl = localStorage.getItem('siteUrl');
    const siteName = localStorage.getItem('siteName');

    if (!apiKey) {
        alert('Please set up your API credentials first!');
        resetInputState();
        return;
    }

    // Enhanced marketing prompt with better structure
    const marketingPrompt = `You are the AI sales agent for JadiVila.com, specializing in villa investments in Malaysia. Your responses should be well-structured, professional, and tailored to the Malaysian market.

PROJECT DETAILS:
- Premium villas built using conventional brick and mortar construction
- Built on empty land with proper development approvals
- Designed for passive income generation

TARGET AUDIENCE:
- Malaysian government servants (Grade 41)
- Teachers
- Soldiers planning for early retirement
- Business owners seeking investment opportunities

KEY FOCUS AREAS:
1. Investment Benefits:
   - Affordable investment structure
   - Steady rental income potential
   - Long-term ROI projections
   - Early retirement planning potential

2. Market Understanding:
   - Malaysian property investment landscape
   - Local market trends
   - Security and stability factors
   - Financial freedom aspirations

3. Sales Approach:
   - Educational content delivery
   - Objection handling
   - Trust building
   - Investment security assurance

Please respond to the following query in a structured, easy-to-read format using markdown:
# for main headings
## for subheadings
** for bold text
* for italic text
- for bullet points

User Query: ${message}

Format your response to include:
1. Direct answer to the query
2. Relevant benefits for the target audience
3. Supporting data or examples
4. Clear call-to-action or next steps`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": siteUrl,
                "X-Title": siteName,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/learnlm-1.5-pro-experimental:free",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a professional marketing and sales agent for JadiVila.com, specializing in premium villa investments in Malaysia. Your responses should be clear, structured, and focused on building trust and providing value."
                    },
                    {
                        "role": "user",
                        "content": marketingPrompt
                    }
                ]
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        addMessage(aiResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, there was an error processing your request. Please try again.');
    } finally {
        resetInputState();
    }
}

function resetInputState() {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    sendButton.disabled = false;
    userInput.disabled = false;
    loadingSpinner.style.display = 'none';
}

// Add this function to handle keyboard events
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent default enter behavior
        sendMessage();
    }
}

// Add these new functions
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('apiKey');
    const showButton = document.getElementById('showApiKey');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        showButton.textContent = '🔒';
    } else {
        apiKeyInput.type = 'password';
        showButton.textContent = '👁️';
    }
}

function showApiStatus(message, isSuccess = true) {
    const statusDiv = document.getElementById('apiStatus');
    statusDiv.textContent = message;
    statusDiv.className = `api-status ${isSuccess ? 'success' : 'error'}`;
    
    // Hide status after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCredentials();
    loadTheme();
    
    // Add event listeners
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('userInput').addEventListener('keydown', handleKeyPress);
    document.getElementById('showApiKey').addEventListener('click', toggleApiKeyVisibility);
    document.getElementById('saveApiKey').addEventListener('click', saveCredentials);
    
    // Show/hide setup section based on stored API key
    const apiKey = localStorage.getItem('openRouterApiKey');
    if (apiKey) {
        document.getElementById('apiSetup').classList.add('hidden');
    }
}); 