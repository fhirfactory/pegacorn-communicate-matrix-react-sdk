export enum DirectoryEnum {
    simplifiedID = "Simplified ID",
    description = "Description",
    primaryOrganizationID = "Organization ID",
    primaryLocationID = "Location",
    primaryRoleCategoryID = "Role Category ID",
    primaryRoleID = "Primary Role ID",
    practitionerRoleADGroup = "Practitioner Role ADGroup",
    contactPoints = "Contact",
    CH = "Canberra Hospital",
    pabx_extension = "Office Phone",
    personal_phone = "Personal Mobile Number",
    landline = "Personal Phone Number",
    mobile = "Mobile Phone",
    facsimile = "Fax",
    pager = "Pager"
}

export const getTextLabelFromEnum = (value) => {
    const key = DirectoryEnum[value];
    if (key) {
        return key;
    } else {
        return undefined;
    }
}
