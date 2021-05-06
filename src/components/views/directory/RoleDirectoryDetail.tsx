import React, { Component } from "react";
import * as PropTypes from 'prop-types';
import * as sdk from "../../../index";
import { getRoleEnumValues } from "../../../utils/directory-enums";
import { search_role_by_displayName } from "../../../config";

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
    loading: boolean;
    searchQuery: string;
}

/***
 * This view would display detailed view of selected role by shortName, but can be changed to view by longName or something else as well if need it be.
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
        displayName: PropTypes.string,
        description: PropTypes.string,
        contactPoints: PropTypes.array
    };

    constructor(props) {
        super(props);
        this.state = {
            showUserRoleTable: false,
            roles: [],
            error: null,
            loading: true,
            searchQuery: ''
        }
    }

    getRoleDetail() {
        const searchQuery = this.props.displayName;
        const displayName = encodeURI(searchQuery);
        const view_role_detail = search_role_by_displayName + displayName;
        // api data
        const response = fetch(view_role_detail, {
            method: "GET"
        }).then(res => res.json());
        return response;
    }

    componentDidMount() {
        this.getRoleDetail().then((response) => {
            this.setState({
                roles: response,
                showUserRoleTable: true,
                loading: false,
            })
        }).catch(err => {
            if (err instanceof Error) {
                this.setState({
                    error: err,
                    loading: false
                })
            }
        })
    }

    // The phone, email address info was already converted to
    // string bundle it needs to be changed back to array then be formatted properly
    // A utility function that converts an string containing pair value into array
    // converts a given value number into landline or mobile number.
    // returns 'Landline' or 'mobile' number with correct text which can be presentable.
    getFormattedPhoneNumber(value) {
        const phoneNumber = value.map((value, index) => {
            let newPhoneNumber = new Array(value);
            // Generates landline or mobile number
            let phoneNumberType = newPhoneNumber.map((value) => value.type);
            //find actual phone number digit
            let phoneNumber = newPhoneNumber.map((value) => value.value);
            const phoneFormat = phoneNumberType.toString().charAt(0).toUpperCase() + phoneNumberType.toString().slice(1).toLowerCase() + ' - ';
            return <div key={index}><span>{phoneFormat}</span><span>{phoneNumber}</span></div>
        });

        return phoneNumber;

    }

    //format role id columns
    getFormattedRoleIds(key: string) {
        //if values are listed in enum format from there first
        const formattedValuesWithEnums = getRoleEnumValues(key);
        // if role ids are not listed in enums format using followings.
        const formattedValues = () => {
            key = key.charAt(0).toUpperCase() + key.slice(1); // turn first letter to capital
            key = key.replace(/([A-Z]+)/g, ",$1").replace(/^,/, "");
            return key.split(',').join(' ');
        }
        const finalFormattedValues = formattedValuesWithEnums || formattedValues();
        return finalFormattedValues;
    }

    getFormattedRoleIDTextLabel(id: string, headerElement) {
        if (id == undefined || id == null) {
            return id;
        } else {
            id = headerElement[headerElement.indexOf(id)];
            return this.getFormattedRoleIds(id);
        }
    }

    renderRoleDetailView = () => {
        return this.state.roles.map((role, index) => {
            let headerElement = Object.keys(this.state.roles[0]);
            const { simplifiedID, primaryRoleCategoryID, identifiers, primaryRoleID,
                primaryLocationID, primaryOrganizationID, displayName, description, contactPoints } = role //destructuring the role object/array
            return <table key={index} className="mx_role_table">
                <caption><h2>Practitioner Registered Role Detail</h2></caption>
                <tbody>
                    <tr><th>{this.getFormattedRoleIDTextLabel("simplifiedID", headerElement)}</th><td>{simplifiedID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryRoleCategoryID", headerElement)}</th><td>{primaryRoleCategoryID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryOrganizationID", headerElement)}</th><td>{primaryOrganizationID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryRoleID", headerElement)}</th><td>{primaryRoleID}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("displayName", headerElement)}</th><td>{displayName}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("description", headerElement)}</th><td>{description}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("primaryLocationID", headerElement)}</th><td>{this.getFormattedRoleIds(primaryLocationID)}</td></tr>
                    <tr><th>{this.getFormattedRoleIDTextLabel("contactPoints", headerElement)}</th><td>{this.getFormattedPhoneNumber(contactPoints)}</td></tr>
                </tbody>
            </table>
        })
    }

    render() {
        const Spinner = sdk.getComponent("elements.Spinner");
        if (this.state.loading) return <Spinner w={22} h={22} />;
        if (this.state.error) {
            return <>
                <div>An error has occured....</div>;
                <div>Error message: {this.state.error.message}</div>
            </>
        }
        return <React.Fragment>
            {this.renderRoleDetailView()}
        </React.Fragment>
    }
}
