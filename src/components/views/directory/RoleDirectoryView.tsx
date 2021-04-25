import React, { Component, useState } from "react";
import * as PropTypes from 'prop-types';
import * as sdk from "../../../index";
import { getRoleEnumValues } from "../../../utils/directory-enums";
import { search_role_by_shortName } from "../../../config";

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
}

/***
 * This view would display detailed view of selected role by shortName, but can be changed to view by longName or something else as well if need it be.
 */

export default class RoleDirectoryView extends Component<IProps[], IState> {

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
            loading: true
        }
    }

    componentDidMount() {
        const view_role_detail = search_role_by_shortName + "FAMSAC%20On%20Call%20Nurse";
        console.log("role directory path is", search_role_by_shortName);
        // api data
        fetch(view_role_detail, {
            method: "GET",
            /* "body": JSON.stringify(
                {
                     simplifiedID: this.state.roles.simplifiedID,
                      primaryOrganizationID: this.state.roles.primaryOrganizationID,
                      primaryRoleCategoryID: this.state.roles.primaryRoleCategoryID,
                      primaryLocationID: this.state.roles.primaryLocationID,
                      primaryRoleID: this.state.roles.primaryRoleID,
                      identifiers: this.state.roles.identifier,
                      location: this.state.roles.location,
                      displayName: this.state.roles.displayName,
                      description: this.state.roles.description,
                      contactPoints: this.state.roles.contactPoints
                })*/
        })
            .then(res => res.json())
            .then((response) => {
                this.setState({
                    roles: response,
                    showUserRoleTable: true,
                    loading: false,
                })
            })
            .catch(err => {
                if (err instanceof Error) {
                    console.log("Failed to fetch request...", err.message);
                    this.setState({
                        error: err,
                        loading: false
                    })
                }
            })

        // if (response) {
        //     this.setState({
        //         showUserRoleTable: true,
        //         loading: false,
        //     })
        // }
    }

    // Because the view that receives phone, email address info was already converted to
    // string bundle it needs to be changed back to array then be formatted properly
    // A utility function that converts an string containing pair value into array
    // converts a given value number into landline or mobile number.
    // returns 'Landline' or 'mobile' number with correct text which can be presentable.
    getFormattedPhoneNumber(value) {
        const phoneNumber = value.map((value, index) => {
            let newPhoneNumber = new Array(value);
            // converts string into array with key, value pair values
            for (let i = 0; i < value.length; i++) {
                let tmp = value[i].split(":");
                newPhoneNumber[tmp[0]] = tmp[1]
            }
            //landline or mobile number? check type
            let phoneNumberType = newPhoneNumber.map((value) => value.type);
            //find actual phone number digit
            let phoneNumber = newPhoneNumber.map((value) => value.value);
            const phoneFormat = phoneNumberType.toString().charAt(0).toUpperCase() + phoneNumberType.toString().slice(1).toLowerCase() + ' - ';
            console.log("phone format type", phoneNumberType);
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

    renderRoleTitles = () => {
        let headerElement = Object.keys(this.state.roles[0])
        return headerElement.map((key, index) => {
            return <tr key={this.state.roles.simplifiedID}>
                <th key={index}>{this.getFormattedRoleIds(key)}</th>
                {/* <th>Simplified ID</th>
            <th>Primary Category ID</th>
            <th>Primary Organization ID</th>
            <th>Primary Location ID</th>
            <th>Primary Role ID</th>
            <th>Display Name</th>
            <th>Description</th> */}
            </tr>
        })
    }

    renderRoleDetailView = () => {
        console.log("Data found for heading was", this.state.roles)
        return this.state.roles.map((role, index) => {
            const { simplifiedID, primaryRoleCategoryID, identifiers, primaryRoleID, organization, specialty, location,
                primaryLocationID, primaryOrganizationID, displayName, description, contactPoints } = role //destructuring the role object/array
            return <tr key={index}>
                <td>{simplifiedID}</td>
                <td>{primaryRoleCategoryID}</td>
                <td>{primaryOrganizationID}</td>
                <td>{primaryLocationID}</td>
                <td>{primaryRoleID}</td>
                <td>{displayName}</td>
                <td>{description}</td>
                <td>{this.getFormattedPhoneNumber(contactPoints)}</td>
            </tr>
        })
    }

    render() {
        console.log("data for role is", this.state.roles);
        console.log("Show user role detail", this.state.showUserRoleTable);
        const Spinner = sdk.getComponent("elements.Spinner");
        if (this.state.loading) return <Spinner w={22} h={22} />;
        if (this.state.error) {
            return <>
                <div>An error has occured....</div>;
                <div>Error message: {this.state.error.message}</div>
            </>
        }
        return <>
            <h1 id="title">Practitioner Registered Role Detail</h1>
            <table id="role-search-detail">
                <tbody>
                    <tr>{this.renderRoleTitles()}</tr>
                    {this.renderRoleDetailView()}
                </tbody>
            </table>
        </>
    }
}
