/* ==========================================================================
   1. GLOBAL CONFIGURATION & CORE SETTINGS
   ========================================================================== */
// IMPORTANT: Replace these with your actual Sheet Best, Stein, or Apps Script endpoint URLs.
// Do NOT use raw google.com/spreadsheets/ URLs here or the data connection will fail.
const GOOGLE_SHEET_CONTENT_URL = "https://script.google.com/macros/s/AKfycbw99lO-RRbsDX-k8wHPkMrx-nxZ4BHok8_6_USv8huTeXaqQ7XcuQGJFOr2GFptRZHw/exec";
const GOOGLE_SHEET_REPORTS_URL = "https://script.google.com/macros/s/AKfycbw99lO-RRbsDX-k8wHPkMrx-nxZ4BHok8_6_USv8huTeXaqQ7XcuQGJFOr2GFptRZHw/exec";

// FIXED SYNTAX: Added missing quotes and made all terms lowercase for flawless comparison logic
const profanityBlacklist = [
    'fuck', 'bitch', 'dick', 'asshole', 'ass', 'retard', 'whore', 'penis', 'shit', 
    'autistic', 'austism', 'cunt', 'dumbass', 'stupid', 'idiot', 'kkk', 
    'damn', 'daym', 'hell', 'suck', 'sucks'
];

/* ==========================================================================
   2. AUTOMATED SECURITY & PROFANITY FILTERS
   ========================================================================== */

// FIXED: This function now targets spaces and dots inside matching patterns specifically,
// preventing innocent sentences like "Ember had a sword" from getting falsely blocked.
function checkForSneakyCussing(inputText) {
    let standardizedText = inputText.toLowerCase();

    let containsBadWord = false;
    profanityBlacklist.forEach(word => {
        // This generates a dynamic pattern checking if letters have characters like spaces or dots between them
        // Example for "fword": catches "f w o r d", "f.w.o.r.d", "f_w_o_r_d"
        const sneakyPattern = word.split('').join('[\\s\\._\\-]*');
        const regex = new RegExp(`\\b${sneakyPattern}\\b`, 'gi');

        if (regex.test(standardizedText)) {
            containsBadWord = true;
        }
    });
    return containsBadWord;
}

// Standard word boundary filter to sanitize regular incoming text safely
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

    // STEP 1: Hard block if they try to bypass with sneaky spaces or symbols
    if (checkForSneakyCussing(rawTitle) || checkForSneakyCussing(rawBody) || checkForSneakyCussing(rawUsername)) {
        alert("Submission Blocked: Your text contains words or spacing layouts that violate our guidelines. Please keep content family-friendly.");
        return; // Exits immediately, refusing to write to your spreadsheet
    }

    // STEP 2: Standard sanitize formatting for any soft violations
    const cleanUsername = filterProfanity(rawUsername);
    const cleanBio = filterProfanity(rawBio);
    const cleanTitle = filterProfanity(rawTitle);
    const cleanBody = filterProfanity(rawBody);

    // Formatted payload to match your exact Google Sheet headers
    const payload = {
        "Timestamp": new Date().toLocaleString(),
        "Username": cleanUsername,
        "userBio": cleanBio,
        "fanficTitle": cleanTitle,
        "fanficBody": cleanBody
    };

    try {
        const response = await fetch(GOOGLE_SHEET_CONTENT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Success! Your story has been recorded in the archives.");
            document.getElementById('submission-form').reset();
            loadFanFeed(); // Refresh the feed immediately to show the new post
        } else {
            alert("Sheet integration error. Double check your API endpoint URL connection.");
        }
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
    if (!feedContainer) return; // Prevents errors if elements aren't built on the page yet
    
    feedContainer.innerHTML = "<p>Unrolling parchment scrolls...</p>";

    try {
        const response = await fetch(GOOGLE_SHEET_CONTENT_URL);
        const stories = await response.json();

        feedContainer.innerHTML = ""; // Clear out placeholder text

        // Loop backwards to show the freshest community uploads first
        stories.reverse().forEach((story, index) => {
            const cardHTML = `
                <article class="fan-story-card" style="background-color: var(--card-bg); border: 2px solid var(--border-scroll); border-radius: 8px; padding: 25px; margin-bottom: 20px; border-left: 4px solid var(--gold);">
                    <div class="card-meta" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-scroll); padding-bottom: 10px; margin-bottom: 15px; font-size: 0.85rem; color: var(--parchment-dim);">
                        <div>
                            <strong style="color: var(--gold); font-size: 1.05rem;">${story.Username}</strong> 
                            <span class="bio-text" style="font-style: italic; margin-left: 5px;">"${story.userBio}"</span>
                        </div>
                        <small class="story-date" style="opacity: 0.7;">${story.Timestamp}</small>
                    </div>
                    <div class="card-content">
                        <h3 style="color: var(--gold); margin-bottom: 10px;">${story.fanficTitle}</h3>
                        <p style="white-space: pre-wrap; color: #eae0cc;">${story.fanficBody}</p>
                    </div>
                    <div class="card-actions" style="display: flex; justify-content: flex-end; margin-top: 15px; border-top: 1px solid rgba(56, 44, 34, 0.4); padding-top: 10px;">
                        <button class="btn-flag" onclick="flagContent('${index}', '${story.Username}', '${story.fanficTitle}')" style="background: none; border: 1px solid rgba(169, 60, 60, 0.4); color: var(--crimson); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">⚠️ Report Violation</button>
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

// Automatically fire up the engine when the web visitor hits your site
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
        const response = await fetch(GOOGLE_SHEET_REPORTS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportPayload)
        });

        if (response.ok) {
            alert("Thank you. This post has been flagged and submitted to the author for moderation review.");
        } else {
            alert("Could not process report. Verify your reporting URL endpoint configuration.");
        }
    } catch (error) {
        console.error("Reporting system error:", error);
    }
}
