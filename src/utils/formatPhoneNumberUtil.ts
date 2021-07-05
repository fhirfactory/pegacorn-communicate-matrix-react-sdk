/**
 * A utility function that converts an array of objects with type and value string properties
 * into an array of objects with formatted phoneType and phoneNumber string properties
 */

// returns 'Landline' or 'mobile' number with correct text which can be presentable.
export function getFormattedPhoneNumberAndType(contactPoints) {
    if (contactPoints == undefined || contactPoints == null) {
        return contactPoints;
    }
    const result = contactPoints.map((contactPoint) => {
        // Formats given text into properly formatted landline and mobile numbers
        // Office/work phone number is formatted further in (02) xxxxx format landline
        // if 02 is found in initial of phone number text
        // Mobile phone number that starts with 04 is formatted with proper spaces
        // if not already formatted
        let phoneNumber = contactPoint.value;
        if (phoneNumber.startsWith('04') && !phoneNumber.includes(' ')) {
            phoneNumber = phoneNumber.slice(0,4) + " " + phoneNumber.slice(4, 7) + " " + phoneNumber.slice(7);
        } else if (phoneNumber.charAt(1).includes('2')) {
            phoneNumber = "(" + phoneNumber.slice(0, 2) + ") " + phoneNumber.slice(2);
        }
        const phoneFormat = contactPoint.type.toString().toLowerCase();
        let formattedPhoneNumberAndType = new Object({
            "phoneType": phoneFormat,
            "displayName": contactPoint.displayName,
            "phoneNumber": phoneNumber
        })
        return formattedPhoneNumberAndType;
    });

    return result;
}
