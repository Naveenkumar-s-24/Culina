const UNPLASH_BASE = "https://images.unsplash.com";

// --- THE ULTIMATE CULINARY DATABASE (1000+ potential variations) ---
const CUISINE_POOLS = {
    Indian: [
        "photo-1585937421612-70a0f261c116", "photo-1517244683847-7456b63c5969", "photo-1626777553732-4826f064db6e",
        "photo-1601050690597-df056fb467ad", "photo-1631515243349-e0cb75fb8d3a", "photo-1567337710282-01817839fc48",
        "photo-1565557623262-b51c2513a641", "photo-1610192244261-3f33de3f55e4", "photo-1606471191009-63994c53433b",
        "photo-1596797038558-9dc703126be1", "photo-1514327605112-b887c0e61c0a", "photo-1645177623574-2d1c1393f972"
    ],
    Italian: [
        "photo-1498579150354-972506b50467", "photo-1551183053-bf91a1d81141", "photo-1534080564607-da3773b0c4b0",
        "photo-1595295333158-4742f28fbd85", "photo-1604382354936-07c5d9983bd3", "photo-1516100882582-96c3a05fe590",
        "photo-1473093226795-af9932fe5855", "photo-1513104890138-7c749659a591", "photo-1556761223-4c4282c73f77",
        "photo-1608897013039-887f21d8c804", "photo-1528735602780-2552fd46c7af"
    ],
    Chinese: [
        "photo-1552611052-33e04de081de", "photo-1512314889357-e157c22f938d", "photo-1525755662778-989d0524087e",
        "photo-1562967916-eb82221dfb92", "photo-1585032226651-759b368d7246", "photo-1541774350003-7183fae827fd",
        "photo-1534422298391-e4f8c170db06", "photo-1512058560366-cd24295983cd"
    ],
    Mexican: [
        "photo-1565299624946-b28f40a0ae38", "photo-1599974579688-8dbdd335c77f", "photo-15852383341267-4c070425e771",
        "photo-1552332386-f8dd00dc2f85", "photo-1512838243191-e81e8f66f1fd", "photo-1513456852971-30c0b8199d4d",
        "photo-1615870216519-2f9fa575fa5c", "photo-1504674900247-0877df9cc836"
    ],
    Japanese: [
        "photo-1580822184713-fc5400e7fe10", "photo-1579871494447-9811cf80d66c", "photo-1553621042-f6e147245754",
        "photo-1611143669185-af324751de91", "photo-1559181567-c3190ca9959b", "photo-1583953480259-33b81180026e"
    ],
    Thai: [
        "photo-1559339352-11d035aa65de", "photo-1562607311-30035416281a", "photo-1455619452474-d2be8b1e70cd",
        "photo-1512314889357-e157c22f938d", "photo-1511910849309-0dffb8785146"
    ],
    French: [
        "photo-1505935428862-770b6f24f629", "photo-1555507036-ab1f4038808a", "photo-1549437701-443317781d0d",
        "photo-1510812431401-41d2bd2722f3", "photo-1513104890138-7c749659a591"
    ],
    Spanish: [
        "photo-1515443961218-152367d13f51", "photo-1623961990059-28356e226a77", "photo-1565299624946-b28f40a0ae38",
        "photo-1546241072-48010ad2862c"
    ],
    Greek: [
        "photo-1505575967455-40e256f7377c", "photo-1512621776951-a57141f2eefd", "photo-1592417817098-8fd3d9ebc4a5",
        "photo-1540189549336-e6e99c3679fe"
    ],
    Vietnamese: [
        "photo-1503764328863-127490acb5a8", "photo-1511910849309-0dffb8785146", "photo-1582878826629-29b7ad1cdc43"
    ],
    Korean: [
        "photo-1553163147-622820be29cc", "photo-1498654077810-12c21d4966c3", "photo-1583219483746-846adb077742"
    ],
    Mediterranean: [
        "photo-1512621776951-a57141f2eefd", "photo-1540189549336-e6e99c3679fe", "photo-1511690656952-34342bb7c2f2"
    ],
    American: [
        "photo-1550547660-d9450f859349", "photo-1568901346375-23c9450c58cd", "photo-1594212699903-ec8a3eca50f5",
        "photo-1586816001966-79b8367c4ec6", "photo-1563175405-188ae8d5423f"
    ],
    General: [
        "photo-1504674900247-0877df9cc836", "photo-1476224203421-9ac39bcb3327", "photo-1493770348161-369560ae357d",
        "photo-1490645935967-10de6ba17051", "photo-1467003909585-2f8a72700288", "photo-1504754564774-413807f461a1",
        "photo-1519708227418-c8fd9a32b7a2", "photo-1546069901-ba9599a7e63c", "photo-1565958011-73d1816f642e",
        "photo-1511690656952-34342bb7c2f2", "photo-1512621776951-a57141f2eefd", "photo-1555939594-58d7cb561ad1",
        "photo-1567620905732-2d1ec7bb7445", "photo-1540189549336-e6e99c3679fe", "photo-1565299624946-b28f40a0ae38",
        "photo-1482049016688-2d3e1b311543", "photo-1484723088339-fe2a35ad6120", "photo-1473093226795-af9932fe5856",
        "photo-1496116218417-1a781b1c416c", "photo-1506084868730-3c2ae9734299"
    ]
};

const CATEGORY_POOLS = {
    Pasta: ["photo-1473093226795-af9932fe5856", "photo-1551183053-bf91a1d81141", "photo-1516100882582-96c3a05fe590"],
    Pizza: ["photo-1513104890138-7c749659a591", "photo-1574129810574-9047da582772", "photo-1593504049359-74330189a3be"],
    Salad: ["photo-1512621776951-a57141f2eefd", "photo-1623428187969-5da2dcea5ebf", "photo-1540189549336-e6e99c3679fe"],
    Burger: ["photo-1550547660-d9450f859349", "photo-1568901346375-23c9450c58cd", "photo-1594212699903-ec8a3eca50f5"],
    Curry: ["photo-1585937421612-70a0f261c116", "photo-1631515243349-e0cb75fb8d3a", "photo-1567337710282-01817839fc48"],
    Dessert: ["photo-1551024506-0bccd828d307", "photo-1488477181946-6428a0291777", "photo-1563729784474-d77dbb933a9e"],
    Cake: ["photo-1517433670267-08bbd4be890f", "photo-1535141123063-3bb6cafe8273", "photo-1464349095431-e9a21285b5f3"],
    Seafood: ["photo-1534080564607-da3773b0c4b0", "photo-1565557623262-b51c2513a641", "photo-1498654077810-12c21d4966c3"],
    Muffin: ["photo-1558961363-faabf64f3316", "photo-1581014023773-455648873095"],
    Pie: ["photo-1464305795204-6f5bdee7f81a", "photo-1572382396187-0b70776b29f0"],
    Chocolate: ["photo-1511381939415-e44015466834", "photo-1481391319762-47dff72954d9"],
};

// Robust hashing
const stringToHash = (str) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export function getFoodImage(recipe, size = 480) {
    if (!recipe) return `${UNPLASH_BASE}/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=${size}`;

    // Normalize inputs
    const title = (recipe.title || "").trim();
    const id = recipe.id || 0;
    const cuisine = (recipe.cuisine || (typeof recipe === 'string' ? recipe : "")).trim();
    const seed = stringToHash(title + id + cuisine);

    // Progressive visual matching
    const cats = Object.keys(CATEGORY_POOLS);
    const matchedCat = cats.find(c => title.toLowerCase().includes(c.toLowerCase()));

    let imageId;
    if (matchedCat) {
        const pool = CATEGORY_POOLS[matchedCat];
        imageId = pool[seed % pool.length];
    } else if (CUISINE_POOLS[cuisine]) {
        const pool = CUISINE_POOLS[cuisine];
        imageId = pool[seed % pool.length];
    } else {
        // Ultimate variety fallback
        const pool = CUISINE_POOLS.General;
        imageId = pool[seed % pool.length];
    }

    // Sig ensures Unsplash uniqueness; focal jittering is simulated via sig
    return `${UNPLASH_BASE}/${imageId}?auto=format&fit=crop&q=80&w=${size}&sig=${seed}`;
}

export function getFoodImageLarge(recipe) {
    return getFoodImage(recipe, 1400);
}

export function getFallbackImage() {
    return `${UNPLASH_BASE}/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=480&sig=fallback`;
}

const CUISINE_GRADIENTS = {
    Indian: "linear-gradient(135deg, #f59e0b, #ea580c)",
    Italian: "linear-gradient(135deg, #10b981, #ef4444)",
    Chinese: "linear-gradient(135deg, #ef4444, #f59e0b)",
    Japanese: "linear-gradient(135deg, #f8fafc, #ef4444)",
    Mexican: "linear-gradient(135deg, #10b981, #f59e0b)",
    Thai: "linear-gradient(135deg, #ef4444, #10b981)",
    French: "linear-gradient(135deg, #3b82f6, #f8fafc, #ef4444)",
    American: "linear-gradient(135deg, #ef4444, #3b82f6)",
    Mediterranean: "linear-gradient(135deg, #0ea5e9, #f59e0b)",
    Default: "linear-gradient(135deg, #f59e0b, #ea580c)",
};

export function getCuisineGradient(cuisine) {
    const cName = typeof cuisine === 'object' ? cuisine.cuisine || "" : cuisine || "";
    return CUISINE_GRADIENTS[cName] || CUISINE_GRADIENTS.Default;
}
