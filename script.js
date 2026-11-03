/* ==========================================================================
   1. GLOBAL CONFIGURATION & DATA ENGINE
   ========================================================================== */
const GOOGLE_SHEET_CONTENT_URL = "https://google.com";
const GOOGLE_SHEET_REPORTS_URL = "https://google.com";

const profanityBlacklist = [
    'fuck', 'bitch', 'dick', 'asshole', 'ass', 'retard', 'whore', 'penis', 'shit', 
    'autistic', 'austism', 'cunt', 'dumbass', 'stupid', 'idiot', 'kkk', 'damn', 'daym'
];

const loreDatabase = [
    { title: "Zephyr Faction", faction: "air", badge: "badge-air", desc: "Keepers of the whispering skies and masters of wind currents." },
    { title: "Terra Guard", faction: "earth", badge: "badge-earth", desc: "Stalwart protectors of the crystal caverns and continental roots." },
    { title: "Volt Spark", faction: "electricity", badge: "badge-electricity", desc: "Wielders of the high-frequency thunder codes and lightning signals." },
    { title: "Ignis Brood", faction: "fire", badge: "badge-fire", desc: "Born from the ash of volcanic spires, carrying the eternal spark." },
    { title: "Glacial Order", faction: "ice", badge: "badge-ice", desc: "Preservers of ancient frost memories trapped deep in frozen depths." },
    { title: "The Etherborn", faction: "magic", badge: "badge-magic", desc: "Scholars who tap directly into raw elemental source matrices." },
    { title: "Tide Walkers", faction: "water", badge: "badge-water", desc: "Navigators of deep abyssal trenches and changing ocean balances." }
];

/* ==========================================================================
   2. ELECTRIC CODER DECODER ENGINE
   ========================================================================== */
const electricDictionary = {
    'a': '・-', 'b': '-・・・', 'c': '-・-・', 'd': '-・・', 'e': '・',
    'f': '・・-・', 'g': '--・', 'h': '・・・・', 'i': '・・', 'j': '・---',
    'k': '-・-', 'l': '・-・・', 'm': '--', 'n': '-・', 'o': '---',
    'p': '・--・', 'q': '--・-', 'r': '・-・', 's': '・・・', 't': '-',
    'u': '・・-', 'v': '・・・-', 'w': '・--', 'x': '-・・-', 'y': '-・--',
    'z': '--・・', '1': '・----', '2': '・・---', '3': '・・・--', '4': '・・・・-',
    '5': '・・・・・', '6': '-・・・・', '7': '--・・・', '8': '---・・', '9': '----・',
    '0': '-----', ' ': ' / '
};

function decodeToSkyCode(text) {
    if (!text) return "...";
    return text.toLowerCase().split('').map(char => electricDictionary[char] || char).join(' ');
}

/* ==========================================================================
   3. INTERACTIVE LORE CARDS RENDERING ENGINE
   ========================================================================== */
function renderLoreCards(filter = "all") {
    const gridContainer = document.getElementById('elements-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = "";
    const filteredData = filter === "all" ? loreDatabase : loreDatabase.filter(item => item.faction === filter);

    filteredData.forEach(card => {
        const cardHTML = `
            <div class="lore-card" data-faction="${card.faction}">
                <span class="element-badge ${card.badge}">${card.faction.toUpperCase()}</span>
                <h3>${card.title}</h3>
                <p>${card.desc}</p>
            </div>
        `;
        gridContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

/* ==========================================================================
   4. SYSTEM APPLICATION CORE INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lore Display Grid
    renderLoreCards("all");

    // Connect Sidebar Filtration System Filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const selectedFilter = e.target.getAttribute('data-filter');
            renderLoreCards(selectedFilter);
        });
    });

    // Connect Active Transmitters to Electric Decoder Form UI
    const codecInput = document.getElementById('codec-input');
    const codecOutput = document.getElementById('codec-output');
    if (codecInput && codecOutput) {
        codecInput.addEventListener('input', (e) => {
            const rawText = e.target.value;
            codecOutput.textContent = rawText.trim() === "" ? "..." : decodeToSkyCode(rawText);
        });
    }

    // Connect Snippet Overlay Preview Window Modal
    const openBtn = document.getElementById('open-snippet-btn');
    const closeBtn = document.getElementById('close-snippet-btn');
    const modal = document.getElementById('snippet-modal');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.add('open'));
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    // Connect Fanfiction Processing System Submit Events
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
                alert("Submission Blocked: Content guidelines violation detected.");
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
                alert("Failed to communicate with your database server.");
            }
        });
    }

    // Start Content Ingestion Loop
    loadFanFeed();
});

/* ==========================================================================
   5. SECURITY & FILTER UTILITIES
   ========================================================================== */
function checkForSneakyCussing(inputText) {
    if (!inputText) return false;
    let standardizedText = inputText.toLowerCase();
    let containsBadWord = false;

    profanityBlacklist.forEach(word => {
        const sneakyPattern = word.split('').join('[\\s\\._\\-]*');
        const regex = new RegExp(`\\b${sneakyPattern}\\b`, 'gi');
        if (regex.test(standardizedText)) containsBadWord = true;
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
   6. LIVE DATABASE ARCHIVE CONSUMPTION STREAM
   ========================================================================== */
async function loadFanFeed() {
    const feedContainer = document.getElementById('live-fan-feed');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = "<p class='loading-text'>Unrolling parchment scrolls...</p>";

    try {
        const response = await fetch(GOOGLE_SHEET_CONTENT_URL);
        if (!response.ok) throw new Error("Bad database connection endpoint link layout");
        
        const rawData = await response.json();
        feedContainer.innerHTML = ""; 

        if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
            feedContainer.innerHTML = "<p style='font-style: italic; opacity: 0.6; padding: 20px;'>The archives are empty. Be the first to compose a chronicle!</p>";
            return;
        }

        let stories = Array.isArray(rawData) ? rawData : (rawData.data || rawData.stories || []);

        stories.reverse().forEach((story, index) => {
            const user = story.Username || story.username || "Anonymous";
            const bio = story.userBio || story.UserBio || story.bio || "";
            const title = story.fanficTitle || story.FanficTitle || story.title || "Untitled Tale";
            const body = story.fanficBody || story.FanficBody || story.body || story.content || "";
const time = story.Timestamp || story.timestamp || story.date || "Ancient Era";
if (user === "Username" || user.toLowerCase() === "username") return;
const cardHTML = <article class="fan-story-card"> <div class="card-meta"> <div> <strong class="author-name">${user}</strong>  ${bio ?"${bio}": ''} </div> <small class="story-date">${time}</small> </div> <div class="card-content"> <h3>${title}</h3> <p>${body.replace(/\n/g, '<br>')}</p> </div> <div class="card-actions"> <button type="button" class="btn-flag" onclick="flagContent('${index}', '${user.replace(/'/g, "\\'")}', '${title.replace(/'/g, "\\'")}')">⚠️ Report Violation</button> </div> </article>;
feedContainer.insertAdjacentHTML('beforeend', cardHTML);
});
} catch (error) {
feedContainer.innerHTML = "The fan feed database is waiting for submissions.";
console.error("Read error:", error);
}
}
/* ==========================================================================
7. MODERATION FLAGS CONTROLLER MANAGEMENT
========================================================================== */
async function flagContent(index, username, storyTitle) {
const reason = prompt(Why are you reporting ${username}'s story "${storyTitle}"?\n(e.g., Harassment, explicit language, off-topic));
if (reason === null || reason.trim() === "") return;
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
alert("Thank you. This post has been flagged.");
} catch (error) {
console.error("Reporting system error:", error);
}
}
