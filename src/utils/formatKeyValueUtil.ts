import { getTextLabelFromEnum } from "./directory-enums";

/**
 * A utility function that formats given key and
 * This will calculate value for passed in key
 * If key is not found then it will capitalize first letter
 */

// and return rest of key with appropriately where appropriate
export function getFormattedRoleIds(key) {
    if (key == undefined || key == null) {
        return key;
    }
    //if values are listed in enum format from there first
    const formattedValuesWithEnums = getTextLabelFromEnum(key);
    // if role ids are not listed in enums format using followings.
    const formattedValues = () => {
        key = key.charAt(0).toUpperCase() + key.slice(1); // turn first letter to capital
        key = key.replace(/([A-Z]+)/g, ",$1").replace(/^,/, "");
        return key.split(',').join(' ');
    }
    const finalFormattedValues = formattedValuesWithEnums || formattedValues();
    return finalFormattedValues;
}