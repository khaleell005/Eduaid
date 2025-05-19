        // DOM Elements
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const micButton = document.getElementById('mic-button');
        const languageSelector = document.getElementById('language-selector');

        // Auto-resize text area
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.scrollHeight > 150) {
                this.style.overflowY = 'auto';
            } else {
                this.style.overflowY = 'hidden';
            }
        });

        // Send message function
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message === '') return;

            // Add user message to chat
            addMessage(message, 'user');
            
            // Clear input
            chatInput.value = '';
            chatInput.style.height = 'auto';
            
            // Show bot is typing
            showTypingIndicator();
            
            // Process message and get response after a delay
            setTimeout(() => {
                removeTypingIndicator();
                const botResponse = getBotResponse(message);
                addMessage(botResponse, 'bot');
            }, 1500);
        }

        // Add message to chat
        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            
            // Message content
            messageDiv.innerHTML = `
                <div>${text}</div>
                <div class="message-time">${getCurrentTime()}</div>
            `;
            
            // Add actions for bot messages
            if (sender === 'bot') {
                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('message-actions');
                actionsDiv.innerHTML = `
                    <button class="action-button read-aloud-btn">
                        <span>🔊</span> Read Aloud
                    </button>
                `;
                messageDiv.appendChild(actionsDiv);
                
                // Add event listener for read aloud button
                actionsDiv.querySelector('.read-aloud-btn').addEventListener('click', function() {
                    readAloud(text);
                });
            }
            
            chatMessages.appendChild(messageDiv);
            
            // Scroll to the bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Show typing indicator
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
            typingDiv.innerHTML = `
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Remove typing indicator
        function removeTypingIndicator() {
            const typingIndicator = document.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // Get current time
        function getCurrentTime() {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Convert 0 to 12
            return `${hours}:${minutes} ${ampm}`;
        }

        // Simple bot response database
        const botResponses = {
            "hello": "Hello! How can I help with your studies today?",
            "hi": "Hi there! Need help with assignments or study topics?",
            "help": "I can help with homework questions, explain topics, remind you of deadlines, or help organize your study schedule. What do you need assistance with?",
            "math": "What specific math topic do you need help with? I can explain concepts, solve problems, or provide practice exercises.",
            "science": "I'd be happy to help with science! Let me know if you need assistance with biology, chemistry, physics, or another branch of science.",
            "assignment": "I see you have a Math assignment due on May 20, a Physics Lab Report due on May 22, and a Group Project Meeting on May 24. Which one would you like to discuss?",
            "deadline": "Your upcoming deadlines are: Math Assignment (May 20), Physics Lab Report (May 22), and Group Project Meeting (May 24).",
            "streak": "You're on a 7-day learning streak! Keep it up to build your knowledge consistently.",
            "files": "You have two shared files: Project_Notes.pdf (shared May 15) and Chemistry_Review.docx (shared May 17). Would you like me to help you review them?",
            "thanks": "You're welcome! Is there anything else you need help with?",
            "thank you": "You're welcome! Feel free to ask if you need more assistance with your studies.",
            "bye": "Goodbye! Don't forget about your upcoming assignments. Come back anytime you need help!",
            "you": "Naam"
            
        };

        // Get bot response
        function getBotResponse(userMessage) {
            // Convert to lowercase for easier matching
            const message = userMessage.toLowerCase();
            
            // Check for keywords in the message
            for (const keyword in botResponses) {
                if (message.includes(keyword)) {
                    return botResponses[keyword];
                }
            }
            
            // Default response if no keyword is found
            return "I'm not sure how to help with that. Could you ask about your assignments, deadlines, or specific subjects you're studying?";
        }

        // Speech recognition
        function startSpeechRecognition() {
            if (!('webkitSpeechRecognition' in window)) {
                alert("Your browser doesn't support speech recognition. Try using Chrome or Edge.");
                return;
            }
            
            const recognition = new webkitSpeechRecognition();
            recognition.lang = languageSelector.value;
            recognition.continuous = false;
            recognition.interimResults = false;
            
            // Add active class to mic button
            micButton.classList.add('mic-active');
            
            recognition.onstart = function() {
                chatInput.placeholder = "Listening...";
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                chatInput.value = transcript;
                chatInput.style.height = 'auto';
                chatInput.style.height = (chatInput.scrollHeight) + 'px';
            };
            
            recognition.onend = function() {
                micButton.classList.remove('mic-active');
                chatInput.placeholder = "Type your message here...";
            };
            
            recognition.onerror = function(event) {
                micButton.classList.remove('mic-active');
                chatInput.placeholder = "Type your message here...";
                console.error("Speech recognition error", event.error);
            };
            
            recognition.start();
        }

        // Text to speech
        function readAloud(text) {
            if (!('speechSynthesis' in window)) {
                alert("Your browser doesn't support text to speech. Try using Chrome or Edge.");
                return;
            }
            
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = languageSelector.value;
            
            // Get available voices
            const voices = window.speechSynthesis.getVoices();
            
            // Find a voice matching the selected language
            for (const voice of voices) {
                if (voice.lang.includes(languageSelector.value.split('-')[0])) {
                    utterance.voice = voice;
                    break;
                }
            }
            
            window.speechSynthesis.speak(utterance);
        }

        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        micButton.addEventListener('click', startSpeechRecognition);
        
        // Load voices when the page loads
        window.speechSynthesis.onvoiceschanged = function() {
            window.speechSynthesis.getVoices();
        };
        
        // Make sure the voices are loaded
        window.speechSynthesis.getVoices();