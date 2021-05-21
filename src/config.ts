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

// As the config values are booleans, we use the
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator (??)
// to safely provide a default boolean value to optional config values that provide boolean values.
// We also use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining (?.) to handle if the config
// hierarchy doesn't exist
export const changeSigninToLoginTextLabel = loginScreen?.changeSigninToLoginTextLabel ?? false;

export const updateDocumentForSelector = (selector) => {
	let object = document.querySelector(selector);
	if (object !== null) {
		object.innerHTML = object.innerHTML.replace(/Sign in/g, "Log in");
		if (object.value) {
			object.value = object.value.replace(/Sign in/g, "Log in");
		}
	}
}

export const updateTerminologyInDocument = () => {
    console.log('change sign in text', changeSigninToLoginTextLabel);
    if (changeSigninToLoginTextLabel) {
        updateDocumentForSelector('h2');
        updateDocumentForSelector('.mx_Login_type_label');
        updateDocumentForSelector('.mx_Login_submit');
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

// tab condition
export const tabbedView = config['tabbedView'];
export const tabbedViewShowSecondaryLogo  = tabbedView?.showSecondaryLogo ?? false;
export const tabbedViewSecondaryLogoUrl =  tabbedView?.secondaryLogoUrl;
export const tabbedViewSecondaryLogoAltText =  tabbedView?.secondaryLogoAltText;

