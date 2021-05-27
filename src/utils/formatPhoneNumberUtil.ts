/**
 * A utility function that converts an string containing pair value into array
 * This function changes given phone number text and initial text label into proper format with
 * phone number types such as : Landline or Phone or extension types
 */

// returns 'Landline' or 'mobile' number with correct text which can be presentable.
export function getFormattedPhoneNumberAndType(value) {
    if (value == undefined || value == null) {
        return value;
    }
    const phoneNumber = value.map((value) => {
        let newPhoneNumber = new Array(value);
        // Formats given text into properly formatted landline and mobile numbers
        let phoneNumberType = newPhoneNumber.map((value) => value.type);
        //find actual phone number digit
        let phoneNumber = '';
        // Office/work phone number is formatted further in (02) xxxxx format landline
        // if 02 is found in initial of phone number text
        // Mobile phone number that starts with 04 is formatted with proper spaces
        // if not already formatted
        newPhoneNumber.map((phoneNum) => {
            let phoneNumberUnformatted = phoneNum.value;
            if (phoneNumberUnformatted.startsWith('04') && !phoneNumberUnformatted.includes(' ')) {
                phoneNumber = phoneNumberUnformatted.slice(0, 4) + ' ' + phoneNumberUnformatted.slice(4, 6) + ' ' + phoneNumberUnformatted.slice(6);
            } if (phoneNumberUnformatted.charAt(1).includes('2')) {
                phoneNumber = "(" + phoneNumberUnformatted.slice(0, 2) + ") " + phoneNumberUnformatted.slice(2);
            }
            else {
                phoneNumber = phoneNum.value;
            }
        });
        const phoneFormat = phoneNumberType.toString().toLowerCase();
        let finalPhoneNumbers = new Object({
            "phoneType": phoneFormat,
            "phoneNumber": phoneNumber
        })
        return finalPhoneNumbers;
    });

    return phoneNumber;
}
