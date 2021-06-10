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

import { MatrixClientPeg } from "./MatrixClientPeg";
import * as config from './config';

// we have a number of types defined from the Matrix spec which can't reasonably be altered here.
/* eslint-disable camelcase */

// role and service directory
export const KIND_ROLE_DIRECTORY_SEARCH = "search_role_directory";
export const KIND_SERVICE_DIRECTORY_SEARCH = "search_service_directory";
export const KIND_PEOPLE_DIRECTORY_SEARCH = "search_people_directory";

export const searchIsOnRoleOrPeopleOrServiceDirectory = (kind) => {
    if (kind === KIND_ROLE_DIRECTORY_SEARCH) {
        return true;
    } else if (kind === KIND_PEOPLE_DIRECTORY_SEARCH) {
        return true;
    } else if (kind === KIND_SERVICE_DIRECTORY_SEARCH) {
        return true;
    } else {
        return false;
    }
}
/**
 * Forms directory search api based on current context of search
 * @param The term is search term entered in directory search
 * @param The kind is directory search context
*/
export function getDirectorySearchAPIInContext(term, kind) {
    let search_api_path;
    console.log(`Search context is ${kind}, search kind is ${term}`)
    if (kind === KIND_ROLE_DIRECTORY_SEARCH) {
        if (!term) {
            search_api_path = config.search_all_roles
        } else {
            search_api_path = config.search_role_by_displayName + term;
        }
    } else if (kind === KIND_PEOPLE_DIRECTORY_SEARCH) {
        if (!term) {
            search_api_path = config.api_search_people;
        } else {
            search_api_path = config.search_people_by_displayName + term;
        }
    } else if (kind === KIND_SERVICE_DIRECTORY_SEARCH) {
        if (!term) {
            search_api_path = config.api_search_service
        } else {
            search_api_path = config.search_service_by_displayName + term;
        }
    }
    return search_api_path;
}

/**
 * Forms favorite api based on current context of search
 * @param The kind is directory search context
*/
export function getFavoriteApiFromContext(kind) {
       // Find favorites from relevant api (roles / people / services)
    // get user id
    const user_id_encoded = encodeURI(MatrixClientPeg.get().getUserId());
    let favorite_api = config.communicate_api_base_path + config.prefix + user_id_encoded;
    if (kind === KIND_ROLE_DIRECTORY_SEARCH) {
        favorite_api += config.search_by_favorite.role_suffix;
    } else if (kind === KIND_PEOPLE_DIRECTORY_SEARCH) {
        favorite_api += config.search_by_favorite.people_suffix;
    } else if ((kind === KIND_SERVICE_DIRECTORY_SEARCH)) {
        favorite_api += config.search_by_favorite.service_suffix;
    }
    return favorite_api;
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

    let favorite_api = getFavoriteApiFromContext(kind);
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
 * Updates favorites based on people, role, service directory context
 *        - otherwise a fetch Promise, so calling code can either
 *          call this method asynchronously:
 *              updateFavoritesForCurrentUser(id).then(response => {
 *                  <code to process response>
 *              })
 *          OR synchronously:
 *              const response = await updateFavoritesForCurrentUser(id);
 *              <code to process response>
 *          The response will be
 *          - an object with an errorText property if an error occurs
 *          - otherwise an object with a displayName property
 * @param kind The search context which is currently used.
 * @param favourites All the favorite by type (people, service, person) based on context
 */
export const updateFavoritesForCurrentUser = (kind, favourites) => {
    let favorite_api = getFavoriteApiFromContext(kind);
    let currentFavoritePayload = JSON.stringify({ favourites: favourites });
    return fetch(favorite_api, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
        body: currentFavoritePayload
    }).then(res => {
        console.log(`Favorite update reponse status code was ${res.status}`);
            return res.status;
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
 * @param term The term that is used when search is displayed by directory
 * @param kind The kind of search in directory context such as role, people, service
 */
export const getMatchingRecords = (term: string, kind) => {
    if (!searchIsOnRoleOrPeopleOrServiceDirectory(kind)) {
        return null;
    }
     // form an api path based on context
    let search_api_path = getDirectorySearchAPIInContext(term, kind);

    // Find roles, services, and people
    return fetch(search_api_path, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        return res.json().then(results => [res, results]);
    }).then(function ([res, results]) {
        let totalRecords = 0;
        if (!results) {
            results = [];
        } else {
            totalRecords = Number(res.headers.get('X-Total-Count'));
        }
        console.log("totalRecords=" + totalRecords);

        let identifiers = [];
        let short_name;
        let long_name;
        results?.map(val =>  identifiers = val.identifiers);
        identifiers?.map(val => {
            if (val.type == "ShortName") {
                short_name = val.leafValue;
            }
            if (val.type == "LongName") {
                long_name = val.leafValue;
            }
        });


        // maps person's loggedin status, and active/inactive status
        let practitionerStatus;
        let job_title;
        results.map(val => {
            if (!val.practitionerStatus) {
                return;
            }
            practitionerStatus = val.practitionerStatus;
            job_title = val.mainJobTitle;
        });
        let loggedIn = (practitionerStatus !== undefined) ? practitionerStatus['loggedIn'] : false; // on service and role directory this wont apply so just return false and skip
        let active =  (practitionerStatus !== undefined) ? practitionerStatus['active'] : false; // on service and role directory this wont apply so just return false and skip
        let mappedResults = results.map(value => ({
            display_name: value["displayName"],
            user_id: value["simplifiedID"],
            role_category: value["primaryRoleCategoryID"],
            long_name: long_name,
            short_name: short_name,
            loggedIn: practitionerStatus ? loggedIn: false,
            active: practitionerStatus ? active: false,
            // filled or not filled status
            // if activePractitionerSet array is non-empty someone is fulfilling that role
            roleIsActive: (value.activePractitionerSet?.length >= 1) ?? false,
            job_title: job_title
        }));
        console.log("mappedResults.length=" + mappedResults.length + ", mappedResults=" + JSON.stringify(mappedResults));
        console.log("Mapped identifier results are", JSON.stringify(mappedResults.identifiers));
        console.log(`Mapped practitioner active/loggedIn status are, ${(practitionerStatus !==undefined) ? practitionerStatus['loggedIn'] : false}`);

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
 * @param searchIdInContext The id of service, people or role @type string,
 * @param searchContext The search in context
 *
 */
export const getRolePersonServiceDetail = (searchContext: string, searchIdInContext: string) => {
    const queryId = encodeURIComponent(searchIdInContext);
    const view_detail_api = getDirectorySearchAPIInContext(null, searchContext) + queryId;
    // api data
    return fetch(view_detail_api, {
        method: "GET"
    }).then(res => res.json())
        .then(response => {
            let emails = [];
            let roleArrayResponse = [];
            let currentUserActiveRoles = [];
            let entries = response.entry;
            if (entries) {
                roleArrayResponse.push(entries);
                roleArrayResponse.map(val => emails = val.activePractitionerSet);  // used to find active practitioner by role directory
                roleArrayResponse.map(val => currentUserActiveRoles = val.currentPractitionerRoles)  // used to find active roles for particular practitioner at given time ()
            }
            return {
                entries: roleArrayResponse,
                activeRoleEmails: emails,
                currentPractitionerRoles: currentUserActiveRoles
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
 * @param id The id for current practitioner which must be a string and
 * @type id Must be a string
 */
export const getPractionerDisplayName = (id: string) => {
    if (id.indexOf("@") === -1) return null;
    const queryId = encodeURIComponent(id);
    const view_role_detail = config.communicate_api_base_path + config.prefix + queryId;
    // api data
    return fetch(view_role_detail, {
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
/**
 * @param roleName The role that needs to be passed in as a string.
 * @returns The role name and role category id passed in.
 * @type The type must be a string.
 */
export const getRoleCategoryName = (roleName: string) => {
    const api = config.search_all_roles + encodeURIComponent(roleName);
    let roleCategory;
    fetch(api, { method: "GET" })
        .then(res => res.json())
        .then((response) => {
            return {
                roleCategory: response.entry.primaryRoleCategoryID
            }
        })
    return roleCategory;
}


