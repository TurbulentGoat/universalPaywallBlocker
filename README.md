# UNIVERSAL Paywall Blocker  
(No longer just waToday!!)

Firstly, these paywalls seem to change how they generate them, and what they hide behind then, quite often - so it might just not work one day.

I've been made aware of websites you can go to, one example is [12ft](https://12ft.io) and to be fair, it works really well. My tool, though, doesn't fully disable Javascript like theirs. Neither is bad, just as I said, no single tool does all jobs. You need to decide what is best for what you need at that time. (Just to be VERY clear, I have not looked at their code, I do not know how they do what they do, so if there are ANY similarities between the two in how they are written it is purely coincidental!)

A userscript designed to hide the paywall prompt and enable scrolling on **most** websites. It will not work for all, no tool can. I'm just one guy, not even a pro so if you have any tips/advice/changes...please let me know!

## Features

- **Hide Paywall Prompt:** Removes the paywall overlay for an uninterrupted reading experience.
- **Enable Scrolling:** Ensures that scrolling isn't disabled by the website's scripts.
- **Block Specific Network Requests:** Intercepts and blocks targeted network requests to enhance usability.

## Installation

1. **Install a Userscript Manager:**
   - **Tampermonkey:** Available for [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Safari](https://apps.apple.com/app/tampermonkey/id1482490089).
   - **Greasemonkey:** Available for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/).

2. **Install the Userscript:**
   - Navigate to the [Paywall_BeGone.user.js](https://github.com/TurbulentGoat/universalPaywallBlocker) file in this repository.
   - Click on the **"Raw"** button to view the raw script.
   - Your userscript manager should prompt you to install the script. Follow the on-screen instructions.

## Usage

- **Automatic Activation:** The script runs automatically when you visit a site that you know uses a paywall, but it is not showing. Test on [WA Today](https://www.watoday.com.au/).
- **Manual Activation:** If needed, click on the userscript manager icon and ensure the script is enabled.

## Customization

You can modify the script to suit your preferences. For example, adjust which elements to hide or change the conditions under which network requests are blocked.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.
