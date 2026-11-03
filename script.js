/* ==========================================================================
   1. GLOBAL CONFIGURATION & CORE SETTINGS
   ========================================================================== */
const GOOGLE_SHEET_CONTENT_URL = "https://script.google.com/macros/s/AKfycbw99lO-RRbsDX-k8wHPkMrx-nxZ4BHok8_6_USv8huTeXaqQ7XcuQGJFOr2GFptRZHw/exec";
const GOOGLE_SHEET_REPORTS_URL = "https://script.google.com/macros/s/AKfycbw99lO-RRbsDX-k8wHPkMrx-nxZ4BHok8_6_USv8huTeXaqQ7XcuQGJFOr2GFptRZHw/exec";

const profanityBlacklist = [
    'fuck', 'bitch', 'dick', 'asshole', 'ass', 'retard', 'whore', 'penis', 'shit', 
    'autistic', 'austism', 'cunt', 'dumbass', 'stupid', 'idiot', 'kkk', 'damn', 'daym'
];

/* ==========================================================================
   2. AUTOMATED SECURITY & PROFANITY FILTERS
   ========================================================================== */
function checkForSneakyCussing(inputText) {
    if (!inputText) return false;
    let standardizedText = inputText.toLowerCase();
    let containsBadWord = false;

    profanityBlacklist.forEach(word => {
        const sneakyPattern = word.split('').join('[\\s\\._\\-]*');
        const regex = new RegExp(`\\b${sneakyPattern}\\b`, 'gi');
        if (regex.test(standardizedText)) {
            containsBadWord = true;
        }
    });
    return containsBadWord;
}

function filterProfanity(inputText) {
    if (!inputText) return "";
    let cleanText = inputText;
    profanityBlacklist.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanText = cleanText.replace(regex, '-'.repeat(word.length));
    });
    return cleanText;
}

/* ==========================================================================
   3. DATA SENDING (CREATE / POST TO GOOGLE SHEETS)
   ========================================================================== */
const submissionForm = document.getElementById('submission-form');
if (submissionForm) {
    submissionForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const rawUsername = document.getElementById('fan-username')?.value || "AnonymousFan";
        const rawBio = document.getElementById('fan-bio')?.value || "";
        const rawTitle = document.getElementById('content-title')?.value || "";
        const rawBody = document.getElementById('fanfic-body')?.value || "";

        if (!rawTitle.trim() || !rawBody.trim()) {
            alert("Please fill out both the story title and the body chronicle before submitting.");
            return;
        }

        if (checkForSneakyCussing(rawTitle) || checkForSneakyCussing(rawBody) || checkForSneakyCussing(rawUsername)) {
            alert("Submission Blocked: Your text contains layout choices or words that violate our safety guidelines. Please keep content family-friendly.");
            return; 
        }

        const cleanUsername = filterProfanity(rawUsername);
        const cleanBio = filterProfanity(rawBio);
        const cleanTitle = filterProfanity(rawTitle);
        const cleanBody = filterProfanity(rawBody);

        const payload = {
            "Timestamp": new Date().toLocaleString(),
            "Username": cleanUsername,
            "userBio": cleanBio,
            "fanficTitle": cleanTitle,
            "fanficBody": cleanBody
        };

        try {
            // Re-engineered to pass payload parameters seamlessly via standard URL-encoded form data parameters
            // This is the most reliable way to post into standard Google Web App e.parameter configs
            await fetch(GOOGLE_SHEET_CONTENT_URL, {
                method: "POST",
                mode: "no-cors", 
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(payload).toString()
            });

            alert("Success! Your story has been recorded in the archives.");
            submissionForm.reset();
            
            setTimeout(loadFanFeed, 1000); 
            
        } catch (error) {
            console.error("Network Error:", error);
            alert("Failed to communicate with your database server. Please check your internet connection.");
        }
    });
}

/* ==========================================================================
   4. DATA FETCHING (READ FROM GOOGLE SHEETS TO WEB FEED)
   ========================================================================== */
async function loadFanFeed() {
    const feedContainer = document.getElementById('live-fan-feed');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = "<p class='loading-text'>Unrolling parchment scrolls...</p>";

    try {
        const response = await fetch(GOOGLE_SHEET_CONTENT_URL);
        if (!response.ok) throw new Error("Server returned a bad status code");
        
        const rawData = await response.json();

        feedContainer.innerHTML = ""; 

        // Fail-safe protection: Ensures data parsing doesn't crash if the sheet is blank
        if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
            feedContainer.innerHTML = "<p style='font-style: italic; opacity: 0.6; padding: 20px;'>The archives are empty. Be the first to compose a chronicle!</p>";
            return;
        }

        // Standardize output data formatting whether Google sends back an Array or a wrapped JSON envelope
        let stories = Array.isArray(rawData) ? rawData : (rawData.data || rawData.stories || []);

        // Reverse records so newest entries populate on top of the wiki page
        stories.reverse().forEach((story, index) => {
            // Flexible property parsing layer: Safely mapping both Capitalized and lowercase keys sent from the sheet database
            const user = story.Username || story.username || "Anonymous";
            const bio = story.userBio || story.UserBio || story.bio || "";
            const title = story.fanficTitle || story.FanficTitle || story.title || "Untitled Tale";
            const body = story.fanficBody || story.FanficBody || story.body || story.content || "";
            const time = story.Timestamp || story.timestamp || story.date || "Ancient Era";

            // Safeguard skip step against parsing row header definitions
            if (user === "Username" || user.toLowerCase() === "username") return;

            const cardHTML = `
                <article class="fan-story-card">
                    <div class="card-meta">
                        <div>
                            <strong class="author-name">${user}</strong> 
                            ${bio ? `<span class="bio-text">"${bio}"</span>` : ''}
                        </div>
                        <small class="story-date">${time}</small>
                    </div>
                    <div class="card-content">
                        <h3>${title}</h3>
                        <p>${body.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn-flag" onclick="flagContent('${index}', '${user.replace(/'/g, "\\'")}', '${title.replace(/'/g, "\\'")}')">⚠️ Report Violation</button>
                    </div>
                </article>
            `;
            feedContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        feedContainer.innerHTML = "<p class='error-text'>Failed to load the community feed. The portal might be unstable. Please refresh.</p>";
        console.error("Read error:", error);
    }
}

// Global hookup for page loading execution
document.addEventListener("DOMContentLoaded", loadFanFeed);

/* ==========================================================================
   5. MODERATION SUBMISSIONS (REPORT LINK LOGIC)
   ========================================================================== */
async function flagContent(index, username, storyTitle) {
    const reason = prompt(`Why are you reporting ${username}'s story "${storyTitle}"?\n(e.g., Harassment, explicit language, off-topic)`);
    
    if (reason === null || reason.trim() === "") {
        alert("Report canceled.");
        return;
    }

    const reportPayload = {
        "Timestamp": new Date().toLocaleString(),
        "FlaggedUser": username,
        "StoryTitle": storyTitle,
        "Reason": reason,
        "Status": "Pending Review"
    };

    try {
        await fetch(GOOGLE_SHEET_REPORTS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(reportPayload).toString()
        });

        alert("Thank you. This post has been flagged and submitted to the author for moderation review.");
    } catch (error) {
        console.error("Reporting system error:", error);
    }
}
