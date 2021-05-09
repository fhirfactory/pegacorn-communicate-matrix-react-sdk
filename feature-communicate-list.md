<h1>Communicate Feature Documentation</h1>
=============================================

What is this document about ?
===========================================

This document outlines list of features implemented for pegacorn-communicate project and relevant configurations changes and other customization as a part of different user stories. If you are working in front end for communicate, it is suggested to list feature in incremental order by their user story number.

What is (OOTB) Feature in communicate ?
=====================================

OOTB user stories signify a feature which is out of box and do not need modification. Sometimes a part of user story might be out of box, while other time, entire user story might be out of box.

What is (OOTB) Modified Feature items ?
=====================================

Communicate uses (OOTB) modified user stories which means that feature needs to have values customised in order to fulfill requirement of a given user story.

Communicate Features
=====================================================

Feature: 188488
Web: As an Authenticated Practitioner, I should be able to personalize the General Settings, so that I can control certain system behaviors that will maximize my user experience.
============================================================

Profile Picture -  Following expectations were in user story and are met by user story by default. These items in list are not configurable and are available in feature by default.
System can open file location while browsing looking for profile image
System can give preview of profile picture before you can save. Before saving profile picture you could see profile picture then decide whether or not to save your new profile image. Not clicking save button will allow you to save another image or revert back to old image.

System can save profile image-
System can remove existing image when "remove" button is clicked.
Display name - Display name has been made unmodifiable by user by using ChangeDisplayName config item
Email - Email address is not editable by user but in order to display email address it should be available in user profile from Identity Server.
Phone Number - Its not editable by user and a list of phone numbers are managed by identity server, and can be displayed if available in user profile. If no phone number is available then it wont be displayed.
Country code for phone number - Default behavior would give option to user to change country code from drop down and was set to "GB" which is United Kingdom, has been changed now to "AU" for australia in config file. CountryDropdown file reads defaultCountryCode in order to display default country code.
Password - This option has been hidden using ShowPasswordReset config item. Default behavior was to show password reset option in UI.

Local contacts (not visible)
Phonebook country - This has been hidden using EditphoneNumbers . Default behavior was form number and country code was editable. User story needed it to be hidden and country set to australia.

Use emails and phone numbers to discover users
Discovery - This setting allows user to be discoverable by their username/password. This feature has been turned off using ShowDiscoverySection config value and can be re-instated if need it be.

Feature: 188495
Web: As an Authenticated Practitioner, I should be able to personalize the Appearance Settings, so that I can control certain system behaviours that will maximize my user experience.
====================================================================

This discussion is based on two Selection criteria. One is from this user story and other is from user stories underneath Appearance setting from User Setting Document.
Additional Selection Criteria
Enable experimental, compact IRC style layout
This is checkbox unchecked and is available by default to check/uncheck under advanced under Appearance setting tab.
User story expects this value to be hidden from view,  ShowSettingIRCStyleLayout hides checkbox from view which is config value implemented by us to hide it from view.
Original Selection Criteria from User Setting document
Use more compact modern layout
IRC Layout is shown by default under advanced tab, needs to be shown for user story, so no changes required in config.
Font Size
Requirement says default font size to be set to 15, whereas default value from matrix was set at 10, its been modified by changing font size from 10 to 15. In order to do that, showDefaultFontSize as required on renderFondSection function. As it is not supposed to be visible for user to modify , its been hidden by using changeFont custom flag that wraps UI dealing with font size scaling. Value is set to false in custom config.
The checkbox for font under Advanced section has been hidden with showSettingFontStyleLayout custom config value set to false.
Theme
Allow you to select a visual theme
Web user story expects it to be enabled, which was default behavior, its been hidden from view with custom config value ChangeTheme config value, and excludeDefault hardcoded value.

Feature:188496
Web: As an Authenticated Practitioner, I should not be able to view certain Settings that are not applicable or do not need to be displayed to the user, so that I only see applicable settings
=========================================================

- Flair gets removed automatically when you disable Community. As such, this feature was available out of the box with a config change.
- Community is not enabled by default (NOTE: on https://app.element.io they have enabled Flair), so Flair is disabled by default.
**config**
Community feature controls Flair feature at the moment in Setting.ts and this switch is turned off via communicate-config.json by using `"UIFeature.communities": false`.

Feature: 188661
Web: As an Authenticated Practitioner, I should be able to personalize the Preference Settings, so that I can control certain system behaviors that will maximize my user experience.
============================================================

Following preference settings were expected to be turned on by default and be toggled when user tries to toggle.
Room List.
Show shortcuts to recently viewed rooms above the room list ( controls whether recently viewed rooms are displayed above the room list)
enabled by default, so no code changes was required.
Timeline.
Show rooms with unread messages first (controls whether chats with missed messages are shown first.).
enabled but hidden by default from matrix for some reason, but for this user story, it has been shown using RoomList.orderByImportance flag, which is passed into array which populates these list of preference settings.
Enable emoji suggestions while typing (controls whether emojis are suggested as you type).
Enabled by default using MessageComposer.suggestEmoji , disabled from our custom config with inverted flag of same setting MessageComposer.dontSuggestEmoji set to true ino ur config, to meet user story requirement. If suggestEmoji was set to false, it would not have disabled this notification setting. Inverted needs to be used where it has been configured.
Send message with enter (Controls whether a message is sent using the <Enter> key.
This is default behavior on web as well and value is set to off so no changes required (MessageComposer.ctrlEnterToSend) controls this value, can be enabled if needed for default.
Markdown formatting (Controls whether messages using markdown syntax are formatted before they are sent)
There is a bug in android and iOS for this feature which says this feature does not properly work, web does not have a control on markdown translation from config yet. There are commands set up not to translate markdown in messages and html. Not sure whether to implement this completely. Considering there is a bug, I believe we should not implement this feature.
Auto-play GIFs and videos (Controls whether GIFs and Videos are played automatically)
This setting is turned off by default so changes required in our config. It can be turned on using autoplayGifsAndVideos.
Inline URL preview (Controls how URL links are displayed within the chat)
This setting is turned on by default using (urlPreviewEnabled) switch/flag so no changes required.
Default compression ( Controls the media file size).
Assuming this is android setting, no changes has been done. On web, no camera/media setting is available in codebase to control compression, should there be need, it might become complex to implement whole lot of work around this. In iOS and Android prompt is presented to specify compression when camera is activated but it is not the case in web so it has been left off to default. In front end there is no evidence of controlling media file compression.
Hidden Settings.
Note:  All preference setting hidden on panel are passed values into preferencePaneHiddenFlag in our custom config.
Show rooms with missed notifications
Not available on web by default so no changes has been made.
Language (controls the language).
There is no language control in preference but setting might have moved to general setting which has language selection option and has been hidden using showLanguageField flag. language flag in setting in frontend controls which language to be set in default and has been set to "en" which translates to English by default.
Flair.
Flair setting is turned off by default when community is turned off. No changes required on web.
Automatically replace plain text emoji (MessageComposerInput.autoReplaceEmoji)
Automatically replace plain text Emoji.
By default its disabled , its now ben hidden by using autoReplaceEmoji flag inside preferencePaneHiddenFlag array in config.
Enable emoji suggestions while typing.
By default, this setting is enabled, it has been disabled using suggestEmoji flag.
Enable big emoji in chat.
This setting was enabled by default , now it has been disabled using TextualBody.enableBigEmoji set to false, also hidden by passing this into preferencePaneHiddenFlag array.
Vibrate when mentioning a user.
Expected result is to disable and hide this setting but since web doesn't have this out of box, no change required
Send typing notifications.
Enabled by default but it has been disabled and hidden using sendTypingNotifications set to false and pass value into preferencePaneHiddenFlag.
Show typing notifications.
Enabled by default, with showTypingNotifications set to false, hidden by including value into preference array in config.
Show read receipts.
Enabled by default, by using showReadReceipts set to false in config, hidden by including into array above.
Show timestamp for all messages.
Disabled by default, needed to be enabled by default, done so by using alwaysShowTimestamp , hiding it under timeline is controlled by showTimelineSetting flag.
Show timestamps in 12-hour format.
Disabled by default, so enabled by customization showTwelveHourTimestamps  value set to false, using hidden by passing showTwelveHourTimestamps into array and view in UI is controlled by showTimelineSetting flag which we have set to false to hide bulk of setting in Timeline section.
Enable automatic language detection for syntax highlighting
Disabled by default, hidden by our custom config with enableSyntaxHighlightLanguageDetection flag.
Show placeholder for deleted messages.
This did not require change as it is not user controllable setting , already done by default in web and already invisible as setting did not exist in view by default and it fulfills requirement.
Show join and leave events.
Enabled by default as needed, hidden with showJoinLeaves flag passed into pref.. flag.
Show account events.
This pref. setting is not present on web so no changes has been made to default.
Show avatar changes.
Enabled by default, needed to be disabled for user story, done by changing showAvatar
Show display name changes.
Enabled by default, needed to be display and hidden for user story, done by using showDisplaynameChanges set to false, and included into array.
Show preview/thumbnails for images.
Already enabled by default as expected by user story, but hidden with showImages config item from our config.
Show the info area.
Not visible by default, not supported or controllable via preference setting on web so no changes has been made and it defaults to default behavior.
Default media source.
Feature not available in web and only available in android, no change of default is expected/required as specified in user setting document.
Play shutter sound.
Feature not available on web but available in android , not expected to be implemented as well, so no change has been made.
Preview media before sending.
Feature not available on web , not expected to be implemented as well, so no change has been made. Feature is available on android.
Always show encryption icons.
Feature was on long time ago on web, but has been discontinued, so no changes made to default which fulfills criteria as well.
Show avatars in user and room mentions
Enabled by default, expected to be hidden and disabled, done so by setting value for Pill.shouldShowPillAvatar to false.
Enable community filter panel.
Enabled by default, expected to be disabled and hidden for this user story, done so by using TagPanel.enableTagPanel flag  into preferencePaneHiddenFlag , and using General_Setting array to hide/show and also hidden by using setting value to false for PreferencesShowGeneralSection in our config.
Prompt before sending invites to potentially invalid matrix id's
Enabled by default, needed to be turned off and invisible in UI for user story, done so by using promptBeforeInviteUnknownUsers to disable this option, and check that on General_Setting array to hide it.
Autocomplete delay.
Already set to 200 by default, no change, change was needed to hide this, done so by using PreferencesShowGeneralSection which is set to false in our config, General_Setting to check if value is included from config which checks against preferencePaneHiddenFlag array from config.
Read marker lifetime delay.
Default value is 3000, same is expectation in setting, no change made on that, also this is hidden by using PreferencesShowGeneralSection with our config which hides whole General section in Preference.
Read marker off-screen lifetime delay.
Default value is set to 30,000 as expected by user story, hidden by custom config using PreferencesShowGeneralSection.

Feature: 188662
Web: As an Authenticated Practitioner, I should be able to personalize the Voice & Video Settings, so that I can control certain system behaviours that will maximize my user experience.
=======================================================

Out of box features(OOTB)
The following user settings are controlled by the specified configuration values in the config-communicate.json file:
* Audio output - controlled by the OOTB webrtc_audiooutput setting, no change required for this story.
* Microphone - controlled by the OOTB webrtc_audioinput setting, no change required for this story.
* Camera - controlled by the OOTB webrtc_videoinput setting, no change required for this story.

Customized Features through our values inserted through communicate-config.json and UI.Feature.
* Mirror local video feed (new config item ShowSettingMirrorLocalVideoFeed to toggle if this setting is visible) - controlled by the OOTB VideoView.flipVideoHorizontally setting, which defaults to false, so no override config value is required.
* Allow Peer-to-Peer for 1:1 calls (new config item ShowSettingAllowPeerToPeerForOneToOneCalls to toggle if this setting is visible) - controlled by the OOTB webRtcAllowPeerToPeer setting, which defaults to true, so a config override was attempted to be added to set this to false, however this didn't appear to work, so instead the inverse OOTB webRtcForceTURN setting was set the true, to override the default for webRtcAllowPeerToPeer and set it to be false)
* Allow fallback call assist server (new config item ShowSettingAllowFallbackCallAssist to toggle if this setting is visible) - controlled by the OOTB fallbackICEServerAllowed setting, which defaults to null (prompt the user), so a config override has been added to set this to false.

Feature: 188663
Web: As an Authenticated Practitioner, I should be able to personalize the Security & Privacy Settings, so that I can control certain system behaviours that will maximize my user experience.
=====================================================

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
Requirement mentions on web that there would be Advanced Tab with Home server and Identity Server as OOTB but it does not seem to  have it. Instead this setting has moved to General setting. General setting would show username, identity server, Homeserver detail.
At the time of doing this user story, on web application these texts/labels were not available anywhere to be seen in advanced tab so seeing that it has moved from Security and About setting to General setting by matrix, no additional development work was done to display this information. In email, proposal has been agreed internally in team to move requirements out from this setting to General.
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
Send analytics data has been turned off by changing pwik definition on config file.
Report a bug(not visible) has been turned off by Disabled_bug_report_endpoint_url. To turn it on , process would be to remove 'Disabled' from config. bug_report_endpoint_url switch provides url where we update our bug, breaking that variable in config would automatically hide this toggle option on UI. To minimize code changes, no further tweaks has been made in code as this is sufficient.
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

Feature: 188664.
Web: As an Authenticated Practitioner, I should be able to personalize the Help & About Settings, so that I can control certain system behaviors that will maximize my user experience.
=================================================

FAQ.
Display FAQS.
User Setting doc mentions about making FAQ title is displayed but bot is hidden which would otherwise lead to element's help page.
Keyboard shortcuts ( display allowable keyboard)
No change has been made for default behavior as by default keyboard shortcuts are displayed.
Technically KeyboardShortcuts file in javascript toggles display of modal on the screen displaying what keys are allowed/disallowed. Should there be a requirements in future to control which shortcuts are allowed/disallowed specifically , change is would be possible but not part of this user story.
Versions
Version.
OLM version ( i.e. hide option for OLM version)
Default behavior was to show OLM version. Its been hidden using ShowSimplifiedVersionInformation which can toggle the version information show/hide based on value we pass in from config.
Check for update ( i.e. hide option for check for update)
Check for update option has been hidden with ShowSimpliefiedVersionInformation flag.
Legal

Legal information comes from providing external links url in config file into terms_and_conditions_links in json config field. It takes url input to show external links and text input to display external link which corresponds to text.
Privacy at the moment defaults to act government privacy page - https://www.act.gov.au/privacy.
Credit at the moment takes user to act government privacy page
Third-party notices did not need code changes as no references were found to say third party notice.
Cookie policy has been hidden as per user story requirement.
Terms and Condition at the moment lead's to act government privacy page as well.
Urls for setting above are configurable values so can be easily changed.

Advanced(not visible).
Keep media - not available anymore by default maybe discontinued by matrix over time.
Clear media cache is controlled by ShowAdvancedAboutInformation flag which also hides homeserver, identity server and access token detail not been mentioned in this user story anywhere and were available in web.
Clear cache.
Mark all messages as read - This option is not available in help setting.
Credit.
By default credit info credits authors of font, emoji at the moment. Credit information is already on screen and set to default. There is no copyright info to refer to at this stage.

Feature: 219810
Web: As an User, I need the application to display the correct branding, so that I am confident that I am in the correct Application.
============================================================================================
Feature: 219811
Web: As an User, I need the application to display the correct branding, so that I am confident that I am in the correct Application.
============================================================================================
Technical Implementation:
Logo for Lingo was found to be dark blue with white background in android and iOS, therefore same logo has been used in web as well for consistency.
Lingo logo was found to be png images dark theme from android and iOS. I will just use same image for web.
It was interesting to to find lingo logos for iOS for Android were hardcoded into following directories.
iOS Lingo Location
pegacorn-communicate-app-ios\Riot\Assets\Images.xcassets\lingo_logo_dark.imageset
Android Lingo location:
pegacorn-communicate-app-android\vector\src\act\res\drawable-xxhdpi\lingo_logo_dark.png
Lingo web location
Lingo web uses same logo with two filenames - element.svg and element-logo.svg so our Lingo logo needs to be renamed to avoid having to go to element-web codebase and change references. Changing file name is better than changing file reference in codebase. Therefore, this strategy has been applied for replacement of existing logo images from element to lingo by just renaming our logo to element.svg and element-logo.svg.
ACT government logo has also been used when user is authenticated at middle of page with Lingo logo for branding requirement. No additional styling was required for any of these image alignments.
Theme
Lingo uses light theme by default. In order to customise elment color codes into Lingo approved colors, change was required in some of color codes in _light.scss style file has been improved. Custom color for default color in Lingo comes from config value called custom_themes in our externalized config file. User story required accent color of app to be changed from 'green' which was default from element to lingo approved color. With concept that either white image with blue background or blue with white background for proper contrasting purpose, dark blue has been utilized.
Where do we store our logo image and style for theming
We did not want to store our private property (image, logo etc. in branding) to be stored into public opensource element repo, so logos and images are stored in following directories. During docker build process we mount images into docker image where default files described below are replaced.
Logo - aether-host-file\common\element-web\logos
Stylesheet (theme, customised style files) - aether-host-file\common\element-web\styles
Verify this login pop (Before sign in)
This option won't show up in single sign on by default from matrix implementation. For form based user login this needs to be skipped behind the scene before prompt displays. PerformSessionVerification flag has been used which sets the event to "Security_Complete" behind the scene and skips cross sign in verification prompt. Other value which can be used would be check for well-known client sending encryption enabled : false in response which has not been working due to fact that API path is translated to chs.local no matter if config value is changed in front end for otherwise. This needs to be investigated.
Review your session prompt
This prompt appears when user is already authenticated. ShowSecurityKeyBackupPrompt has been used to hide this prompt.
Remove the I trust server prompt screen
Its been implemented through homeserver.yaml config value.
Hide liberate your communication text
Its been hidden with custom config value ShowLiberateYourCommunicationText in our config.
ACT government logo
A secondary image has been used and read from config value logo_secondary.imgUrl. This uses standard ACT Govt Logo which is horizontal.
ACT government logo on pre login screen
Vertical ACT government logo has been used for this purpose. A config value cant be used for this as app-web is not query that setting in front end. Only on react sdk you can use config to retrieve that value. This one uses ACT gov logo that ends with _vertical keyword.

Feature: 221259
Web: Sign In Screen Lingo Re-Branding and Update
====================================================================================================

- Homeserver edit/selection on login screen is controlled by  element's default configuration value disable_custom_urls which when used makes homerserver text a read only text is displayed and `edit` option won't show up.
- Splash screen menu items `UIFeature.PasswordReset` and `UIFeature.Registration` were part of default matrix config values which has been set to true from our side to disable password reset and client's ability to create account and it will hide these two menu from splash screen.
- This feature introduces a new config `loginScreen` to hide phone number drop down menu, `homeserver name`, `i-information tag`, `footer-link`, `background-color`, `phone based authentication dropdown`. If the value is populated in array then its meant to control it can be used in `config-ts` to determine what needs to be hidden on login screen prompt. If this array is not used in config, then it has been well tested that default behavior of Matrix will return to normal i.e. ( all default options on login screen will reappear). This optional array flag will fit purpose of what to show/hide or tweak on login prompt UI as client side may not need many options on login screen as single sign on is the only solution in some clients' space, and phone based authentication, email, different levels, homeserver detail make a little sense to normal public users.
- At the moment matrix uses welcome screen for displaying information of brand on a page which appears prior to login (form based authentication page). Original intention of this from matrix/element.io page has been to allow client side to see information homepage in authenticated mode and let user click sign in and take user to another page but we do not have welcome page at the moment so we have wanted to skip welcome screen to page with login form. Matrix default login screen before form based login screen where user would see sign in button which then takes user to sign in form would be triggered was controlled by `welcome_page` routing configuration in codebase which has been turned off and instead we redirect user from welcome screen in authenticated page to form based login screen with configurable parameter. `auto_redirect_from_welcome_screen_to_login`. On hindsight, if `welcome.html` is replaced with another `html` file then default behavior of UI would have been to show another welcome page instead of login prompt screen that shows up before login form based page.
- The secondary vertical and horizontal logos use alt key description which comes from `logo_secondary` config value.
 which is configurable flag to control image description and we can change this description on config file as we want and this description would aid `WCAG` compliance on image description. This config centralizes all secondary logo  values such as `margin`, `height`, `logo url`, `logo description` etc. which are easily configurable and can be done through config changes in future.
 - Footer for unauthenticated content from matrix default has been turned off by using `showMatrixDefaultFooterLinks` flag which is also used for replacing copyright content of matrix with customized ones from clients.
 - Unauthenticated footer content is going to use customized communicate logo and text label which is private information so instead of hardcoding it , it has been configured from `footer` config value so now WCAG accessibility text for image and footer description won't be part of component even though image is referenced there. There is chance to configure all styles for footer logo, and text labels. Mostly idea of configuring style for anything in UI has been to minimize code changes and be able to change height of image used promptly.


194064
Web: As an Authenticated Practitioner, I should be able to Search the Role Directory, so that I can locate a Role and view their details
=========================================================================================================================================

# API config
- Directory related APIs are stored in config.json which externalizes all the urls we use throughout the time.
- Role directory can be viewed from homepage/landing page tile where a tile says "Search roles" or similar.
- The practitioner role comes from `/PractitionerRoles` api. Same would be the case of view detail of practitionerRole when a detail is clicked on search page
- Search a particular role search comes from `/PractitionerRoles/search?displayName={insert parameter}` api.
- Search functionality allows users to login and bring a list of roles in directory and underlying `API` that hangs these records on UI would be `PractionerRoles`. Once user starts typing without applying filters user would search `PractitionerRoles/search?term`.
- User story requires front end UI to display profile picture of practitioner which comes from avatar-url which cant be shown due to fact that we don't store any images at the database. This condition may change in future and we may need to come back and change avatar url point to user profile which contains user profile photo. At the moment mocked backend users/practitioner profile do not lead to any profile image , neither in homeserver or backend.
- Default `Avatar` letter initials has been changed from having one initial to first and last names initials to make it meaningful.
- Config parameters `role`, `people`, `service` have been introduced in order to align the text and apis in
role, service and people search in UI. `directory` config parameter would have all keys for directories. By default `roomDirectory` was the config parameter which contained servers details listed so in order to separate concern from roomDirectory which is not utilized for searching roles, people or services, new config parameter `directory` was introduced.
- `directory` config value contains `base_api` which is basePath for all directory api calls.
- `showRoleDirectory` config parameter has been introduced to display role directory tile on landing homepage which was not there by default. If no config value is passed in then it will default to not display search roles tile on homepage.
- `show_first_last_char_initials_on_avatar` config value has been introduced which is used to control whether or not to show first and last character in avatar, not having this config value set as true in config will default avatar character to initial letter that is found in user's username when user is logged in. A function has been written in `Avatar.ts` file which will show first and lastName initials if name corresponds to formats `firstname.lastname`, `firstname-lastname`, `firstname + space +lastname`, `firstname+comma+lastname`. This function can be extended to include other name formats. For single name avatar will display initial of one word.
- The search mechanism for `roles, people and services` we are going to use `InviteDialog.tsx` which is a dialog prompt to add users by searching in user directory. By default matrix points all api calls to `MatrixPeg.get..` apis which lead to user detail being unresolvable for role, people and service search at the moment as we want to get search working when api call is made to pegacorn communicate's backend. A separate condition which is triggered based on context has been used to switch search functionality between MatrixPeg to customized api. This value is not config item but other config values would control display of buttons which trigger role. `_searchIsOnRoleServicePeopleDir` function manages whether or not to send api calls to matrix or to redirect to our own.
- `show_favorite_icon_in_directory_search` flag has been introduced as config value in order to show favorite icon next to role search which was required in user story to identify whether a role is a favorite one in search history that user in past might have clicked.
- `search_all_roles` config value in api config contains api for searching all roles.
- `search_role_by_displayName` config value in api config contains api for searching role by displayName as key parameter.
- `numberOfRecordsToShowInSearch` parameter has been used to control how many roles, services, people to display as search list by default when search is triggered. Matrix had default of 3 searches suggestions to be listed which has been left to default by applying this config mentioned above which defaults search results to 25 at the moment.
- `X-Total-Count` gives total count results of how many records were found at database during search.
- Search on roles only displays if matching text has been found in displayName text during search.
- The filter options on this user story is limited to filter by name and filter by favorites. Favorite filter is a bit cloudy as this means we would have to go and filter the favorites by calling a different api that contains practitioner as user and find what favorites were there and if that favorite is listed in role list then that means a certain display name is a favorite.
- Matrix sorts given list of users by the time user was last active. This has been changed if directory search occurs for role, people and service then sort by name.
- `search_role_by_favorite` config parameter has been added to allow search favorite for currently logged in user. Favorite works by practitioner, role and services types so it means
- To create your own favorites, you need to do `PUT` request on `base-api + user-id + search-by-favorites-uri`. API needs to be aligned with role, people or services favorite. If favorarite is searched via practitioner role, it will bring favorites in organisation, service and roles.
- `UIFeature.identityServer` is a default user setting flag which controls whether or not to search user through matrix api which has been set to false in order to turn off search in matrix server. Not using this flag would result error appear on search window which would say "Identity Server has not been enabled...".
