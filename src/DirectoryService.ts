/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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

import {MatrixClientPeg} from "./MatrixClientPeg";
import * as config from './config';

// we have a number of types defined from the Matrix spec which can't reasonably be altered here.
/* eslint-disable camelcase */

// role and service directory
export const KIND_ROLE_DIRECTORY_SEARCH = "search_role_directory";
export const KIND_SERVICE_DIRECTORY_SEARCH = "search_service_directory";
export const KIND_PEOPLE_DIRECTORY_SEARCH = "search_people_directory";
export const KIND_SELECTED_ROLE = "selected_roles";

export const searchIsOnRoleOrPeopleOrServiceDirectory = (kind) => {
	if (kind === KIND_ROLE_DIRECTORY_SEARCH) {
		return true;
	} else if (kind === KIND_PEOPLE_DIRECTORY_SEARCH) {
		return true;
	} else if (kind === KIND_SERVICE_DIRECTORY_SEARCH) {
		return true;
	} else if(kind === KIND_SELECTED_ROLE){
		return true;	
	} else {
		return false;
	}
}

/**
 * This will be used to display selected roles
 */
 export const getSelectedRolesForCurrentUser = () => {
	// get email id
	const user_id_encoded = encodeURI(MatrixClientPeg.get().getUserId());//TODO:Sam remove this line as we need email id instead of userid	////http://localhost:12121/pegacorn/operations/directory/r1/Practitioner/Samridhi.Shukla@test.act.gov.au/PractitionerRoles
	const user_emailid = "Samridhi.Shukla@test.act.gov.au";	//TODO:sam get email id of current user 	//"selected_roles": "https://lingo-server.site-a/pegacorn/operations/directory/r1/Practitioner/Samridhi.Shukla@test.act.gov.au/PractitionerRoles",//"base_path" : "http://localhost:12121/pegacorn/operations/directory/r1/"//"base_path" + "Practitioner/" + emailid +  "/PractitionerRoles"	//Samridhi.Shukla@test.act.gov.au
	
	let role__selection__api = config.communicate_api_base_path +config.search_by_role_selection.prefix + user_emailid + config.search_by_role_selection.suffix;
	return fetch(role__selection__api, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
		}
	}).then(res => res.json())
	  .then(response => {
		return {
			favorites: response.practitionerRoles
		};
	}).catch((err) => {
		return {
			errorText: err
		};
	});
}
/**
 * This will be used to display selected roles
 */
 export const getSelectedRolesForCurrentUser_dummy = () => {
  return [
		"CCU CNC",
		"Snr Cardiac Physiologist",
		"FAMSAC On Call Nurse"
	];
}
/**
 * This will be used by service, role and people search by switching api based on search context
 * RETURN a fetch Promise, so calling code can either
 *        call this method asynchronously:
 *            getFavoritesForCurrentUser(kind).then(response => { 
 *                <code to process response>
 *            }) 
 *        OR synchronously:
 *            const response = await getFavoritesForCurrentUser(kind);
 *            <code to process response> 
 *        The response will be 
 *        - an object with an errorText property if an error occurs
 *        - otherwise an object with a favorites property
 */
export const getFavoritesForCurrentUser = (kind) => {
	// Find favorites from relevant api (roles / services)
	// get user id
	const user_id_encoded = encodeURI(MatrixClientPeg.get().getUserId());
	console.log('user_id_encoded' + user_id_encoded);
	let favorite_api = config.communicate_api_base_path + config.prefix + user_id_encoded;
	if (kind === KIND_ROLE_DIRECTORY_SEARCH) {
		favorite_api += config.search_by_favorite.role_suffix;
	}
	return fetch(favorite_api, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json',
		}
	}).then(res => res.json())
	  .then(response => {
		return {
			favorites: response.favourites
		};
	}).catch((err) => {
		return {
			errorText: err
		};
	});
}

/**
 * RETURN - null if the specified kind parameter is not supported;
 *        - otherwise a fetch Promise, so calling code can either
 *          call this method asynchronously:
 *              getMatchingRecords(term, kind).then(response => { 
 *                  <code to process response>
 *              }) 
 *          OR synchronously:
 *              const response = await getMatchingRecords(term, kind);
 *              <code to process response> 
 *          The response will be 
 *          - an object with an errorText property if an error occurs
 *          - otherwise an object with an numOfRecordsFromSearchAPI and results (an array 
 *            of objects with display_name, user_id, role_category and roleIsActive properties)
 */
export const getMatchingRecords = (term: string, kind) => {
	if (!searchIsOnRoleOrPeopleOrServiceDirectory(kind)) {
		return null;
	}

	let search_api_path;
	// form an api path based on context

	if (kind === KIND_ROLE_DIRECTORY_SEARCH) {
		if (!term) {
			search_api_path = config.search_all_roles
		} else {
			search_api_path = config.search_role_by_displayName + term;
		}
	}

	// Find roles, services, and people
	return fetch(search_api_path, {
		method: "GET",
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(res => {
		return res.json().then(results => [res, results]);
	}).then(function([res, results]) {
		let totalRecords = 0;
        if (!results) {
			results = [];
		} else {
		    totalRecords = Number(res.headers.get('X-Total-Count'));
		}

        console.log("totalRecords=" + totalRecords);
		let mappedResults = results.map(value => ({
			display_name: value["description"],
			user_id: value["simplifiedID"],
			role_category: value["primaryRoleCategoryID"],
			// filled or not filled status
			// if activePractitionerSet array is non-empty someone is fulfilling that role
			roleIsActive: (value.activePractitionerSet?.length >= 1) ?? false
		}));
        console.log("mappedResults.length=" + mappedResults.length + ", mappedResults=" + JSON.stringify(mappedResults));

		return {
			numOfRecordsFromSearchAPI: totalRecords,
			results: mappedResults
		};
	}).catch(err => {
		return {
			errorText: err
		};
	});
}

/**
 * This will be used by service, role and people search by switching api based on search context
 * RETURN a fetch Promise, so calling code can either
 *        call this method asynchronously:
 *            getRoleDetail(roleId).then(response => { 
 *                <code to process response>
 *            }) 
 *        OR synchronously:
 *            const response = await getRoleDetail(roleId);
 *            <code to process response> 
 *        The response will be 
 *        - an object with an errorText property if an error occurs
 *        - otherwise an object with roles and activeRoleEmails properties
 */
export const getRoleDetail = (roleId: string) => {
    const queryId = encodeURIComponent(roleId);
    const view_role_detail = config.search_all_roles + queryId;
    // api data
    return fetch(view_role_detail, {
            method: "GET"
	}).then(res => res.json())
	  .then(response => {
		let emails = [];
		let roleArrayResponse = [];
		let entries = response.entry;
		if (entries) {
			roleArrayResponse.push(entries);
			roleArrayResponse.map(val => emails = val.activePractitionerSet);
		}
		return {
            roles: roleArrayResponse,
            activeRoleEmails: emails
		};
	}).catch(err => {
		return {
			errorText: err
		};
	});
}

/**
 * RETURN - null if the id isn't an email
 *        - otherwise a fetch Promise, so calling code can either
 *          call this method asynchronously:
 *              getPractionerDisplayName(id).then(response => { 
 *                  <code to process response>
 *              }) 
 *          OR synchronously:
 *              const response = await getPractionerDisplayName(id);
 *              <code to process response> 
 *          The response will be 
 *          - an object with an errorText property if an error occurs
 *          - otherwise an object with a displayName property
 */
export const getPractionerDisplayName = (id: string) => {
    if (id.indexOf("@") === -1) return null;
    const queryId = encodeURIComponent(id);
	console.log("RoleId" + id);
	//console.log("RoleId" + roleId);
	console.log("queryId" + queryId);
    const view_role_detail = config.communicate_api_base_path + config.prefix + queryId;
    // api data
    return fetch(api, {
            method: "GET"
	}).then(res => res.json())
	  .then(response => {
		return {
            displayName: response.entry.displayName
		};
	}).catch(err => {
		return {
			errorText: err
		};
	});
}
