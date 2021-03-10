# About
This document outlines list of features implemented for pegacorn-communicate project and relevant configurations changed as a part of user stories.

### OOTB Feature items
OOTB user stories signify a feature which is out of box and do not need modification.

### OOTB Modified Feature items
Communicate uses OOTB modified user stories which means that feature needs to have values customised in order to fulfill requirement of a given user story.

## Features
### Feature: 188662
Web: As an Authenticated Practitioner, I should be able to personalise the Voice & Video Settings, so that I can control certain system behaviours that will maximise my user experience.

Out of box features
The following user settings are controlled by the specified configuration values in the config-communicate.json file:
* Audio output - controlled by the OOTB webrtc_audiooutput setting, no change required for this story
* Microphone - controlled by the OOTB webrtc_audioinput setting, no change required for this story
* Camera - controlled by the OOTB webrtc_videoinput setting, no change required for this story

Customized Features through our values inserted through communicate-config.json and UI.Feature
* Mirror local video feed (new config item ShowSettingMirrorLocalVideoFeed to toggle if this setting is visible) - controlled by the OOTB VideoView.flipVideoHorizontally setting, which defaults to false, so no override config value is required.
* Allow Peer-to-Peer for 1:1 calls (new config item ShowSettingAllowPeerToPeerForOneToOneCalls to toggle if this setting is visible) - controlled by the OOTB webRtcAllowPeerToPeer setting, which defaults to true, so a config override was attempted to be added to set this to false, however this didn't appear to work, so instead the inverse OOTB webRtcForceTURN setting was set the true, to override the default for webRtcAllowPeerToPeer and set it to be false)
* Allow fallback call assist server (new config item ShowSettingAllowFallbackCallAssist to toggle if this setting is visible) - controlled by the OOTB fallbackICEServerAllowed setting, which defaults to null (prompt the user), so a config override has been added to set this to false

### Feature:188496
Web: As an Authenticated Practitioner, I should not be able to view certain Settings that are not applicable or do not need to be displayed to the user, so that I only see applicable settings
- Flair gets removed automatically when you disable Community. As such, this feature was available out of the box with a config change.
- Community is not enabled by default (NOTE: on https://app.element.io they have enabled Flair), so Flair is disabled by default.
**config**
Community feature controls Flair feature at the moment in Setting.ts and this switch is turned off via communicate-config.json by using `"UIFeature.communities": false`.

### Feature: 188663
Web: As an Authenticated Practitioner, I should be able to personalise the Security & Privacy Settings, so that I can control certain system behaviours that will maximise my user experience
1. Where you're logged in (Tab)
My Sessions
Display each active session for user is a default behavior on web. A bolderized text on particular session represents current session while other sessions in list are from past session. Session last time active shows timeline of session as well on right. This could be simplified to AEST or ADCST format but this user story would not capture that kind of change so it has not been modified at the moment.

Disable delete session option
This options was active by default and has been disabled by hiding the tick box using SecurityAllowSessionEdit flag which triggers delete session button and delete button only appears next to each session  when tickbox is shown and can be activated with click.
Rename session
SecurityAllowSessionEdit has been used to block user from editing session id as a part of change. Default behavior was user could edit session id which appears under SessionID column on top.

Sign out of session
The sign out prompt message has been switched off using SecurityAllowSessionEdit flag but there was no sign out option in Security tab by default so this can be assumed OOTB.

Verify them in your User Profile
This is triggered from Verify them in your User Profile link which takes user to their profile screen on right side panel has been turned off ( SecurityAllowSessionEdit )

2. Advanced
Logged in as:
Home server & Identity Server
Requirement mentions on web there would be Advanced Tab with Home server and Identity Server as OOTB but it does not seem to  have it. Instead this setting might have moved go General setting. General setting would show username, identity server, Homeserver detail.
At the time of doing this user story, on web application these texts/labels were not available anywhere to be seen in advanced tab so assuming that it might have been removed over the time by matrix, no additional development work was done.
3. Cryptography(not visible)
Entire cryptography section has been hidden as we dont have anything to show after hiding everything mentioned in user story so in future if changes occur then we would potentially switch on some feature.
Public name
This label was not found in UI or anywhere in code in cryptography section so no change was made.
Session ID
Session id was visible in UI and has been hidden with AdvancedSetting OOTB already controls this and is set to false in our config file.
Session Key
Session Key was visible in UI and has been hidden with AdvancedSetting OOTB config already controls whether to hide or show this and is set to false in our config file.
Encrypt to verified sessions only
This label was not found in UI or anywhere in code in cryptography section so no change was made.

4. Cryptography Key backup(not visible)
No action is required to existing code as no reference to any of this behavior was found including cryptography key backup option which is not available at the moment. Maybe over the time this feature was discontinued from matrix.
Recover encrypted messages from backup
Deleted backup of encrypted messages
Export room keys
Import room keys

Cross-signing(not visible)
Reset cross signing
Cross signing setting is switched off by using ShowEncryptionSetting flag in config file which was out of the box and no changes required.

Integrations(not visible)
There is no evidence of integration manager in UI in Privacy setting. Having said that, integration manager is part of General user setting so even though as a part of this user story its not actionable, General user setting change implemented showIntegration flag in our config file that hides integration manager options.

Allow integrations
Integration manager

Integration has been switched off and hidden in General setting using ShowIntegration.

Message search - desktop
There is nothing to control message search so no change has been made in terms of hiding message search from UI from Security setting.

Analytics(not visible)
Send analytics data has been turned off by changing pwik definition on config file as well as by adding additional condition where text and toggle would be activated in Advanced setting rule with extra rule : ShowShareAnalyticsInformation.
Report a bug(not visible) has been turned off by Disabled_bug_report_endpoint_url. To turn it on , process would be to remove 'Disabled' from config. bug_report_endpoint_url switch provides url where we update our bug, breaking that variable in config would automatically hide this toggle option on UI. To minimise code changes, no further tweaks has been made in code as this is sufficient.
Rage Shake to report bug: Breaking bug_report_end_url  would be sufficient to hide this from menu so "report bug change" has turned it off when above changes was made.
Submit debug logs
Its no longer part of this user story, instead its part of Help and About setting.
Clear cache and reload
Its a part of "Help and About" setting so no action required in Security setting.
Labs(not visible)
Lab setting is not separate feature in UI but controls whether experimental features to be made available to user. This is controlled by flag showLabSettings which is set to false. So, if a feature is experimental it wont be shown to user.
Lazy load room members
There was no changes required to turn off this feature as it seems to be discontinued in current state of codebase in element-web.
Create conference calls with JITSI  ( setting must be turned off and not visible)
It is not a separate setting option to turn JITSI off and on. However, what server is used for JITSI is controlled by config.
In order to enable JITSI conference call and be able to use it, a config needs to be passed on our custom config. jitsi.preferredDomain controls JITSI conference calls. OOTB behavior would be that it defaults to matrix JITSI server. This is future discussion as how we want to handle this. JITSI config value jitsi  has been changed to DISABLED_jitsi to disconnect our UI to jitsi server domain.
Data save mode
There was no evidence of anything in codebase in setting to mention this was available in web.
Send voice messages
There was no evidence of anything in codebase in setting to mention this was available in web.
### Feature: 188664
Web: As an Authenticated Practitioner, I should be able to personalise the Help & About Settings, so that I can control certain system behaviors that will maximise my user experience
FAQ
Display FAQS
User Setting doc mentions about making FAQ title is displayed but bot is hidden which would otherwise lead to element's help page.
Keyboard shortcuts ( display allowable keyboard)
No change has been made for default behavior as by default keyboard shortcuts are displayed.
Technically KeyboardShortcuts file in javascript toggles display of modal on the screen displaying what keys are allowed/disallowed. Should there be a requirements in future to control which shortcuts are allowed/disallowed specifically , change is would be possible but not part of this user story.
Versions
Version
OLM version ( i.e. hide option for OLM version)
Default behavior was to show OLM version. Its been hidden using ShowSimplifiedVersionInformation which can toggle the version information show/hide based on value we pass in from config.
Check for update ( i.e. hide option for check for update)
Check for update option has been hidden with ShowSimpliefiedVersionInformation flag.
Legal

Legal information comes from providing external links url in config file into terms_and_conditions_links in json config field. It takes url input to show external links and text input to display external link which corresponds to text.
Privacy at the moment defaults to act government privacy page - https://www.act.gov.au/privacy
Credit at the moment takes user to act government privacy page
Third-party notices did not need code changes as no references were found to say third party notice.
Cookie policy has been hidden as per user story requirement.
Terms and Condition at the moment lead's to act government privacy page as well.
Urls for setting above are configurable values so can be easily changed.

Advanced(not visible)
Keep media - not available anymore by default maybe discontinued by matrix over time
Clear media cache is controlled by ShowAdvancedAboutInformation flag which also hides homserver, identity server and access token detail not been mentioned in this user story anywhere and were available in web.
Clear cache
Mark all messages as read - This option is not available in help setting.
Credit
By default credit info credits authors of font, emoji at the moment. Credit information is already on screen and set to default. There is no copyright info to refer to at this stage.

### Feature: 188488

Profile Picture -  Following expectations were in user story and are met by user story by default. These items in list are not configurable and are available in feature by default.
System can open file location while browsing looking for profile image
System can give preview of profile picture before you can save. Before saving profile picture you could see profile picture then decide whether or not to save your new profile image. Not clicking save button will allow you to save another image or revert back to old image.
System can save profile image
System can remove existing image when "remove" button is clicked
Display name - Display name has been made unmodifiable by user by using ChangeDisplayName config item
Email - Email address is uneditable by user but in order to display email address it should be available in user profile from Identity Server.
Phone Number - Its uneditable by user and a list of phone numbers are managed by identity server, and can be displayed if available in user profile. If no phone number is available then it wont be displayed.
Country code for phone number - Default behavior would give option to user to change country code from drop down and was set to "GB" which is United Kingdom, has been changed now to "AU" for australia in config file. CountryDropdown file reads defaultCountryCode in order to display default country code.
Password - This option has been hidden using ShowPasswordReset config item. Default behavior was to show password reset option in UI.
Local contacts (not visible)
Phonebook country - This has been hidden using EditphoneNumbers . Default behavior showed phonenumber being editable and country code being selectable. User story needed it to be hidden and country set to australia.
Use emails and phone numbers to discover users
Discovery - This setting allows user to be discoverable by their username/password. This feature has been turned off using ShowDiscoverySection config value and can be re-instated if need it be.




