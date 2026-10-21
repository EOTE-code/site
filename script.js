// 1. Full Data Store containing your book's Element Guide
const elementalEchoes = [
{
title: "Air: Characteristics & Magic",
type: "air",
desc: "Known for their cheerful spirit and caring mindset. Their powers include Flying, Cloud Control, and Wind manipulation. As generations shift, their abilities fluidly change like the air itself."
},
{
title: "Air: Royal Lineage",
type: "air",
desc: "The skies are guided by the sky court: Queen Sora, King Zephyr, Prince Nimbus, and Princess Iris."
},
{
title: "Earth: Flora & Critter Traits",
type: "earth",
desc: "Deeply recognized for caring for living things. Flora elements control and accelerate plant growth, even sprouting trees from seeds. Critter elements converse with and command animals. Possessing both lineages is incredibly rare."
},
{
title: "Earth: Flora Royalty",
type: "earth",
desc: "The plant kingdom is led by Queen Firma and King Terra, alongside Princess Marigold, Princess Daisy, Princess Ivy, and their nephew, Prince Maple."
},
{
title: "Earth: Critter Royalty",
type: "earth",
desc: "The animal alignment is ruled by Queen Doe and King Bear, along with Princess Squirrel."
},
{
title: "Electricity: Traits & Code",
type: "electricity",
desc: "Known for an optimistic, highly energetic spirit. When an Electric element is born, a massive storm triggers. They communicate using a custom thunder (-) and lightning (・) Morse code system, and can easily short out the technology of Unpowers when angered."
},
{
title: "Electricity: Royal Lineage",
type: "electricity",
desc: "Ruled by Queen Spark, King Hurricane, Prince Bolt, Princess Tesla, and a mysterious second Prince whose true identity remains completely hidden."
},
{
title: "Fire: Weapon Mastery & Code",
type: "fire",
desc: "Recognized for their bitter, aggressive tones, Fire elements are heavily trained in combat and weapons from a young age. Beneath their insults, they can become deeply caring. They use unique symbolic codes featuring glyphs like 🔥 and 🌋 to hide their secret writing."
},
{
title: "Fire: Flame & Lava Royalty",
type: "fire",
desc: "The Flame Faction is ruled by Queen Seraphina, King Blaze, and Princess Fiammetta. The volcanic Lava Faction is commanded by Queen Volcanic, King Metamorphic, and Prince Igneous."
},
{
title: "Ice: Camouflage & Treats",
type: "ice",
desc: "Ranges from cool and chill to deeply icy. They have a flawless sense of temperature and are entirely immune to freezing. They often disguise themselves flawlessly in snowbanks to trick attackers, and create popsicles and snow cones on bright days."
},
{
title: "Ice: Royal Lineage",
type: "ice",
desc: "The frozen expanses are commanded by Queen Icicle, King Hailstorm, Prince Snowstorm, and Princess Crystal."
},
{
title: "Magic: Shardlight & Censorship",
type: "magic",
desc: "Deceiving and mischievous sorcerers of raw power. Following an ancient war between Starlight and Shardlight factions, Starlight magic was completely banned and punished. Users of Shardlight dark magic are frequently controlled by Dark Shard. If any mortal human spots their magic, sorcerers instantly change or erase that human's memories."
},
{
title: "Magic: Royal Lineage",
type: "magic",
desc: "The historic ledger of rulers is incomplete. The only active king recognized by the dark faction is the terrifying entity known as the Dark Shard."
},
{
title: "Water: Palaces & Hidden Spells",
type: "water",
desc: "Famous for strange-tasting seafood dishes and a profound love of sealife. All Water elements breathe and speak underwater perfectly. They maintain an above-ground court and a breathtaking submerged palace."
},
{
title: "Water: The Lost Blessing",
type: "water",
desc: "History rumors a legendary ancient water caster who enchanted the underwater palace so visiting guests from other elements could breathe water naturally during their stay. That legendary magic has since been lost to history."
},
{
title: "Water: Royal Lineage",
type: "water",
desc: "The vast oceanic depths are protected by Queen Current and King Dorsal."
}
]; 

// 2. Select HTML Grid Container Elements
const gridContainer = document.getElementById('elements-grid');
const filterButtons = document.querySelectorAll('.filter-btn'); 

// 3. Function to Dynamically Build & Display Cards
function renderCards(filteredData) {
gridContainer.innerHTML = "";
// ==========================================
// 6. ELECTRICITY CODEX: TRANSMISSION TRANSLATOR
// ==========================================

// Standard Morse map adjusted to your book rules: thunder (-) and lightning (・)
const electricMorseCode = {
    'A': '・-',    'B': '-・・・',  'C': '-・-・',  'D': '-・・',
    'E': '・',     'F': '・・-・',  'G': '--・',    'H': '・・・・',
    'I': '・・',    'J': '・---',   'K': '-・-',    'L': '・-・・',
    'M': '--',     'N': '-・',     'O': '---',    'P': '・--・',
    'Q': '---・',   'R': '・-・',   'S': '・・・',   'T': '-',
    'U': '・・-',   'V': '・・・-',  'W': '・--',    'X': '-・・-',
    'Y': '-・--',   'Z': '--・・',
    '1': '・----',  '2': '・・---',  '3': '・・・--', '4': '・・・・-',
    '5': '・・・・・', '6': '-・・・・', '7': '--・・・', '8': '---・・',
    '9': '----・',  '0': '-----',
    ' ': ' / ' // Space between words
};

// Select the input text box and the output display area
const codecInput = document.getElementById('codec-input');
const codecOutput = document.getElementById('codec-output');

// Listen for when the reader types inside the text box
codecInput.addEventListener('input', (event) => {
    // Grab what they typed and make it uppercase
    const rawText = event.target.value.toUpperCase();
    
    // Split the text into letters, map each letter to its code, join with spaces
    const translatedArray = rawText.split('').map(character => {
        // Return the custom symbol if found, otherwise keep the raw character (like punctuation)
        return electricMorseCode[character] || character;
    });

    // If the input box is empty, show a placeholder dots transmission
    if (rawText.trim() === "") {
        codecOutput.textContent = "...";
    } else {
        // Display the translated characters separated by a small space
        codecOutput.textContent = translatedArray.join(' ');
    }
});
