export enum DirectoryEnum {
    simplifiedID = "Simplified ID",
    description = "Description",
    primaryOrganizationID = "Organization ID",
    primaryLocationID = "Location",
    primaryRoleCategoryID = "Role Category ID",
    primaryRoleID = "Primary Role ID",
    practitionerRoleADGroup = "Practitioner Role ADGroup",
    contactPoints = "Contact",
    CH = "Canberra Hospital"
}

export const getRoleEnumValues = (value) => {
    const key = DirectoryEnum[value];
    if (key) {
        return key;
    } else {
        return undefined;
    }
}
