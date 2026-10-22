/* ==========================================================================
   1. GLOBAL CONFIGURATION & CORE SETTINGS
   ========================================================================== */
// Verified Live Apps Script Endpoint Connection Link
const GOOGLE_SHEET_CONTENT_URL = "https://script.google.com/macros/s/AKfycbw99lO-RRbsDX-k8wHPkMrx-nxZ4BHok8_6_USv8huTeXaqQ7XcuQGJFOr2GFptRZHw/exec";
const GOOGLE_SHEET_REPORTS_URL = "https://script.google.com/macros/s/AKfycbw99lO-RRbsDX-k8wHPkMrx-nxZ4BHok8_6_USv8huTeXaqQ7XcuQGJFOr2GFptRZHw/exec";

// CLEANED BLACKLIST: Removed 'hell', 'suck', and 'sucks' to stop common word overlap false blocks
const profanityBlacklist = [
    'fuck', 'bitch', 'dick', 'asshole', 'ass', 'retard', 'whore', 'penis', 'shit', 
    'autistic', 'austism', 'cunt', 'dumbass', 'stupid', 'idiot', 'kkk', 'damn', 'daym'
];

/* ==========================================================================
   2. AUTOMATED SECURITY & PROFANITY FILTERS
   ========================================================================== */
function checkForSneakyCussing(inputText) {
    let standardizedText = inputText.toLowerCase();
    let containsBadWord = false;

    profanityBlacklist.forEach(word => {
        // Dynamic pattern builder: Catches "f.u.c.k", "f u c k", "f_u_c_k" safely
        const sneakyPattern = word.split('').join('[\\s\\._\\-]*');
        const regex = new RegExp(`\\b${sneakyPattern}\\b`, 'gi');

        if (regex.test(standardizedText)) {
            containsBadWord = true;
        }
    });
    return containsBadWord;
}

function filterProfanity(inputText) {
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
document.getElementById('submission-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const rawUsername = document.getElementById('fan-username').value || "AnonymousFan";
    const rawBio = document.getElementById('fan-bio').value || "";
    const rawTitle = document.getElementById('content-title').value;
    const rawBody = document.getElementById('fanfic-body').value;

    // Hard block check for severe intentional bypass attempts
    if (checkForSneakyCussing(rawTitle) || checkForSneakyCussing(rawBody) || checkForSneakyCussing(rawUsername)) {
        alert("Submission Blocked: Your text contains words or spacing layouts that violate our guidelines. Please keep content family-friendly.");
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
        // FIXED: Using plain text transfer mode with no-cors to seamlessly bypass Google server firewalls
        await fetch(GOOGLE_SHEET_CONTENT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });

        alert("Success! Your story has been recorded in the archives.");
        document.getElementById('submission-form').reset();
        
        // Minor browser delay before pulling down refreshed feed listings
        setTimeout(loadFanFeed, 1200); 
        
    } catch (error) {
        console.error("Network Error:", error);
        alert("Failed to communicate with your database server.");
    }
});

/* ==========================================================================
   4. DATA FETCHING (READ FROM GOOGLE SHEETS TO WEB FEED)
   ========================================================================== */
async function loadFanFeed() {
    const feedContainer = document.getElementById('live-fan-feed');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = "<p>Unrolling parchment scrolls...</p>";

    try {
        const response = await fetch(GOOGLE_SHEET_CONTENT_URL);
        const stories = await response.json();

        feedContainer.innerHTML = ""; 

        if (!stories || stories.length === 0) {
            feedContainer.innerHTML = "<p style='font-style: italic; opacity: 0.6; padding: 20px;'>The archives are empty. Be the first to compose a chronicle!</p>";
            return;
        }

        // Loop backwards through records so newer posts show up on top
        stories.reverse().forEach((story, index) => {
            // Skips adding structural Row 1 column labels to list view containers
            if (story.Username === "Username" || !story.Username) return;

            const cardHTML = `
                <article class="fan-story-card">
                    <div class="card-meta">
                        <div>
                            <strong>${story.Username}</strong> 
                            <span class="bio-text">"${story.userBio}"</span>
                        </div>
                        <small class="story-date">${story.Timestamp}</small>
                    </div>
                    <div class="card-content">
                        <h3>${story.fanficTitle}</h3>
                        <p>${story.fanficBody}</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn-flag" onclick="flagContent('${index}', '${story.Username}', '${story.fanficTitle}')">⚠️ Report Violation</button>
                    </div>
                </article>
            `;
            feedContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        feedContainer.innerHTML = "<p>Failed to load the community feed. Please refresh.</p>";
        console.error("Read error:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadFanFeed);

/* ==========================================================================
   5. MODERATION SUBMISSIONS (REPORT LINK LOGIC)
   ========================================================================== */
async function flagContent(index, username, storyTitle) {
    const reason = prompt(`Why are you reporting ${username}'s story "${storyTitle}"?\n(e.g., Harassment, bypass cussing, off-topic)`);
    
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
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(reportPayload)
        });

        alert("Thank you. This post has been flagged and submitted to the author for moderation review.");
    } catch (error) {
        console.error("Reporting system error:", error);
    }
}
