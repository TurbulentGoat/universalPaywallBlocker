// ==UserScript==
// @name         Universal Paywall Buster & Network Blocker
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Hides paywall prompts, enables scrolling, and blocks specific network requests across all websites
// @author       TurbulentGoat
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    /**
     * List of URLs or URL patterns to block.
     * Add any additional URLs or patterns here.
     */
    const blockedUrls = [
        'https://loader.mantis-intelligence.com/nine/loader.js',
        'https://c2-au.piano.io/xbuilder/experience/execute?aid=lG1OZt97pa',
        'https://c2-au.piano.io/xbuilder/experience/execute?aid=lrJ8j3qepa',
        'https://loader.mantis-intelligence.com/clientsidetag/latest/nine/mantis.min.js'
    ];

    /**
     * Adds custom CSS styles to the page.
     * Ensures that the body overflow is set to auto to enable scrolling.
     */
    function addCustomStyles() {
        GM_addStyle(`
            body {
                overflow: auto !important;
            }
        `);
        console.log('[Paywall Buster & Network Blocker] Custom styles applied: body overflow set to auto.');
    }

    /**
     * Hides paywall prompts by targeting common paywall container selectors.
     * Adds more selectors as needed to cover different websites.
     * @returns {boolean} - Returns true if any paywall elements were found and hidden, else false.
     */
    function hidePaywalls() {
        const paywallSelectors = [
            '#paywall-prompt-wrapper-piano-id',
            '.paywall-overlay',
            '#paywall',
            '.subscription-popup',
            '.access-restricted',
            '.js-paywall',
            '.paywall-container',
            '.paywall-modal',
            '#paywall-modal',
            '.paywall-wrapper',
            '.paywall-blocker',
            '.block-paywall'
        ];

        let hidden = false;

        paywallSelectors.forEach(selector => {
            const paywalls = document.querySelectorAll(selector);
            paywalls.forEach(paywall => {
                paywall.style.display = 'none';
                console.log(`[Paywall Buster & Network Blocker] Paywall element hidden: ${selector}`);
                hidden = true;
            });
        });

        return hidden;
    }

    /**
     * Removes classes and inline styles that prevent scrolling.
     * Specifically targets elements with classes containing 'scroll-prevented'.
     * @returns {boolean} - Returns true if any scroll-preventing elements were modified, else false.
     */
    function enableScrolling() {
        const scrollPreventedElements = document.querySelectorAll('[class*="scroll-prevented"]');

        let modified = false;

        scrollPreventedElements.forEach(element => {
            // Remove classes that prevent scrolling
            element.classList.forEach(cls => {
                if (cls.includes('scroll-prevented')) {
                    element.classList.remove(cls);
                    console.log(`[Paywall Buster & Network Blocker] Removed scroll-preventing class: ${cls}`);
                    modified = true;
                }
            });

            // Remove inline styles that prevent scrolling
            if (element.style.overflow === 'hidden' || element.style.overflow === 'auto') {
                element.style.overflow = '';
                console.log('[Paywall Buster & Network Blocker] Removed scroll-preventing overflow style.');
                modified = true;
            }

            if (element.style.height) {
                element.style.height = '';
                console.log('[Paywall Buster & Network Blocker] Removed scroll-preventing height style.');
                modified = true;
            }

            if (element.style.touchAction) {
                element.style.touchAction = '';
                console.log('[Paywall Buster & Network Blocker] Removed scroll-preventing touchAction style.');
                modified = true;
            }
        });

        if (modified) {
            console.log('[Paywall Buster & Network Blocker] Scrolling has been enabled.');
            return true;
        }
        return false;
    }

    /**
     * Blocks specified network requests by overriding fetch and XMLHttpRequest.
     */
    function blockNetworkRequests() {
        // Override fetch
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            const url = args[0];
            if (typeof url === 'string' && blockedUrls.some(blockedUrl => url.includes(blockedUrl))) {
                console.warn('[Paywall Buster & Network Blocker] Blocking fetch request to:', url);
                // Return a dummy response to block the request
                return new Response(null, { status: 200, statusText: 'OK' });
            }
            return originalFetch.apply(this, args);
        };
        console.log('[Paywall Buster & Network Blocker] fetch overridden to block specific requests.');

        // Override XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this._url = url;
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function(body) {
            if (this._url && blockedUrls.some(blockedUrl => this._url.includes(blockedUrl))) {
                console.warn('[Paywall Buster & Network Blocker] Blocking XMLHttpRequest to:', this._url);
                // Simulate a successful response without executing the request
                this.addEventListener('readystatechange', function() {
                    if (this.readyState === 4) {
                        this.status = 200;
                        this.statusText = 'OK';
                        this.responseText = JSON.stringify({
                            "hasAppAccess": true,
                            "hasAppPremiumSubAccess": true,
                            "hasAppSubAccess": true,
                            "isCurrentGoogleEntitlement": true,
                            "isExternalPurchaseSource": true,
                            "isIPBypass": true,
                            "isReadyToPayWithGoogle": true,
                            "subscriptionEntitlements": ["mockEntitlement"],
                            "subscriptionPlans": ["mockPlan"]
                        });
                        // Trigger the onreadystatechange event
                        if (typeof this.onreadystatechange === 'function') {
                            this.onreadystatechange();
                        }
                    }
                }, false);
                // Do not send the actual request
                return;
            }
            return originalSend.apply(this, arguments);
        };
        console.log('[Paywall Buster & Network Blocker] XMLHttpRequest overridden to block specific requests.');
    }

    /**
     * Removes <script> tags that match blocked URLs.
     */
    function removeBlockedScripts() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            blockedUrls.forEach(blockedUrl => {
                if (script.src.includes(blockedUrl)) {
                    script.parentNode.removeChild(script);
                    console.log(`[Paywall Buster & Network Blocker] Removed script tag: ${script.src}`);
                }
            });
        });
    }

    /**
     * Sets up a MutationObserver to monitor the DOM for changes.
     * Applies modifications when new nodes are added that match the targets.
     */
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let modificationApplied = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Hide paywall elements
                        if (hidePaywalls()) {
                            modificationApplied = true;
                        }

                        // Enable scrolling on dynamically added elements
                        if (enableScrolling()) {
                            modificationApplied = true;
                        }

                        // Remove blocked scripts
                        removeBlockedScripts();
                    }
                });
            });

            if (modificationApplied) {
                console.log('[Paywall Buster & Network Blocker] Modifications applied via MutationObserver.');
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[Paywall Buster & Network Blocker] MutationObserver set up to monitor DOM changes.');
    }

    /**
     * Initializes the userscript by applying modifications, blocking network requests,
     * removing existing blocked scripts, and setting up the MutationObserver.
     */
    function init() {
        addCustomStyles();
        hidePaywalls();
        enableScrolling();
        blockNetworkRequests();
        removeBlockedScripts();
        setupMutationObserver();
    }

    // Initialize the script
    init();

})();
