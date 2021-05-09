import SdkConfig from "./SdkConfig";

const config = SdkConfig.get();

/**
 * @param `loginScreen` is used to control Login Screen UI elements visiblity
 * for homeserver, footer links, phone number login drop down option  and login screen background colors. "loginScreen" screen
 * removed from config.json would lead to default matrix login screen with full options be available to users. Unwanted elements on
 * login UI can be hidden by querying items from array and properly checking as below for each UI element to be hidden or changed.
 */

const loginScreen = config['loginScreen'];

// As the config values are booleans, we use the
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator (??)
// to safely provide a default boolean value to optional config values that provide boolean values.
// We also use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining (?.) to handle if the config
// hierarchy doesn't exist
export const signInTextNeedsToBeReplaced = loginScreen?.changeSigninToLoginTextLabel ?? false;

// background color on login screen
// used by app-web to load a colored background instead of lake image
export const loginScreenBackgroundColor = loginScreen?.backgroundColor ?? null;

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


/**
 * Authenticated homepage directory ui flow
 * 'explore public room options' can be switched off
 * and many more tiles on homepage for users to click and
 * navigate to.
 */

// get directory config
export const directory = config['directory'];

// turn off explore public room
export const showExplorePublicRoom = directory?.showExplorePublicRoomTile ?? false;

// matrix default server selection dropdown
export const showPublicRoomServerSelectionDropdown = directory?.explorePublicRoomServerSelectionDropdown ?? true;

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
export const api_base_path = directory?.api.base_path;

// search all roles
export const search_all_roles = api_base_path + directory?.api?.search_all_roles;

// search roles by a short name
export const search_role_by_displayName = api_base_path + directory.api.search_role_by_displayName;

// api to filter by favorites;
export const search_by_favorite = directory.api.favourites;


/**
 * Avatar
 */
export const showFirstLastNameIntialsOnAvatarBackground = config.show_first_last_char_initials_on_avatar ?? false;

/**
 * Avatar color
 */
export const avatarColors = config.avatarColors;

/**
 * Sort alphabetically (currently applied by directory feature but in future it can be applied to many other features)
 */
export const sortAlphabeticallyInAscendingOrder = config.sort_directory_view_alphabetically;
