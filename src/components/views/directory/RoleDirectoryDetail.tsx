import React, { Component } from "react";
import * as PropTypes from 'prop-types';
import * as sdk from "../../../index";
import * as config from "../../../config";
import { getFormattedRoleIds } from "../../../utils/formatKeyValueUtil";
import { getFormattedPhoneNumberAndType } from "../../../utils/formatPhoneNumberUtil";
import { getNameFromEmail } from "../../../utils/formatEmailUtil";
import { getTextLabelFromEnum } from "../../../utils/directory-enums";

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
        value?: string
    ];
    displayName?: string;
    roleId?: string;
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

}

interface IState {
    showUserRoleTable: boolean;
    roles: IProps[];
    error: any;
    activeRoleEmails: string[];
    loading: boolean;
    searchQuery: string;
    displayName: string;
}

/***
 * This view would display detailed view of selected role by shortName,
 * but can be changed to view by longName or something else as well if need it be.
 */

export default class RoleDirectoryView extends Component<IProps, IState> {

    static propTypes = {
        simplifiedID: PropTypes.string,
        primaryOrganizationID: PropTypes.string,
        primaryRoleCategoryID: PropTypes.string,
        primaryLocationID: PropTypes.string,
        primaryRoleID: PropTypes.string,
        identifiers: PropTypes.array,
        location: PropTypes.string,
        roleId: PropTypes.string,
        description: PropTypes.string,
        contactPoints: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.state = {
            showUserRoleTable: false,
            roles: [],
            activeRoleEmails: [],
            error: null,
            loading: true,
            searchQuery: '',
            displayName: null
        }
    }

    componentDidMount() {
        this.getRoleDetail();
    }

    getRoleDetail() {
        const searchQuery = this.props.roleId;
        const roleId = encodeURIComponent(searchQuery);
        const view_role_detail = config.search_all_roles + roleId;
        // api data
        fetch(view_role_detail, {
            method: "GET"
        }).then(res => res.json())
            .then((response) => {
                let emails = [];
                let roleArrayResponse = [];
                let entries = response.entry;
                roleArrayResponse.push(entries);
                roleArrayResponse.map(val => emails = val.activePractitionerSet);
                this.setState({
                    roles: roleArrayResponse,
                    showUserRoleTable: true,
                    loading: false,
                    activeRoleEmails: emails
                })
            }).catch(err => {
                if (err instanceof Error) {
                    this.setState({
                        error: err,
                        loading: false
                    })
                }
            });
    }

    getDisplayNameFromAPI(emailId: string): string {
        if (emailId.indexOf("@") === -1) return null;
        const api = config.api_base_path + config.prefix + emailId;
        fetch(api, {
            method: "GET"
        }).then(res => res.json())
            .then((response) => {
                let displayName = response.entry.displayName;
                this.setState({ displayName: displayName })
            })
        let fullName = this.state.displayName;
        return fullName;
    }

    getFormattedRoleIDTextLabel(id: string, headerElement) {
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
            return contactPoints;
        }
        let contacts = getFormattedPhoneNumberAndType(contactPoints);
        let phoneType = '';
        let phoneNumber = '';
        phoneType = contacts.map((val) => phoneType = val.phoneType);
        let phoneTypeFormatted = getTextLabelFromEnum(phoneType)
        phoneNumber = contacts.map((val) => val.phoneNum);
        return phoneNumber ? (<div key={phoneType}><span>{phoneTypeFormatted} - {phoneNumber}</span></div>): null;
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

    _renderRoleDetailView = () => {
        return this.state.roles.map((role, index) => {
            let headerElement = Object.keys(this.state.roles[0]);
            const { simplifiedID, primaryRoleCategoryID, primaryRoleID, primaryLocationID,
                primaryOrganizationID, displayName, description, contactPoints } = role //destructuring the role object/array
            return <table key={index} className="mx_role_table">
                <caption><h2>Practitioner Registered Role Detail</h2></caption>
                <tbody>
                    <tr><th>{this.getFormattedRoleIDTextLabel("simplifiedID", headerElement)}</th><td>{simplifiedID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryRoleCategoryID", headerElement)}</th><td>{primaryRoleCategoryID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryOrganizationID", headerElement)}</th><td>{primaryOrganizationID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryRoleID", headerElement)}</th><td>{primaryRoleID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("displayName", headerElement)}</th><td>{displayName}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("description", headerElement)}</th><td>{description}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryLocationID", headerElement)}</th><td>{getFormattedRoleIds(primaryLocationID)}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("contactPoints", headerElement)}</th><td>{this._renderPhoneNumbers(contactPoints)}</td></tr>
                </tbody>
            </table>
        })
    }

    // show someone who is fulfilling the role.
    _renderUserDetailView = () => {
        let users: string[] = this.state.activeRoleEmails;
        if ((users.length < 1) || !Array.isArray(users)) return null;
        return <div className="mx_role_fulfilledBy">
            <h3>Role Fulfilled By:</h3>
            {users.map((emailAddr, index) => {
                const name = getNameFromEmail(emailAddr) || this.getDisplayNameFromAPI(emailAddr);
                return name && <span className="mx_role_fulfilledBy_user" key={index}>
                    <li>{this._renderAvatar(name)}</li>
                    <li>{name}</li>
                </span>
            })}
        </div>
    }

    render() {
        const Spinner = sdk.getComponent("elements.Spinner");
        if (this.state.loading) return <Spinner w={22} h={22} />;
        if (this.state.error) {
            return <div style={{ color: 'red' }}>
                <p>Something bad happened! Requested resource could not be found.</p>
                <p>Internal Server Error Occured.</p>
            </div>
        }
        return <React.Fragment>
            {this._renderUserDetailView()}
            {this._renderRoleDetailView()}
        </React.Fragment>
    }
}