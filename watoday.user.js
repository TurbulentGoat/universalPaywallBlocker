// ==UserScript==
// @name         WA Today Paywall Buster & Network Blocker
// @namespace
// @version      1
// @description  Hides the paywall prompt, enables scrolling, and blocks specific network requests on WA Today
// @author       TurbulentGoat
// @match        *://www.watoday.com.au/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

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
        console.log('[WA Today Paywall Buster] Custom styles applied: body overflow set to auto.');
    }

    /**
     * Hides the paywall prompt by targeting its ID.
     * @returns {boolean} - Returns true if the paywall was found and hidden, else false.
     */
    function hidePaywall() {
        const paywall = document.getElementById('paywall-prompt-wrapper-piano-id');
        if (paywall) {
            paywall.style.display = 'none';
            console.log('[WA Today Paywall Buster] Paywall prompt hidden.');
            return true;
        }
        return false;
    }

    /**
     * Removes classes and inline styles that prevent scrolling.
     * Specifically targets elements with classes 'tp-scroll-prevented' and 'tp-body-scroll-prevented'.
     * @returns {boolean} - Returns true if any scroll-preventing elements were modified, else false.
     */
    function enableScrolling() {
        const scrollPreventedElements = document.querySelectorAll('.tp-scroll-prevented, .tp-body-scroll-prevented');
        let modified = false;

        scrollPreventedElements.forEach(element => {
            // Remove classes that prevent scrolling
            element.classList.remove('tp-scroll-prevented', 'tp-body-scroll-prevented');

            // Remove inline styles that prevent scrolling
            element.style.height = '';
            element.style.overflow = '';
            element.style.touchAction = '';

            modified = true;
            console.log('[WA Today Paywall Buster] Scroll-preventing classes and styles removed from an element.');
        });

        if (modified) {
            console.log('[WA Today Paywall Buster] Scrolling has been enabled.');
            return true;
        }
        return false;
    }

    /**
     * Applies all modifications: adds custom styles, hides paywall, and enables scrolling.
     * @returns {boolean} - Returns true if any modifications were applied, else false.
     */
    function applyModifications() {
        addCustomStyles();
        const paywallHidden = hidePaywall();
        const scrollingEnabled = enableScrolling();
        return paywallHidden || scrollingEnabled;
    }

    /**
     * Sets up a MutationObserver to monitor the DOM for changes.
     * Applies modifications when new nodes are added that match the targets.
     */
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations, obs) => {
            let modificationApplied = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is the paywall
                        if (node.id === 'paywall-prompt-wrapper-piano-id') {
                            node.style.display = 'none';
                            console.log('[WA Today Paywall Buster] Paywall prompt hidden via MutationObserver.');
                            modificationApplied = true;
                        }

                        // Check if the added node has scroll-preventing classes
                        if (node.classList.contains('tp-scroll-prevented') || node.classList.contains('tp-body-scroll-prevented')) {
                            node.classList.remove('tp-scroll-prevented', 'tp-body-scroll-prevented');
                            node.style.height = '';
                            node.style.overflow = '';
                            node.style.touchAction = '';
                            console.log('[WA Today Paywall Buster] Scroll-preventing classes and styles removed via MutationObserver.');
                            modificationApplied = true;
                        }
                    }
                });
            });

            if (modificationApplied) {
                console.log('[WA Today Paywall Buster] Modifications applied via MutationObserver. Disconnecting observer.');
                obs.disconnect(); // Stop observing after modifications are applied
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[WA Today Paywall Buster] MutationObserver set up to monitor DOM changes.');
    }

    /**
     * Overrides the native fetch function to intercept and block specific network requests.
     */
    function overrideFetch() {
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            const url = args[0];
            if (typeof url === 'string' && url.includes('https://c2-au.piano.io/xbuilder/experience/execute?aid=lG1OZt97pa')) {
                console.warn('[WA Today Paywall Buster] Blocking fetch request to:', url);
                // Return a dummy response or reject the promise to block the request
                return new Response(null, { status: 200, statusText: 'OK' });
                // Alternatively, reject the fetch
                // return Promise.reject(new Error('Blocked by WA Today Paywall Buster'));
            }
            return originalFetch.apply(this, args);
        };
        console.log('[WA Today Paywall Buster] fetch overridden to block specific requests.');
    }

    /**
     * Overrides the native XMLHttpRequest to intercept and block specific network requests.
     */
    function overrideXMLHttpRequest() {
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this._url = url;
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function(body) {
            if (this._url && this._url.includes('https://c2-au.piano.io/xbuilder/experience/execute?aid=lG1OZt97pa')) {
                console.warn('[WA Today Paywall Buster] Blocking XMLHttpRequest to:', this._url);
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

        console.log('[WA Today Paywall Buster] XMLHttpRequest overridden to block specific requests.');
    }

    /**
     * Injects the network interceptors into the page's context.
     * This ensures that the overrides affect all scripts on the page.
     */
    function injectNetworkInterceptors() {
        overrideFetch();
        overrideXMLHttpRequest();
    }

    /**
     * Initializes the userscript by applying modifications, injecting network interceptors,
     * and setting up the observer if needed.
     */
    function init() {
        applyModifications();
        injectNetworkInterceptors();

        // Check if modifications are already applied, if not set up the observer
        const modificationsApplied = hidePaywall() || enableScrolling();
        if (!modificationsApplied) {
            console.log('[WA Today Paywall Buster] Initial modifications not applied. Setting up MutationObserver.');
            setupMutationObserver();
        } else {
            console.log('[WA Today Paywall Buster] Initial modifications applied successfully.');
        }
    }

    // Initialize the script
    init();

})();
