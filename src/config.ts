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

/**
 * Authenticated homepage directory ui flow
 * 'explore public room options' can be switched off
 * and many more tiles on homepage for users to click and
 * navigate to.
 */

// get directory config
export const directory = config['directory'];

// turn off explore public room
export const showExplorePublicRooms = config.roomDirectory?.showExplorePublicRooms ?? true;

// matrix default server selection dropdown
export const showPublicRoomServerSelectionDropdown = config.roomDirectory?.showExplorePublicRoomServerSelectionDropdown ?? true;

// At the bottom of the left hand navigation panel, specify directory related help text (which is always shown), instead of normal 
// conditionally shown text
export const left_hand_nav_help_text: string = config.left_hand_nav_help_text;

/***
 *  role directory config list
 */
export const role_directory = directory?.role;

export const showRoleDirectory = role_directory.showRoleDirectory ?? false;

export const role_directory_feature_name = role_directory?.name;

export const role_directory_description = role_directory?.feature_description;

export const role_directory_placeholder = role_directory?.placeholder;

export const showAdvancedDirectorySearchDropdown = role_directory?.showAdvancedDirectorySearchDropdown ?? false;


/***
 *  service directory config list
 */
export const numberOfRecordsToShowInSearch = directory?.numberOfRecordsToShowInSearch ?? null;

// show favorite icon in directory search
export const show_favorite_icon_in_directory_search = directory?.show_favorite_icon_in_directory_search ?? false;

export const showServiceDirectory = directory?.showServiceDirectory ?? false;

export const service_directory = directory?.service;

export const service_directory_name = directory?.name;

/**
 * people's directory config list
*/
export const people_directory = directory?.people;

// APIs

// base api
export const communicate_api_base_path = directory?.api.base_path;

// prefix
export const prefix = directory?.api.prefix;

// search all roles
export const search_all_roles = communicate_api_base_path + directory?.api?.search_all_roles;

// search roles by a short name
export const search_role_by_displayName = communicate_api_base_path + directory.api.search_role_by_displayName;

// api to filter by favorites;
export const search_by_favorite = directory.api.favourites;


/**
 * Avatar
 */
export const showFirstLastNameIntialsOnAvatarBackground = config.show_first_last_char_initials_on_avatar ?? false;

export const avatarColors = config.avatarColors;

/**
 * Sort alphabetically (currently applied by directory feature but in future it can be applied to many other features)
 */
export const sortAlphabeticallyInAscendingOrder = config.sort_directory_view_alphabetically;
