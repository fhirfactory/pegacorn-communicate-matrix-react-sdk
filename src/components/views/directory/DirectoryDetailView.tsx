import React, { Component } from "react";
import * as PropTypes from 'prop-types';
import * as sdk from "../../../index";
import { _t } from '../../../languageHandler';
import { getFormattedRoleIds, replaceSpecialCharacter } from "../../../utils/formatKeyValueUtil";
import { getFormattedPhoneNumberAndType } from "../../../utils/formatPhoneNumberUtil";
import { getNameFromEmail } from "../../../utils/formatEmailUtil";
import { getTextLabelFromEnum } from "../../../utils/directory-enums";
import * as directoryService from '../../../DirectoryService';
import { formatFullDate } from "../../../DateUtils";
import { getKeyPairFromComplexObject } from "../../../utils/objectToArrayUtils";
import { isEmpty } from "lodash";

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

interface IProps {
    simplifiedID?: string;
    identifiers?: [
        value?: string,
        leafValue?: string
    ];
    displayName?: string;
    queryId?: string;
    favorite?: boolean;
    description?: string;
    primaryOrganizationID?: string;
    primaryRoleCategoryID?: string;
    primaryLocationID?: string;
    primaryRoleID?: string;
    organization?: string;
    specialty?: string;
    location?: string;
    contactPoints?: [
        value?: string,
        type?: string,
        use?: string,
    ];
    directorySearchContext?: string;
    // person directory specific values
    organizationMembership?: string;
    dateTimeLastRoleSelected?: string;
    practitionerStatus?: string;
    currentPractitionerRoles?: [
        role: string,
        roleCategory: string
    ];
    officialName: {
        period?: {
            startDate?: string;
            endDate?: string;
        }
    }
    // organization specific values
    organizationType?: {
        typeValue: string;
        typeDisplayValue: string;
    };
    organisationStructure: [];
    parentOrganization?: string;
    containedOrganizations?: [];
    containedLocationIDs?: string[];
}

interface IState {
    showUserRoleTable: boolean;
    entries: IProps[];
    error: any;
    activeRoleDisplayNames: string[];
    personDirectoryActiveRoles: [];
    loading: boolean;
    isFavorite: boolean;
    searchQuery: string;
    displayName: string;
    primaryRoleCategoryID: string;
}

/***
 * This view would display detailed view of selected role by shortName, but can be changed to view by longName or something else as well if need it be.
 */

export default class DirectoryDetailView extends Component<IProps, IState> {

    static propTypes = {
        simplifiedID: PropTypes.string,
        primaryOrganizationID: PropTypes.string,
        primaryRoleCategoryID: PropTypes.string,
        primaryLocationID: PropTypes.string,
        primaryRoleID: PropTypes.string,
        identifiers: PropTypes.array,
        location: PropTypes.string,
        queryId: PropTypes.string,
        description: PropTypes.string,
        contactPoints: PropTypes.array,
        directorySearchContext: PropTypes.string,
        period: PropTypes.string,
        parentOrganization: PropTypes.string,
        containedOrganization: PropTypes.array,
        organizationMembership: PropTypes.string,
        organizationType: PropTypes.any,
        dateTimeLastRoleSelected: PropTypes.string,
        practitionerStatus: PropTypes.string,
        currentPractitionerRoles: PropTypes.array,
        favorite: PropTypes.bool,
        containedLocationIDs: PropTypes.array,
        organisationStructure: PropTypes.array
    };

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            showUserRoleTable: false,
            entries: [],
            activeRoleDisplayNames: [],
            personDirectoryActiveRoles: [],
            primaryRoleCategoryID: null,
            error: null,
            loading: true,
            isFavorite: false,
            searchQuery: '',
            displayName: null
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            return this.getRoleDetail();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getRoleDetail() {
        const uniqueId = this.props.queryId;
        const searchContext = this.props.directorySearchContext;

        directoryService.getRolePersonServiceDetail(searchContext, uniqueId)
            .then(response => {
                if (!response.errorText) {
                    if (!this._isMounted) return null;
                    this.setState({
                        entries: response.entries,
                        showUserRoleTable: true,
                        loading: false,
                        activeRoleDisplayNames: response.activeRoleDisplayNames,
                        personDirectoryActiveRoles: response.currentPractitionerRoles
                    });
                } else {
                    this.setState({
                        error: response.errorText,
                        loading: false
                    });
                }
            });
    }

    getDisplayNameFromAPI(emailId: string): string {
        const promise = directoryService.getPractionerDisplayName(emailId);
        if (!promise) return null;
        promise
            .then(response => {
                if (!response.errorText) {
                    this.setState({
                        displayName: response.displayName
                    });
                } else {
                    this.setState(response);
                }
            });
        let fullName = this.state.displayName;
        return fullName;
    }

    getFormattedTextForIds(id: string, headerElement) {
        if (id == undefined || id == null) {
            return id;
        } else {
            id = headerElement[headerElement.indexOf(id)];
            return getFormattedRoleIds(id);
        }
    }

    // render phone number text with types ( Cellphone or Extension)
    _renderPhoneNumbers(contactPoints) {
        if (contactPoints == undefined || contactPoints == null || contactPoints.length < 1) {
            return 'Not Provided';
        }
        let contacts = getFormattedPhoneNumberAndType(contactPoints);
        return contacts.map((value, index) => {
            let phoneType = getTextLabelFromEnum(value.phoneType);
            return value ? (<div style={{ margin: '5px 0' }} key={index}>{phoneType} : {value.phoneNumber}</div>) : null;
        })
    }

    // avatar for who is fulfilling the given role
    _renderAvatar(name: string) {
        const BaseAvatar = sdk.getComponent("views.avatars.BaseAvatar");
        return <BaseAvatar
            className='mx_InviteDialog_userTile_avatar'
            url={null}
            name={name}
            idName={name}
            width={36}
            height={36} />;
    }

    _renderDetailCaption(kind) {
        let headerText;
        if (kind === directoryService.KIND_ROLE_DIRECTORY_SEARCH) {
            headerText = <h2>Practitioner Registered Role Detail</h2>
        } else if (kind === directoryService.KIND_PEOPLE_DIRECTORY_SEARCH) {
            headerText = <h2>Practitioner Registered Detail</h2>
        } else if (kind === directoryService.KIND_SERVICE_DIRECTORY_SEARCH) {
            headerText = <h2>Registered Service Detail</h2>
        }
        return headerText;
    }

    _renderDirectoryDetailView = () => {
        return this.state.entries.map((entry, index) => {
            let headerElement = Object.keys(this.state.entries[0]);
            let {
                primaryRoleCategoryID, primaryRoleID, primaryLocationID,
                primaryOrganizationID, displayName, description, contactPoints,
                dateTimeLastRoleSelected, currentPractitionerRoles,
                organizationType, organizationMembership, containedOrganizations,
                containedLocationIDs, organisationStructure
            } = entry //destructuring the entry object/array

            let membershipDetail;
            if (organizationMembership) {
                membershipDetail = getKeyPairFromComplexObject(organizationMembership, "value") || getKeyPairFromComplexObject(organizationMembership, "leafValue");
            }

            return <div key={index}>
                <table className="mx_DirectoryDetailView_table" tabIndex={0}>
                    <caption>
                        {this._renderDetailCaption(this.props.directorySearchContext)}
                    </caption>
                    <tbody>
                        {displayName && <tr><th>{this.getFormattedTextForIds("displayName", headerElement)}</th><td>{displayName}</td></tr>}
                        {primaryRoleCategoryID && <tr><th>{this.getFormattedTextForIds("primaryRoleCategoryID", headerElement)}</th><td>{primaryRoleCategoryID}</td></tr>}
                        {primaryRoleCategoryID && <tr><th>{this.getFormattedTextForIds("primaryOrganizationID", headerElement)}</th><td>{primaryOrganizationID}</td></tr>}
                        {primaryRoleID && <tr><th>{this.getFormattedTextForIds("primaryRoleID", headerElement)}</th><td>{primaryRoleID}</td></tr>}
                        {description && <tr><th>{this.getFormattedTextForIds("description", headerElement)}</th><td>{description}</td></tr>}
                        {primaryLocationID && <tr><th>{this.getFormattedTextForIds("primaryLocationID", headerElement)}</th><td>{getFormattedRoleIds(primaryLocationID)}</td></tr>}
                        {containedOrganizations && <tr>
                            <th>{this.getFormattedTextForIds("containedOrganizations", headerElement)}</th>
                            <td>{containedOrganizations.map((orgName: string) => {
                                return <span key={index}>{orgName}</span>
                            })}
                            </td>
                        </tr>}
                    </tbody>
                    {currentPractitionerRoles ?
                        <tbody>
                            <tr>
                                <th>Currently Active Role(s)</th>
                                <td>
                                    {(currentPractitionerRoles.map((role: string, index) => {
                                        return <p key={index} style={{ display: 'table-cell', padding: '2px' }}>{(index ? ', ' : '') + role["displayName"] || role["simplifiedID"]}</p>
                                    }))}
                                </td>
                            </tr>
                        </tbody> : null
                    }
                    {dateTimeLastRoleSelected &&
                        <tbody><tr><th>Last Active On Role</th><td>{formatFullDate(new Date(dateTimeLastRoleSelected))}</td></tr></tbody>}
                    {containedLocationIDs ?
                        <tbody>
                            <tr>
                                <th>Service Location</th>
                                <td>
                                    {containedLocationIDs?.map((location, index) => {
                                        return <span key={index}>{isEmpty(location) ? location : 'Not Available'}</span>
                                    })
                                    }
                                </td>
                            </tr>
                        </tbody> : null
                    }
                    {organizationType &&
                        <tbody>
                            <tr>
                                <th>Organization Type</th><td>{organizationType.typeDisplayValue}</td>
                            </tr>
                        </tbody>
                    }
                    {(!!membershipDetail) ?
                        <tbody>
                            <tr>
                                <th>Organization Membership(s)</th>
                                <td>
                                    <table className="mx_DirectoryDetailView_table">
                                        <tbody>
                                            {
                                                membershipDetail.map((member, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <th>Name</th>
                                                            <td>{member.name}</td>
                                                            <th>Description</th>
                                                            <td>{member.description}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody> : null
                    }
                    {organisationStructure &&
                        <tbody>
                            <tr>
                                <th>Organisation Unit</th>
                                <td>
                                    <table className="mx_DirectoryDetailView_table">
                                        <tbody>
                                            {
                                                organisationStructure.map((hierarchy, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <th>{replaceSpecialCharacter(hierarchy["type"])}</th>
                                                            <td>{hierarchy["value"]}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    }
                    {contactPoints &&
                        <tbody>
                            <tr>
                                <th>{this.getFormattedTextForIds("contactPoints", headerElement)}</th>
                                <td>{this._renderPhoneNumbers(contactPoints)}</td>
                            </tr>
                        </tbody>
                    }
                </table>
            </div>
        })
    }

    // Shows what roles are currently being fulfilled by user (only applies to role directory )
    _renderRoleDirectoryHeader = () => {
        if (!this.state.activeRoleDisplayNames) return null;
        let users = this.state.activeRoleDisplayNames;
        if ((users?.length < 1) || !Array.isArray(users)) return null;
        return <div className="mx_DirectoryDetailView_fulfilledBy">
            <h3>Role Fulfilled By</h3>
            {users.map((value, index) => {
                let name = value.indexOf('@') !== -1 ? getNameFromEmail(value) : value;
                return name && <span className="mx_DirectoryDetailView_fulfilledBy_user" key={index}>
                    <li>{this._renderAvatar(name)}</li>
                    <li>{name}</li>
                </span>
            })}
        </div>
    }

    // Shows what roles a person is fulfilling at given point of time (only applies to person directory)
    _renderPersonDirectoryHeader = () => {
        let roleCategories = this.state.personDirectoryActiveRoles;
        if ((!Array.isArray(roleCategories) || roleCategories?.length < 1)) return null;
        return <div className="mx_DirectoryDetailView_fulfilledBy">
            <h3>Practitioner is fulfilling following role(s)</h3>
            {roleCategories.map((roles, index) => {
                return roles && <span className="mx_DirectoryDetailView_fulfilledBy_user" key={index}>
                    <li>{this._renderAvatar(roles["primaryRoleCategoryID"])}</li>
                    <li>{roles["displayName"]}</li>
                </span>
            })}
        </div>
    }

    render() {
        const Spinner = sdk.getComponent("elements.Spinner");
        if (this.state.loading) return <Spinner w={22} h={22} />;
        if (this.state.error) {
            console.error("An unexpected error occurred in DirectoryDetailView ", this.state.error);
            return <div style={{ color: 'red' }}>
                <p>{_t("There was a problem communicating with the server. Please try again.")}</p>
            </div>
        }
        return <React.Fragment>
            {this._renderRoleDirectoryHeader()}
            {this._renderPersonDirectoryHeader()}
            {this._renderDirectoryDetailView()}
        </React.Fragment>
    }
}
