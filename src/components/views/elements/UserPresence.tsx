
import React from 'react';
import PropTypes from 'prop-types';
import * as directoryService from '../../../DirectoryService';
interface IProps {
    directorySearchContext?: string;
    available?: boolean;
    online?: boolean;
    active?: boolean;
    onCall?: boolean;
}
const UserPresence = (props: IProps) => {
    const {
        directorySearchContext,
        available, // used by role directory
        online, // used by person directory
        active, // used by person directory (TODO: waiting for decision as opposed to user story requires active/inactive status displayed)
        onCall  // To Do: waiting for backend
    } = props;

    const roleDirectoryPresenceIndicator = () => {
        if (directorySearchContext === directoryService.KIND_ROLE_DIRECTORY_SEARCH) {
            return available ? (<span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'green' }}>
                Filled
            </span>) :
                <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'red' }}>Unfilled</span>
        } else {
            return null;
        }
    }

    const peopleDirectoryPresenceIndicators = () => {
        if (directorySearchContext === directoryService.KIND_PEOPLE_DIRECTORY_SEARCH) {
            let peopleDirectoryAvailabilityStatus;
            peopleDirectoryAvailabilityStatus = <div>
                {/* {(online && active) ? <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'green' }}>
                    Available
                    </span> : null} */}
                {(online && !active) ? <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'grey' }}>
                    Unavailable
                        </span> : null}
            </div>
            let peopleDirectoryOnlineStatus = (
                (online && active) ?
                    <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'green' }}>
                        Online
            </span> : <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'red' }}>Offline</span>
            )
            let personDirectoryOnBusyStatus = (
                (onCall) ? <span className="mx_InviteDialog_roomTile_userPresence" style={{ color: 'red' }}>OnCall</span> : null
            );
            return <>
                <span>{peopleDirectoryOnlineStatus}</span>
                <span>{peopleDirectoryAvailabilityStatus}</span>
                <span>{personDirectoryOnBusyStatus}</span>
            </>
        }
    }

    return <>
        {roleDirectoryPresenceIndicator()}
        {peopleDirectoryPresenceIndicators()}
    </>
}

UserPresence.prototype = {
    isAvailable: PropTypes.bool,
    isActive: PropTypes.bool,
    isOnline: PropTypes.bool,
    directorySearchContext: PropTypes.bool
}
export default UserPresence;
