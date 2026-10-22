

/* ==========================================================================
   1. GLOBAL CONFIGURATION & CORE SETTINGS
   ========================================================================== */
// Replace YOUR_UNIQUE_API_ID with your actual Sheet Best or Stein endpoint token
const GOOGLE_SHEET_CONTENT_URL = "https://docs.google.com/spreadsheets/d/1stTH24yCqqZgFw6fCFuhjV8XuJ8isx8BtkUuIR0zTIc/edit?usp=sharing";
const GOOGLE_SHEET_REPORTS_URL = "https://docs.google.com/spreadsheets/d/1stTH24yCqqZgFw6fCFuhjV8XuJ8isx8BtkUuIR0zTIc/edit?usp=sharing";

// The master blacklist for your community
const profanityBlacklist = ['Fuck', 'fuck', 'Bitch', 'bitch', 'Dick, 'dick', 'Asshole', 'asshole', 'Ass', 'ass, 'Retard', 'retard', 'Whore', 'whore', 'Penis', 'penis', 'Shit', 'shit', 'Autistic', 'austistic', 'Austism', 'austism', 'Cunt', 'cunt', 'Dumbass', 'dumbass', 'stupid', 'Stupid', 'Idiot', 'idiot', 'KKK', 'kkk', 'Damn', 'damn', 'daym', 'Daym', 'Hell', 'Suck', 'suck', 'Sucks', 'sucks'];

/* ==========================================================================
   2. AUTOMATED SECURITY & PROFANITY FILTERS
   ========================================================================== */
// The background shield that flattens strings to catch spacing bypasses (e.g. "a . s . s")
function checkForSneakyCussing(inputText) {
    let standardizedText = inputText.toLowerCase();
    let strippedText = standardizedText.replace(/[\s\._\-]/g, ''); // Strips spaces, dots, dashes

    let containsBadWord = false;
    profanityBlacklist.forEach(word => {
        if (strippedText.includes(word)) {
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
            alert("Sheet integration error.");
        }
    } catch (error) {
        console.error("Network Error:", error);
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
                <article class="fan-story-card">
                    <div class="card-meta">
                        <strong>${story.Username}</strong> — <span class="bio-text">"${story.userBio}"</span>
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
            alert("Could not process report.");
        }
    } catch (error) {
        console.error("Reporting system error:", error);
    }
}
