import SdkConfig from "./SdkConfig";

const config = SdkConfig.get();

const hiddenSplashScreenMenuItem = config['hiddenSplashScreenMenuItem'];

export const signInTextNeedsToBeReplaced = hiddenSplashScreenMenuItem?.find(x => x.includes(['changeSigninWithLoginTextLabel'])) ? true: false;

// background color on login screen
// used by app-web to load a colored background instead of lake image
export const splashScreenBackgroundColor = hiddenSplashScreenMenuItem?.find(x => x['splashScreenBackgroundColor']) || null;

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
export const allowPhoneBasedAuthentication = hiddenSplashScreenMenuItem?.find(x => x.includes(['allowPhoneBasedAuthentication'])) ? false: true;

// Homeserver
export const showHomeServerDetail = hiddenSplashScreenMenuItem?.find(x => x.includes(['showHomeServerInfoOnSplashScreen'])) ? false: true;

// Default footer links
export const showDefaultFooterLinks = hiddenSplashScreenMenuItem?.find(x => x.includes(['showMatrixDefaultFooterLinks'])) ? false: true;
