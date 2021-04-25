import _ from "lodash";

export enum DirectoryEnum {
    simplifiedID = "Simplified ID",
    displayName = "Description",
    primaryOrganizationID = "Organization ID",
    primaryLocationID = "Location",
    primaryRoleCategoryID = "Role Category ID",
    primaryRoleID = "Primary Role ID",
    practitionerRoleADGroup = "Practitioner Role ADGroup",
    contactPoints = "Contact",
    ch ="Canberra Hospital"
}

export const getRoleEnumValues = (values) => {
    const newValue = Object.entries(DirectoryEnum);
    let key = String(values);
    console.log("formatted enum values:", newValue);
    console.log("key to be searched is", key);
    console.log("formatted role ids:", values);
    for (let newValue in DirectoryEnum) {
        key = newValue[key];
        if (key) {
            return key;
        } else {
            return null;
        }
    }
}
