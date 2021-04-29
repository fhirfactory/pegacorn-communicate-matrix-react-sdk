import SdkConfig from "./SdkConfig";

const config = SdkConfig.get();

/**
 * @param `loginScreen` is used to control Login Screen UI elements visiblity
 * for homeserver, footer links, phone number login drop down option  and login screen background colors. "loginScreen" screen
 * removed from config.json would lead to default matrix login screen with full options be available to users. Unwanted elements on
 * login UI can be hidden by querying items from array and properly checking as below for each UI element to be hidden or changed.
 */

const loginScreen = config['loginScreen'];

const authenticatedHomeScreen = config['authenticatedHomeScreen'];

const logoConfig = config['logo'];

// As the config values are booleans, we use the
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator (??)
// to safely provide a default boolean value to optional config values that provide boolean values.
// We also use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining (?.) to handle if the config
// hierarchy doesn't exist
export const signInTextNeedsToBeReplaced = loginScreen?.changeSigninToLoginTextLabel ?? false;

// background color on login screen
// used by app-web to load a colored background instead of lake image
export const showLoginScreenBackgroundImage = loginScreen?.showLoginScreenBackgroundImage ?? null;

// Sign in text - change to login
export const changeSigninWithLoginTextLabel = () => {
    console.log('change sign in text', signInTextNeedsToBeReplaced);
    if (signInTextNeedsToBeReplaced) {
        document.querySelector('label').innerHTML = document.querySelector('label').innerHTML.replace(/Sign in/g, "Log in");
        document.querySelector('input').innerHTML = document.querySelector('input').innerHTML.replace(/Sign in/g, "Log in");
        document.querySelector('h2').innerHTML = document.querySelector('h2').innerHTML.replace(/Sign in/g, "Log in");
    }
}

//Email based authentication drop down menu
export const allowEmailBasedAuthentication = loginScreen?.allowEmailBasedAuthentication ?? true;

//Phone based authentication drop down menu
export const allowPhoneBasedAuthentication = loginScreen?.allowPhoneBasedAuthentication ?? true;

// Homeserver
export const showHomeServerDetail = loginScreen?.showHomeServerInfo ?? true;

// Default footer links
export const showDefaultFooterLinks = loginScreen?.showMatrixDefaultFooterLinks ?? true;

// show/hide liberate your communication text
export const showLiberateYourCommunicationText = authenticatedHomeScreen?.showLiberateYourCommunicationText ?? true;

//show/hide welcome to {brand} text
export const showWelcomeToElementText = authenticatedHomeScreen?.showWelcomeToElementText ?? true;

// show primary logo on logged in screen
// Due to positioning and etc this switch would make it easy to have that logo configured.
// it is to control logo that element provides
export const showPrimaryLogoOnLoginScreen = logoConfig?.showPrimaryLogoOnLoginScreen ?? true;

//show secondary logo after login screen
//it is to control your own secondary logo that you provide inside logged in screen
//it can also control footer logo as well if one has been used or needs to be used.
export const showPrimaryLogoInAuthenticatedScreen = logoConfig?.showPrimaryLogoInAuthenticatedScreen ?? true;

//show secondary logo
export const showSecondaryLogoOnLogOnScreen = logoConfig?.showSecondaryLogoInLoginScreen ?? false; // default should be false

//show primary logo on login screen
// Used by loggedin view
export const showSecondaryLogoInAuthenticatedScreen = logoConfig?.showSecondaryLogoInAuthenticatedScreen ?? false; // default should be false

//find logo secondary
export const logoSecondary = logoConfig?.logo_secondary ?? null;


// tab condition
export const tabbedView =config['tabbedView'];
export const tabbedViewdisplaySecondaryLogo  = tabbedView?.displaySecondaryLogo ?? false; 
