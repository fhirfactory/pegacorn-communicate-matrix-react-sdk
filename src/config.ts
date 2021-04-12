import SdkConfig from "./SdkConfig";

const config = SdkConfig.get();

const hiddenLoginScreenMenuItem = config['hiddenLoginScreenMenuItem'];

export const signInTextNeedsToBeReplaced = hiddenLoginScreenMenuItem?.find(x => x.includes(['changeSigninWithLoginTextLabel'])) ? true: false;

// background color on login screen
// used by app-web to load a colored background instead of lake image
export const loginScreenBackgroundColor = hiddenLoginScreenMenuItem?.find(x => x['loginScreenBackgroundColor']) || null;

// Sign in text - change to login
export const changeSigninWithLoginTextLabel = () => {
    console.log('change sign in text', signInTextNeedsToBeReplaced);
    if (signInTextNeedsToBeReplaced) {
        document.querySelector('label').innerHTML = document.querySelector('label').innerHTML.replace(/Sign in/g, "Log in");
        document.querySelector('input').innerHTML = document.querySelector('input').innerHTML.replace(/Sign in/g, "Log in");
        document.querySelector('h2').innerHTML = document.querySelector('h2').innerHTML.replace(/Sign in/g, "Log in");
     //   document.querySelector('form').innerHTML = document.querySelector('.mx_SSOButtons').innerHTML.replace(/Sign in/g, "Log in");
    }
}

//Phone based authentication drop down menu
export const allowPhoneBasedAuthentication = hiddenLoginScreenMenuItem?.find(x => x.includes(['allowPhoneBasedAuthentication'])) ? false: true;

// Homeserver
export const showHomeServerDetail = hiddenLoginScreenMenuItem?.find(x => x.includes(['showHomeServerInfoOnLoginScreen'])) ? false: true;

// Default footer links
export const showDefaultFooterLinks = hiddenLoginScreenMenuItem?.find(x => x.includes(['showMatrixDefaultFooterLinks'])) ? false: true;
