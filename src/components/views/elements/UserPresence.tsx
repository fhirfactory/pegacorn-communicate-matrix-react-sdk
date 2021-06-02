
import React from 'react';
import PropTypes from 'prop-types';
import * as directoryService from '../../../DirectoryService';
interface IProps {
    searchContext?: string;
    available?: boolean;
    online?: boolean;
    active?: boolean;
    onCall?: boolean;
}
const UserPresence = (props: IProps) => {
    const {
        searchContext,
        available, // used by role directory
        online, // used by person directory
        active, // used by person directory (waiting for backend to be ready to synchronize information to see if user is on call)
        onCall
    } = props;

    const roleDirectoryPresenceIndicator = () => {
        if (searchContext === directoryService.KIND_ROLE_DIRECTORY_SEARCH) {
            return available ? (<span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'green' }}>
                Filled
            </span>) : <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'red' }}>Unfilled</span>
        } else {
            return null;
        }
    }

    const peopleDirectoryPresenceIndicators = () => {
        console.log("Person is online/offline", online);
        console.log("Role is filled/unfilled", available);
        console.log("Person is active", active);
        console.log("Search context is", searchContext);
        if (searchContext === directoryService.KIND_PEOPLE_DIRECTORY_SEARCH) {
            let peopleDirectoryAvailabilityStatus;
            peopleDirectoryAvailabilityStatus = (
                active ? <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'green' }}>
                    Available
                    </span> : <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'red' }}>
                    Unavailable
                        </span>
            )
            let peopleDirectoryOnlineStatus = (
                online ?
                    <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'green' }}>
                        Online
            </span> : <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'red' }}>Offline</span>
            )
            return <>
                {peopleDirectoryAvailabilityStatus}
                {peopleDirectoryOnlineStatus}
            </>
        }
    }

    return <div>
        {roleDirectoryPresenceIndicator()}
        {peopleDirectoryPresenceIndicators()}
    </div>
}

UserPresence.prototype = {
    isAvailable: PropTypes.bool,
    isActive: PropTypes.bool,
    isOnline: PropTypes.bool,
    searchContext: PropTypes.bool
}
export default UserPresence;
