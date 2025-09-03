// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.2, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.1, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } }
        }
    });

    const startBtn = document.getElementById('startBtn');
    const clearBtn = document.getElementById('clearBtn');
    const output = document.getElementById('output');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const languageSelect = document.getElementById('language');
    const wordCountEl = document.getElementById('wordCount');
    const charCountEl = document.getElementById('charCount');
    const languageStatEl = document.getElementById('languageStat');
    const visualizer = document.getElementById('visualizer');
    
    let recognition = null;
    let isListening = false;
    let finalTranscript = '';
    
    // Create audio visualizer bars
    createVisualizer();
    
    // Check if the browser supports the Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onstart = function() {
            isListening = true;
            statusIndicator.classList.add('active');
            statusText.textContent = 'Listening...';
            startBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
            output.classList.add('pulse');
            animateVisualizer(true);
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
            
            // Update stats
            updateStats();
            
            // Display both interim and final results
            if (finalTranscript) {
                output.innerHTML = `<p>${finalTranscript}</p>`;
            }
            
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
        output.innerHTML = '<div class="placeholder"><i class="fas fa-exclamation-triangle"></i><p>Your browser does not support speech recognition. Please try Chrome or Edge.</p></div>';
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
        output.innerHTML = '<div class="placeholder"><i class="fas fa-comment-dots"></i><p>Your recognized speech will appear here...</p></div>';
        updateStats();
    });
    
    languageSelect.addEventListener('change', function() {
        languageStatEl.textContent = this.value;
        if (isListening) {
            stopListening();
            setTimeout(startListening, 300);
        }
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
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Listening';
            output.classList.remove('pulse');
            animateVisualizer(false);
        }
    }
    
    function updateStats() {
        const wordCount = finalTranscript.trim() ? finalTranscript.trim().split(/\s+/).length : 0;
        const charCount = finalTranscript.length;
        
        wordCountEl.textContent = wordCount;
        charCountEl.textContent = charCount;
    }
    
    function createVisualizer() {
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.style.height = `${Math.random() * 60 + 20}px`;
            bar.style.width = '3px';
            bar.style.background = 'linear-gradient(to top, var(--secondary), var(--accent))';
            bar.style.position = 'absolute';
            bar.style.bottom = '0';
            bar.style.left = `${i * 10}px`;
            bar.style.borderRadius = '2px';
            bar.style.transformOrigin = 'bottom';
            bar.classList.add('visualizer-bar');
            visualizer.appendChild(bar);
        }
    }
    
    function animateVisualizer(animate) {
        const bars = document.querySelectorAll('.visualizer-bar');
        
        if (animate) {
            bars.forEach(bar => {
                bar.style.animation = `none`;
                void bar.offsetWidth; // Trigger reflow
                bar.style.animation = `visualize ${Math.random() * 0.5 + 0.3}s infinite ease-in-out alternate`;
            });
        } else {
            bars.forEach(bar => {
                bar.style.animation = 'none';
                bar.style.height = '20px';
            });
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
    
    // Add CSS for visualizer animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes visualize {
            from { height: 20px; }
            to { height: 80px; }
        }
        
        .visualizer-bar {
            transition: height 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});