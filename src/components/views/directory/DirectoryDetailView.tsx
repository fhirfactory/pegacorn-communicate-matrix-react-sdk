import React, { Component } from "react";
import * as PropTypes from 'prop-types';
import * as sdk from "../../../index";
import * as config from "../../../config";
import {_t} from '../../../languageHandler';
import { getFormattedRoleIds } from "../../../utils/formatKeyValueUtil";
import { getFormattedPhoneNumberAndType } from "../../../utils/formatPhoneNumberUtil";
import { getNameFromEmail } from "../../../utils/formatEmailUtil";
import { getTextLabelFromEnum } from "../../../utils/directory-enums";
import * as directoryService from '../../../DirectoryService';

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
    queryId?: string;
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
        const searchQuery = this.props.queryId;

        directoryService.getRoleDetail(searchQuery)
	    .then(response => {
            if (!response.errorText) {
                this.setState({
                    roles: response.roles,
                    showUserRoleTable: true,
                    loading: false,
                    activeRoleEmails: response.activeRoleEmails
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

    _renderRoleDetailView = () => {
        return this.state.roles.map((role, index) => {
            let headerElement = Object.keys(this.state.roles[0]);
            const { primaryRoleCategoryID, primaryRoleID, primaryLocationID,
                primaryOrganizationID, displayName, description, contactPoints } = role //destructuring the role object/array
            return <table key={index} className="mx_role_table">
                <caption><h2>Practitioner Registered Role Detail</h2></caption>
                <tbody>
                    <tr><th>{this.getFormattedRoleIDTextLabel("displayName", headerElement)}</th><td>{displayName}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryRoleCategoryID", headerElement)}</th><td>{primaryRoleCategoryID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryOrganizationID", headerElement)}</th><td>{primaryOrganizationID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryRoleID", headerElement)}</th><td>{primaryRoleID}</td></tr>
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
            console.error("An unxpected error occurred in DirectoryDetailView ", this.state.error);
            return <div style={{ color: 'red' }}>
                <p>{_t("There was a problem communicating with the server. Please try again.")}</p>
            </div>
        }
        return <React.Fragment>
            {this._renderUserDetailView()}
            {this._renderRoleDetailView()}
        </React.Fragment>
    }
}
