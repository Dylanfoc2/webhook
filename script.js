document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('modern-input');
    const webhookAvatar = document.getElementById('webhook-avatar');
    const webhookName = document.getElementById('webhook-name');
    const webhookCreated = document.getElementById('webhook-created');
    const webhookError = document.getElementById('webhook-error');
    const webhookDetails = document.querySelector('.webhook-details');
    const webhookInfo = document.querySelector('.webhook-info');
    const actionButtons = document.querySelector('.action-buttons');
    const sendMessageButton = document.getElementById('send-message');
    const deleteWebhookButton = document.getElementById('delete-webhook');
    const messageInput = document.querySelector('.message-input');
    const messageText = document.getElementById('message-text');
    const sendButton = document.getElementById('send-button');
    const cancelButton = document.getElementById('cancel-button');
    const spamButton = document.getElementById('spam-button');
    const stopButton = document.getElementById('stop-button');
    const delayInput = document.getElementById('delay-input');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const embedInputs = document.querySelectorAll('.embed-fields input');
    const ownButton = document.getElementById('own-button');

    let currentWebhookUrl = '';
    let isValidWebhook = false;
    let spamInterval = null;

    let typingTimer;
    const doneTypingInterval = 1000; // Wait for 1 second after typing stops

    function showError(message) {
        // First hide other elements
        webhookAvatar.classList.add('hidden');
        webhookDetails.classList.add('hidden');
        webhookAvatar.classList.remove('visible');
        webhookDetails.classList.remove('visible');
        actionButtons.classList.remove('visible');
        messageInput.classList.remove('visible');
        
        // Show error with animation
        webhookError.textContent = message;
        webhookError.classList.remove('hidden');
        webhookInfo.classList.add('visible');
        setTimeout(() => {
            webhookError.classList.add('visible');
        }, 50);

        // Reset webhook state
        isValidWebhook = false;
        currentWebhookUrl = '';
    }

    function hideError() {
        webhookError.classList.remove('visible');
        setTimeout(() => {
            webhookError.classList.add('hidden');
        }, 300);
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function disableButtons() {
        sendMessageButton.disabled = true;
        deleteWebhookButton.disabled = true;
        ownButton.disabled = true;
        sendButton.disabled = true;
        messageText.disabled = true;
        cancelButton.disabled = true;
        spamButton.disabled = true;
        stopButton.disabled = true;
        delayInput.disabled = true;
        
        sendMessageButton.style.opacity = '0.5';
        deleteWebhookButton.style.opacity = '0.5';
        ownButton.style.opacity = '0.5';
        sendButton.style.opacity = '0.5';
        cancelButton.style.opacity = '0.5';
        messageText.style.opacity = '0.5';
        spamButton.style.opacity = '0.5';
        stopButton.style.opacity = '0.5';
        delayInput.style.opacity = '0.5';
        
        sendMessageButton.style.cursor = 'not-allowed';
        deleteWebhookButton.style.cursor = 'not-allowed';
        ownButton.style.cursor = 'not-allowed';
        sendButton.style.cursor = 'not-allowed';
        cancelButton.style.cursor = 'not-allowed';
        messageText.style.cursor = 'not-allowed';
        spamButton.style.cursor = 'not-allowed';
        stopButton.style.cursor = 'not-allowed';
        delayInput.style.cursor = 'not-allowed';
    }

    function enableButtons() {
        sendMessageButton.disabled = false;
        deleteWebhookButton.disabled = false;
        ownButton.disabled = false;
        
        sendMessageButton.style.opacity = '1';
        deleteWebhookButton.style.opacity = '1';
        ownButton.style.opacity = '1';
        
        sendMessageButton.style.cursor = 'pointer';
        deleteWebhookButton.style.cursor = 'pointer';
        ownButton.style.cursor = 'pointer';
    }

    function disableMessageInputs() {
        sendButton.disabled = true;
        cancelButton.disabled = true;
        messageText.disabled = true;
        spamButton.disabled = true;
        stopButton.disabled = true;
        delayInput.disabled = true;
        embedInputs.forEach(input => input.disabled = true);
        
        sendButton.style.opacity = '0.5';
        cancelButton.style.opacity = '0.5';
        messageText.style.opacity = '0.5';
        spamButton.style.opacity = '0.5';
        stopButton.style.opacity = '0.5';
        delayInput.style.opacity = '0.5';
        
        sendButton.style.cursor = 'not-allowed';
        cancelButton.style.cursor = 'not-allowed';
        messageText.style.cursor = 'not-allowed';
        spamButton.style.cursor = 'not-allowed';
        stopButton.style.cursor = 'not-allowed';
        delayInput.style.cursor = 'not-allowed';
    }

    function enableMessageInputs() {
        sendButton.disabled = false;
        cancelButton.disabled = false;
        messageText.disabled = false;
        spamButton.disabled = false;
        stopButton.disabled = false;
        delayInput.disabled = false;
        embedInputs.forEach(input => input.disabled = false);
        
        sendButton.style.opacity = '1';
        cancelButton.style.opacity = '1';
        messageText.style.opacity = '1';
        spamButton.style.opacity = '1';
        stopButton.style.opacity = '1';
        delayInput.style.opacity = '1';
        
        sendButton.style.cursor = 'pointer';
        cancelButton.style.cursor = 'pointer';
        messageText.style.cursor = 'text';
        spamButton.style.cursor = 'pointer';
        stopButton.style.cursor = 'pointer';
        delayInput.style.cursor = 'text';
    }

    async function sendMessage(webhookUrl, message) {
        if (!isValidWebhook) {
            showError('Please enter a valid webhook URL first');
            return;
        }

        try {
            const activeTab = document.querySelector('.tab-button.active').dataset.tab;
            const payload = {
                content: activeTab === 'message' ? message : '',
            };

            if (activeTab === 'embed') {
                const embed = createEmbed();
                if (!embed.title && !embed.description) {
                    showError('Embed must have at least a title or description');
                    return;
                }
                payload.embeds = [embed];
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Show success message without affecting webhook state
            const successMessage = document.getElementById('webhook-error');
            successMessage.textContent = 'Message sent successfully!';
            successMessage.classList.remove('hidden');
            successMessage.classList.add('visible');
            setTimeout(() => {
                successMessage.classList.remove('visible');
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 300);
            }, 2000);

            // Only clear and hide message input if not spamming
            if (!spamInterval) {
                messageText.value = '';
                if (activeTab === 'embed') {
                    document.querySelectorAll('.embed-fields input').forEach(input => {
                        if (input.type !== 'color') input.value = '';
                    });
                }
                messageInput.classList.remove('visible');
                messageInput.classList.add('hidden');
            }

        } catch (error) {
            // Show error without affecting webhook state
            const errorMessage = document.getElementById('webhook-error');
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
            errorMessage.classList.add('visible');
            setTimeout(() => {
                errorMessage.classList.remove('visible');
                setTimeout(() => {
                    errorMessage.classList.add('hidden');
                }, 300);
            }, 2000);
        }
    }

    async function fetchWebhookInfo(url) {
        try {
            hideError();
            disableButtons(); // Disable buttons while checking webhook
            
            // Basic URL validation
            if (!url.includes('discord.com/api/webhooks/')) {
                throw new Error('Invalid webhook URL format');
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Invalid webhook URL');
            }

            const data = await response.json();
            
            // Set webhook as valid
            isValidWebhook = true;
            currentWebhookUrl = url;
            enableButtons(); // Enable buttons for valid webhook

            // Show container first
            webhookInfo.classList.add('visible');
            
            // Update UI with webhook info
            webhookAvatar.src = data.avatar 
                ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            webhookName.textContent = data.name;
            webhookCreated.textContent = `Created: ${formatDate(data.created_at)}`;

            // Show elements with staggered animation
            webhookAvatar.classList.remove('hidden');
            webhookDetails.classList.remove('hidden');
            actionButtons.classList.remove('hidden');
            
            setTimeout(() => {
                webhookAvatar.classList.add('visible');
            }, 100);
            
            setTimeout(() => {
                webhookDetails.classList.add('visible');
            }, 200);

            setTimeout(() => {
                actionButtons.classList.add('visible');
            }, 300);

        } catch (error) {
            showError(error.message);
            disableButtons(); // Disable buttons for invalid webhook
        }
    }

    // Initialize buttons as disabled
    disableButtons();

    // Handle input changes with debounce
    input.addEventListener('input', () => {
        stopSpam();
        clearTimeout(typingTimer);
        if (input.value) {
            typingTimer = setTimeout(() => {
                fetchWebhookInfo(input.value.trim());
            }, doneTypingInterval);
        } else {
            // Hide elements with smooth transitions
            webhookAvatar.classList.remove('visible');
            webhookDetails.classList.remove('visible');
            webhookInfo.classList.remove('visible');
            webhookError.classList.remove('visible');
            actionButtons.classList.remove('visible');
            messageInput.classList.remove('visible');
            
            setTimeout(() => {
                webhookAvatar.classList.add('hidden');
                webhookDetails.classList.add('hidden');
                actionButtons.classList.add('hidden');
                messageInput.classList.add('hidden');
                hideError();
            }, 300);

            // Reset webhook state
            isValidWebhook = false;
            currentWebhookUrl = '';
            disableButtons();
        }
    });

    // Button interactions
    sendMessageButton.addEventListener('click', () => {
        if (!isValidWebhook) {
            showError('Please enter a valid webhook URL first');
            return;
        }
        messageInput.classList.remove('hidden');
        setTimeout(() => {
            messageInput.classList.add('visible');
            enableMessageInputs();
            messageText.focus();
        }, 50);
    });

    sendButton.addEventListener('click', () => {
        if (!isValidWebhook) {
            showError('Please enter a valid webhook URL first');
            return;
        }

        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        if (activeTab === 'message') {
            if (!messageText.value.trim()) {
                showError('Please enter a message');
                return;
            }
            sendMessage(currentWebhookUrl, messageText.value.trim());
        } else if (activeTab === 'embed') {
            const title = document.getElementById('embed-title').value;
            const description = document.getElementById('embed-description').value;
            if (!title && !description) {
                showError('Embed must have at least a title or description');
                return;
            }
            sendMessage(currentWebhookUrl, '');
        }
    });

    cancelButton.addEventListener('click', () => {
        stopSpam();
        messageInput.classList.remove('visible');
        disableMessageInputs();
        setTimeout(() => {
            messageInput.classList.add('hidden');
            messageText.value = '';
        }, 300);
    });

    deleteWebhookButton.addEventListener('click', async () => {
        if (!isValidWebhook) {
            showError('Please enter a valid webhook URL first');
            return;
        }

        // Disable all buttons during deletion
        disableButtons();
        deleteWebhookButton.style.opacity = '0.5';
        deleteWebhookButton.style.cursor = 'not-allowed';

        try {
            const response = await fetch(currentWebhookUrl, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete webhook');
            }

            // Show success message
            showError('Webhook deleted successfully!');
            
            // Reset the input and hide elements
            input.value = '';
            webhookAvatar.classList.remove('visible');
            webhookDetails.classList.remove('visible');
            webhookInfo.classList.remove('visible');
            actionButtons.classList.remove('visible');
            messageInput.classList.remove('visible');
            
            setTimeout(() => {
                webhookAvatar.classList.add('hidden');
                webhookDetails.classList.add('hidden');
                actionButtons.classList.add('hidden');
                messageInput.classList.add('hidden');
                hideError();
            }, 300);

            // Reset webhook state
            isValidWebhook = false;
            currentWebhookUrl = '';

        } catch (error) {
            showError(error.message);
        } finally {
            // Re-enable buttons
            enableButtons();
        }
    });

    function startSpam() {
        if (!isValidWebhook) {
            showError('Please enter a valid webhook URL first');
            return;
        }

        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        if (activeTab === 'message') {
            if (!messageText.value.trim()) {
                showError('Please enter a message to spam');
                return;
            }
        } else if (activeTab === 'embed') {
            const title = document.getElementById('embed-title').value;
            const description = document.getElementById('embed-description').value;
            if (!title && !description) {
                showError('Embed must have at least a title or description');
                return;
            }
        }

        const delay = parseInt(delayInput.value) || 1000; // Default to 1 second if invalid
        if (delay < 500) {
            showError('Delay must be at least 500ms to prevent rate limiting');
            return;
        }

        // Disable spam button and enable stop button during spam
        spamButton.disabled = true;
        spamButton.style.opacity = '0.5';
        spamButton.style.cursor = 'not-allowed';
        stopButton.disabled = false;
        stopButton.style.opacity = '1';
        stopButton.style.cursor = 'pointer';

        // Start the spam interval
        spamInterval = setInterval(() => {
            const activeTab = document.querySelector('.tab-button.active').dataset.tab;
            if (activeTab === 'message') {
                sendMessage(currentWebhookUrl, messageText.value.trim());
            } else if (activeTab === 'embed') {
                const embed = createEmbed();
                if (embed.title || embed.description) {
                    sendMessage(currentWebhookUrl, '');
                }
            }
        }, delay);
    }

    function stopSpam() {
        if (spamInterval) {
            clearInterval(spamInterval);
            spamInterval = null;

            // Re-enable spam button and disable stop button
            spamButton.disabled = false;
            spamButton.style.opacity = '1';
            spamButton.style.cursor = 'pointer';
            stopButton.disabled = true;
            stopButton.style.opacity = '0.5';
            stopButton.style.cursor = 'not-allowed';
        }
    }

    // Add event listeners for spam and stop buttons
    spamButton.addEventListener('click', startSpam);
    stopButton.addEventListener('click', stopSpam);

    // Add tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            const activeContent = document.querySelector('.tab-content:not(.hidden)');
            const targetContent = document.getElementById(`${tabName}-tab`);
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Fade out current content
            if (activeContent) {
                activeContent.style.opacity = '0';
                activeContent.style.transform = 'translateY(-10px)';
                
                // Wait for fade out, then switch content
                setTimeout(() => {
                    activeContent.classList.add('hidden');
                    
                    // Show and fade in new content
                    targetContent.classList.remove('hidden');
                    // Force browser reflow
                    void targetContent.offsetWidth;
                    
                    targetContent.style.opacity = '1';
                    targetContent.style.transform = 'translateY(0)';
                }, 300);
            } else {
                // If no active content, just show new content
                targetContent.classList.remove('hidden');
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateY(0)';
            }
        });
    });

    function createEmbed() {
        const embed = {
            title: document.getElementById('embed-title').value,
            description: document.getElementById('embed-description').value,
            color: parseInt(document.getElementById('embed-color').value.replace('#', ''), 16),
        };

        // Add optional fields if they're filled
        const thumbnail = document.getElementById('embed-thumbnail').value;
        if (thumbnail) embed.thumbnail = { url: thumbnail };

        const image = document.getElementById('embed-image').value;
        if (image) embed.image = { url: image };

        const authorName = document.getElementById('embed-author-name').value;
        const authorIcon = document.getElementById('embed-author-icon').value;
        if (authorName) {
            embed.author = { name: authorName };
            if (authorIcon) embed.author.icon_url = authorIcon;
        }

        const footerText = document.getElementById('embed-footer-text').value;
        const footerIcon = document.getElementById('embed-footer-icon').value;
        if (footerText) {
            embed.footer = { text: footerText };
            if (footerIcon) embed.footer.icon_url = footerIcon;
        }

        return embed;
    }

    async function ownWebhook() {
        if (!isValidWebhook) {
            showError('Please enter a valid webhook URL first');
            return;
        }

        // Disable all buttons during the process
        disableButtons();
        ownButton.style.opacity = '0.5';
        ownButton.style.cursor = 'not-allowed';

        try {
            // Spam the message 10 times
            for (let i = 0; i < 10; i++) {
                const response = await fetch(currentWebhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: '@here @everyone Webhook is now owned by https://dylanfoc2.github.io/webhook/'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                // Wait 500ms between messages
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Delete the webhook after spamming
            const deleteResponse = await fetch(currentWebhookUrl, {
                method: 'DELETE'
            });

            if (!deleteResponse.ok) {
                throw new Error('Failed to delete webhook');
            }

            // Show success message
            showError('Webhook owned and deleted successfully!');
            
            // Reset the input and hide elements
            input.value = '';
            webhookAvatar.classList.remove('visible');
            webhookDetails.classList.remove('visible');
            webhookInfo.classList.remove('visible');
            actionButtons.classList.remove('visible');
            messageInput.classList.remove('visible');
            
            setTimeout(() => {
                webhookAvatar.classList.add('hidden');
                webhookDetails.classList.add('hidden');
                actionButtons.classList.add('hidden');
                messageInput.classList.add('hidden');
                hideError();
            }, 300);

            // Reset webhook state
            isValidWebhook = false;
            currentWebhookUrl = '';

        } catch (error) {
            showError(error.message);
        } finally {
            // Re-enable buttons
            enableButtons();
        }
    }

    // Add event listener for the Own button
    ownButton.addEventListener('click', ownWebhook);

    // Set default delay value
    delayInput.value = '50';
}); 
