/**
 * This utility function converts email into a valid name and it is used by directory to
 * display who is fulfilling roles. This can be used elsewhere where use case requires converting
 * email to name.
 * @param {string} name
*/

export function getNameFromEmail(email: string): string {
    // checks email addresses and splits first and last names accordingly
    if (!email || (email === undefined) || (email.indexOf('@') === -1)) return null;
    if (email[0] === '@') {  // remove @ initial (valid in matrix id)
        email = email.substring(1);
    }
    let firstName = email.split('.')[0];
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    let lastName;
    // non matrix id may have email address format firstname.lastName@email.com so split that accordingly
    if (email.includes('@')) {
        lastName = email.split('@')[0].split('.').pop();
        // matrix id has ':' in middle of address, so just use that to split and format names
    } else if (email.includes(':')) {
        lastName = email.split(':')[0].split('.').pop();
    }
    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    const fullName = firstName + " " + lastName;
    return fullName;
}
