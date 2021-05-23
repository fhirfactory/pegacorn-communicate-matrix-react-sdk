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
        // Phone number is formatted further in (02) xxxxx format if 02 is found in initial of phone number text
        newPhoneNumber.map((phoneNum) => {
            let phoneNumberUnformatted = phoneNum.value;
            if (phoneNumberUnformatted.charAt(1).includes('2')) {
                phoneNumber = "(" + phoneNumberUnformatted.slice(0, 2) + ") " + phoneNumberUnformatted.slice(2);
            } else {
                phoneNumber = phoneNum.value;
            }
        });
        const phoneFormat = phoneNumberType.toString().charAt(0).toUpperCase() + phoneNumberType.toString().slice(1).toLowerCase();
        let finalPhoneNumbers = new Object({
            "phoneType": phoneFormat,
            "phoneNum": phoneNumber
        })

        return finalPhoneNumbers;
    });

    return phoneNumber;
}
