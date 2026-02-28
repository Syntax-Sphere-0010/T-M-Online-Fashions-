const fs = require('fs');

try {
    const vHtml = fs.readFileSync('video-shopping.html', 'utf8');
    const iHtml = fs.readFileSync('index.html', 'utf8');

    // 1. Get top part of video-shopping.html up to the Comments label exactly
    const splitToken = '                    <label class="vs-label">Comments</label>';
    const vParts = vHtml.split(splitToken);
    const topPart = vParts[0] + splitToken;

    // 2. The missing form close section
    const formClose = `
                    <textarea class="vs-textarea" placeholder="Tell us what you're looking for..."></textarea>
                </div>
            </div>

            <button type="submit" class="vs-submit-btn">BOOK AN APPOINTMENT</button>
        </form>
    </div>

    <div class="desktop-only-video-page">
`;

    // 3. The middle part from index.html (collections, footer, modals)
    const iStart = iHtml.indexOf('    <!-- SAREE COLLECTION SECTION -->');
    const iEnd = iHtml.indexOf('    <script src="./index.js"></script>');
    const middlePart = iHtml.substring(iStart, iEnd);

    // 4. The end scripts for video-shopping.html
    const endWrapperClose = `    </div>\n\n`;

    const shopifyScripts = `    <script src="./shopify.config.js"></script>
    <script src="./shopify-buy.js"></script>
    <script src="./products-data.js"></script>
    <script src="./store.js"></script>
    <script src="./search.js"></script>
    <script>
        (function () {
`;

    // 5. The rest of the intact scripts from video-shopping.html
    const scriptSplitToken = "                    const hamburger = document.getElementById('hamburgerToggle');";
    const vScriptParts = vHtml.split(scriptSplitToken);

    let bottomPartContent = "";
    if (vScriptParts.length > 1) {
        bottomPartContent = "            const hamburger = document.getElementById('hamburgerToggle');" + vScriptParts[1];
    } else {
        // Fallback if the token is slightly different
        const fallbackStart = vHtml.indexOf("const hamburger = document.getElementById('hamburgerToggle');");
        if (fallbackStart !== -1) {
            bottomPartContent = vHtml.substring(fallbackStart);
        }
    }

    const finalHtml = topPart + formClose + middlePart + endWrapperClose + shopifyScripts + bottomPartContent;

    fs.writeFileSync('video-shopping.html', finalHtml, 'utf8');
    console.log("Restoration complete. Size:", finalHtml.length);
} catch (e) {
    console.error("Error restoring:", e);
}
