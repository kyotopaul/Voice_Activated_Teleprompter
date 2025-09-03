// script.js
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startBtn');
    const clearBtn = document.getElementById('clearBtn');
    const output = document.getElementById('output');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const languageSelect = document.getElementById('language');
    
    let recognition = null;
    let isListening = false;
    let finalTranscript = '';
    
    // Check if the browser supports the Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = function() {
            isListening = true;
            statusIndicator.classList.add('active');
            statusText.textContent = 'Listening...';
            startBtn.textContent = 'Stop Listening';
            output.classList.add('pulse');
        };
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Display both interim and final results
            output.innerHTML = `<p>${finalTranscript}</p>`;
            if (interimTranscript) {
                output.innerHTML += `<p style="opacity:0.7;font-style:italic;">${interimTranscript}</p>`;
            }
            
            output.scrollTop = output.scrollHeight;
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            statusText.textContent = `Error: ${event.error}`;
            stopListening();
        };
        
        recognition.onend = function() {
            if (isListening) {
                // If we're still supposed to be listening, restart
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Error restarting recognition:', e);
                    stopListening();
                }
            }
        };
    } else {
        // Browser doesn't support speech recognition
        startBtn.disabled = true;
        statusText.textContent = 'Speech recognition not supported';
        output.innerHTML = '<p>Your browser does not support speech recognition. Please try Chrome or Edge.</p>';
    }
    
    startBtn.addEventListener('click', function() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });
    
    clearBtn.addEventListener('click', function() {
        finalTranscript = '';
        output.innerHTML = '<p>Your recognized speech will appear here...</p>';
    });
    
    function startListening() {
        if (recognition) {
            const selectedLang = languageSelect.value;
            
            // Set recognition language
            if (selectedLang === 'sheng') {
                // For Sheng, we'll use English as base and then process the words
                recognition.lang = 'en-US';
            } else {
                recognition.lang = selectedLang;
            }
            
            try {
                recognition.start();
            } catch (error) {
                console.error('Recognition start error:', error);
                statusText.textContent = 'Error starting recognition';
            }
        }
    }
    
    function stopListening() {
        if (recognition) {
            recognition.stop();
            isListening = false;
            statusIndicator.classList.remove('active');
            statusText.textContent = 'Ready to listen';
            startBtn.textContent = 'Start Listening';
            output.classList.remove('pulse');
        }
    }
    
    // Add keyboard shortcut for starting/stopping listening
    document.addEventListener('keydown', function(event) {
        if (event.key === ' ' && event.target.tagName !== 'BUTTON' && event.target.tagName !== 'SELECT') {
            event.preventDefault();
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        }
    });
    
    // Add visual feedback for speech activity
    let visualFeedback = document.createElement('div');
    visualFeedback.style.position = 'fixed';
    visualFeedback.style.bottom = '20px';
    visualFeedback.style.right = '20px';
    visualFeedback.style.width = '50px';
    visualFeedback.style.height = '50px';
    visualFeedback.style.borderRadius = '50%';
    visualFeedback.style.background = 'rgba(255, 255, 255, 0.2)';
    visualFeedback.style.display = 'flex';
    visualFeedback.style.justifyContent = 'center';
    visualFeedback.style.alignItems = 'center';
    visualFeedback.style.color = 'white';
    visualFeedback.style.fontSize = '20px';
    visualFeedback.style.opacity = '0';
    visualFeedback.style.transition = 'opacity 0.3s';
    visualFeedback.innerHTML = '🎤';
    document.body.appendChild(visualFeedback);
    
    // Simulate visual feedback for demonstration
    setInterval(() => {
        if (isListening) {
            visualFeedback.style.opacity = '1';
            visualFeedback.style.transform = `scale(${1 + Math.random() * 0.5})`;
        } else {
            visualFeedback.style.opacity = '0';
        }
    }, 300);
});