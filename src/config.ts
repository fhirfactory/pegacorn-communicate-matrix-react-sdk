import SdkConfig from "./SdkConfig";

const config = SdkConfig.get();

/**
 * @param `loginScreen` is used to control Login Screen UI elements visiblity
 * for homeserver, footer links, phone number login drop down option  and login screen background colors. "loginScreen" screen
 * removed from config.json would lead to default matrix login screen with full options be available to users. Unwanted elements on
 * login UI can be hidden by querying items from array and properly checking as below for each UI element to be hidden or changed.
 */

const loginScreen = config['loginScreen'];

export const signInTextNeedsToBeReplaced = loginScreen?.find(x => x.includes(['changeSigninWithLoginTextLabel'])) ? true : false;

// background color on login screen
// used by app-web to load a colored background instead of lake image
export const loginScreenBackgroundColor = loginScreen?.find(x => x['loginScreenBackgroundColor']) || null;

// Sign in text - change to login
export const changeSigninWithLoginTextLabel = () => {
    console.log('change sign in text', signInTextNeedsToBeReplaced);
    if (signInTextNeedsToBeReplaced) {
        document.querySelector('label').innerHTML = document.querySelector('label').innerHTML.replace(/Sign in/g, "Log in");
        document.querySelector('input').innerHTML = document.querySelector('input').innerHTML.replace(/Sign in/g, "Log in");
        document.querySelector('h2').innerHTML = document.querySelector('h2').innerHTML.replace(/Sign in/g, "Log in");
    }
}

//Phone based authentication drop down menu
export const allowPhoneBasedAuthentication = loginScreen?.find(x => x.includes(['allowPhoneBasedAuthentication'])) ? false : true;

// Homeserver
export const showHomeServerDetail = loginScreen?.find(x => x.includes(['showHomeServerInfoOnLoginScreen'])) ? false : true;

// Default footer links
export const showDefaultFooterLinks = loginScreen?.find(x => x.includes(['showMatrixDefaultFooterLinks'])) ? false : true;
