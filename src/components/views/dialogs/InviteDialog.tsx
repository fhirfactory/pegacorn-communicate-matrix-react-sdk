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

import React, {createRef} from 'react';
import {_t, _td} from "../../../languageHandler";
import * as sdk from "../../../index";
import {MatrixClientPeg} from "../../../MatrixClientPeg";
import {makeRoomPermalink, makeUserPermalink} from "../../../utils/permalinks/Permalinks";
import DMRoomMap from "../../../utils/DMRoomMap";
import {RoomMember} from "matrix-js-sdk/src/models/room-member";
import SdkConfig from "../../../SdkConfig";
import {getHttpUriForMxc} from "matrix-js-sdk/src/content-repo";
import * as Email from "../../../email";
import {getDefaultIdentityServerUrl, useDefaultIdentityServer} from "../../../utils/IdentityServerUtils";
import {abbreviateUrl} from "../../../utils/UrlUtils";
import dis from "../../../dispatcher/dispatcher";
import IdentityAuthClient from "../../../IdentityAuthClient";
import Modal from "../../../Modal";
import {humanizeTime} from "../../../utils/humanize";
import createRoom, {canEncryptToAllUsers, findDMForUser, privateShouldBeEncrypted} from "../../../createRoom";
import {inviteMultipleToRoom, showCommunityInviteDialog} from "../../../RoomInvite";
import {Key} from "../../../Keyboard";
import {Action} from "../../../dispatcher/actions";
import {DefaultTagID} from "../../../stores/room-list/models";
import RoomListStore from "../../../stores/room-list/RoomListStore";
import {CommunityPrototypeStore} from "../../../stores/CommunityPrototypeStore";
import SettingsStore from "../../../settings/SettingsStore";
import {UIFeature} from "../../../settings/UIFeature";
import CountlyAnalytics from "../../../CountlyAnalytics";
import {Room} from "matrix-js-sdk/src/models/room";
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import * as config from '../../../config';
import * as directoryService from '../../../DirectoryService';
import AccessibleButton from '../elements/AccessibleButton';
import { StyledMenuItemCheckbox } from '../../structures/ContextMenu';

// we have a number of types defined from the Matrix spec which can't reasonably be altered here.
/* eslint-disable camelcase */

export const KIND_DM = "dm";
export const KIND_INVITE = "invite";
export const KIND_CALL_TRANSFER = "call_transfer";

const INITIAL_ROOMS_SHOWN = config.numberOfRecordsToShowInSearch
                            || 3; // Number of rooms to show at first
const INCREMENT_ROOMS_SHOWN = 5; // Number of rooms to add when 'show more' is clicked

// This is the interface that is expected by various components in this file. It is a bit
// awkward because it also matches the RoomMember class from the js-sdk with some extra support
// for 3PIDs/email addresses.
//
// XXX: We should use TypeScript interfaces instead of this weird "abstract" class.
class Member {
    /**
     * The display name of this Member. For users this should be their profile's display
     * name or user ID if none set. For 3PIDs this should be the 3PID address (email).
     */
    get name(): string { throw new Error("Member class not implemented"); }

    /**
     * The ID of this Member. For users this should be their user ID. For 3PIDs this should
     * be the 3PID address (email).
     */
    get userId(): string { throw new Error("Member class not implemented"); }

    /**
     * Gets the MXC URL of this Member's avatar. For users this should be their profile's
     * avatar MXC URL or null if none set. For 3PIDs this should always be null.
     */
    getMxcAvatarUrl(): string { throw new Error("Member class not implemented"); }

      /**
    * Determines whether or not member listed is a favorited member
    * Unless value is provided, default is set to false
    */
       get favorite(): boolean { throw new Error("Member class not implemented"); }   // determines whether or not member is favorite

       /**
        * Determines whether or not given member is available for chat
        * Unless value is provided default is set to false
       */
       get available(): boolean { throw new Error("Member class not implemented"); }  // determines whether or not to initiate chats

       /**
        * Determines what is category of current role category
        * It is used by rendering right avatar color according to
        * category id, and by name initials in avatar.
        * Default will be set to null
        */
       get roleCategoryId(): string { throw new Error("Member class not implemented"); }

    get longName(): string {  // used by person directory
        throw new Error("Member class not implemented");
    }

    get shortName(): string {
        throw new Error("Member class not implemented");
    }

    get jobTitle(): string {  // used by person directory
        throw new Error("Member class not implemented");
    }

    get personIsActive(): boolean {  // used by person directory
        throw new Error("Member class not implemented");
    }

    get personIsLoggedIn(): boolean {  // used by person directory
        throw new Error("Member class not implemented");
    }
    get personIsOnCall(): boolean {  // used by person directory
        throw new Error("Member class not implemented");
    }
}

class DirectoryMember extends Member {
    _userId: string;
    _displayName: string;
    _avatarUrl: string;
    _isFavorite: boolean;
    _isAvailable: boolean;
    _roleCategoryId: string;
    _longName: string;
    _shortName: string;
    _jobTitle: string;
    _personIsLoggedIn: boolean;
    _personIsBusy: boolean;
    _personIsOnCall: boolean;

    constructor(userDirResult: {
        user_id: string, display_name: string, avatar_url: string,
        favorite?: boolean, available?: false, roleCategoryId?: string,
        longName?: string, shortName?: string, jobTitle?: string,
        personIsOnCall?: boolean, personIsLoggedIn?: false, personIsActive?: boolean
    }) {
        super();
        this._userId = userDirResult.user_id;
        this._displayName = userDirResult.display_name;
        this._avatarUrl = userDirResult.avatar_url;
        this._roleCategoryId = userDirResult.roleCategoryId;
        this._longName = userDirResult.longName;
        this._shortName = userDirResult.shortName;
        this._jobTitle = userDirResult.jobTitle;
        this._isFavorite = userDirResult.favorite;
        this._isAvailable = userDirResult.available;
        this._personIsLoggedIn = userDirResult.personIsLoggedIn;
        this._personIsBusy = userDirResult.personIsActive;;
    }

    // These next class members are for the Member interface
    get name(): string {
        return this._displayName || this._userId;
    }

    get userId(): string {
        return this._userId;
    }

    getMxcAvatarUrl(): string {
        return this._avatarUrl;
    }


    get roleCategoryId(): string { // used by role directory
        return this._roleCategoryId;
    }

    get longName(): string {  // used by person directory
        return this._longName;
    }

    get shortName(): string {
        return this._shortName;
    }

    get jobTitle(): string {  // used by person directory
        return this._jobTitle;
    }

    get favorite(): boolean { // used by person, role, service directories
        return this._isFavorite;
    }

    get available(): boolean { // used by role directory
        return this._isAvailable;
    }

    get personIsLoggedIn(): boolean {  // used by person directory
        return this._personIsLoggedIn;
    }

    get personIsActive(): boolean {  // used by person directory
        return this._personIsBusy;
    }

    get personIsOnCall(): boolean {  // used by person directory
        return this._personIsOnCall;
    }
}

class ThreepidMember extends Member {
    _id: string;

    constructor(id: string) {
        super();
        this._id = id;
    }

    // This is a getter that would be falsey on all other implementations. Until we have
    // better type support in the react-sdk we can use this trick to determine the kind
    // of 3PID we're dealing with, if any.
    get isEmail(): boolean {
        return this._id.includes('@');
    }

    // These next class members are for the Member interface
    get name(): string {
        return this._id;
    }

    get userId(): string {
        return this._id;
    }

    getMxcAvatarUrl(): string {
        return null;
    }
}

interface IDMUserTileProps {
    member: RoomMember;
    onRemove: (RoomMember) => any;
}

class DMUserTile extends React.PureComponent<IDMUserTileProps> {
    _onRemove = (e) => {
        // Stop the browser from highlighting text
        e.preventDefault();
        e.stopPropagation();

        this.props.onRemove(this.props.member);
    };

    render() {
        const BaseAvatar = sdk.getComponent("views.avatars.BaseAvatar");
        const AccessibleButton = sdk.getComponent("elements.AccessibleButton");

        const avatarSize = 20;
        const avatar = this.props.member.isEmail
            ? <img
                className='mx_InviteDialog_userTile_avatar mx_InviteDialog_userTile_threepidAvatar'
                src={require("../../../../res/img/icon-email-pill-avatar.svg")}
                width={avatarSize} height={avatarSize} />
            : <BaseAvatar
                className='mx_InviteDialog_userTile_avatar'
                url={getHttpUriForMxc(
                    MatrixClientPeg.get().getHomeserverUrl(), this.props.member.getMxcAvatarUrl(),
                    avatarSize, avatarSize, "crop")}
                name={(config.avatarColors ? this.props.member.roleCategoryId: null) ||
                      this.props.member.name}
                idName={(config.avatarColors ? this.props.member.roleCategoryId: null) ||
                        this.props.member.userId}
                width={avatarSize}
                height={avatarSize} />;

        let closeButton;
        if (this.props.onRemove) {
            closeButton = (
                <AccessibleButton
                    className='mx_InviteDialog_userTile_remove'
                    onClick={this._onRemove}
                >
                    <img src={require("../../../../res/img/icon-pill-remove.svg")}
                        alt={_t('Remove')} width={8} height={8}
                    />
                </AccessibleButton>
            );
        }

        return (
            <span className='mx_InviteDialog_userTile'>
                <span className='mx_InviteDialog_userTile_pill'>
                    {avatar}
                    <span className='mx_InviteDialog_userTile_name'>{this.props.member.name}</span>
                </span>
                { closeButton }
            </span>
        );
    }
}

interface IDMRoomTileProps {
    member: RoomMember;
    lastActiveTs: number;
    onToggle: (RoomMember) => any;
    highlightWord: string;
    isSelected: boolean;
    currentUserFavorite: string[];
    isAvailable: boolean;  // determines whether or not member role has a person fulfilling that role
    roleCategoryId: string;
    kind: string;
    error: any;
    onToggleFavorite;
}

class DMRoomTile extends React.PureComponent<IDMRoomTileProps> {
   onToggleIsEnabled = true;

    _onClick = (e) => {
        // Stop the browser from highlighting text
        e.preventDefault();
        e.stopPropagation();

        if (this.props.kind !== directoryService.KIND_SERVICE_DIRECTORY_SEARCH && this.onToggleIsEnabled) {
            this.props.onToggle(this.props.member);
        }
    };

    onToggleView(ev: React.MouseEvent<HTMLElement>) {
        ev.preventDefault();
        ev.stopPropagation();
        this.onToggleIsEnabled = false;

        const detailView = ev.currentTarget.parentNode.querySelector<HTMLElement>('#mx_DirectoryDetailView_table');  // selects current detailed view
        let viewDetailBtn = ev.currentTarget.parentNode.querySelector<HTMLElement>("#mx_DirectoryDetailView_btn");  // selects current button clicked
        if (detailView.style.display === "none") {
            detailView.style.display = "block";
            viewDetailBtn.classList.add('mx_RoomSublist_collapseBtn_collapsed');
            detailView.scrollIntoView({ behavior: 'smooth' });
        } else {
            detailView.style.display = "none";
            viewDetailBtn.classList.remove('mx_RoomSublist_collapseBtn_collapsed');
        }
    }

    _highlightName(str: string) {
        if (!this.props.highlightWord) return str;

        // We convert things to lowercase for index searching, but pull substrings from
        // the submitted text to preserve case. Note: we don't need to htmlEntities the
        // string because React will safely encode the text for us.
        const lowerStr = str.toLowerCase();
        const filterStr = this.props.highlightWord.toLowerCase();

        const result = [];

        let i = 0;
        let ii;
        while ((ii = lowerStr.indexOf(filterStr, i)) >= 0) {
            // Push any text we missed (first bit/middle of text)
            if (ii > i) {
                // Push any text we aren't highlighting (middle of text match, or beginning of text)
                result.push(<span key={i + 'begin'}>{str.substring(i, ii)}</span>);
            }

            i = ii; // copy over ii only if we have a match (to preserve i for end-of-text matching)

            // Highlight the word the user entered
            const substr = str.substring(i, filterStr.length + i);
            result.push(<span className='mx_InviteDialog_roomTile_highlight' key={i + 'bold'}>{substr}</span>);
            i += substr.length;
        }

        // Push any text we missed (end of text)
        if (i < str.length) {
            result.push(<span key={i + 'end'}>{str.substring(i)}</span>);
        }

        return result;
    }

    handleFavoriteToggle = (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.onToggleIsEnabled = false;
        let currentUserFavorites: string[] = this.props.currentUserFavorite;
        let index = currentUserFavorites.indexOf(this.props.member.userId);
        if (index > -1) {
            currentUserFavorites = currentUserFavorites.splice(index, 1);
        } else {
            currentUserFavorites.push(this.props.member.userId);
        }
        return directoryService.updateFavoritesForCurrentUser(this.props.kind, currentUserFavorites)
            .then((response) => {
                if (response === 200) {
                    this.props.onToggleFavorite();
                } else {
                    return;
                }
            });
    }

    render() {
        console.log("Member is available", this.props.isAvailable);
        const BaseAvatar = sdk.getComponent("views.avatars.BaseAvatar");
        const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
        const DirectoryDetailView = sdk.getComponent("directory.DirectoryDetailView");
        const DirectoryContactView = sdk.getComponent("directory.DirectoryContactView");
        const Favorites = sdk.getComponent("views.elements.Favorites");
        const UserPresence = sdk.getComponent("views.elements.UserPresence");
        let timestamp = null;
        if (this.props.lastActiveTs) {
            const humanTs = humanizeTime(this.props.lastActiveTs);
            timestamp = <span className='mx_InviteDialog_roomTile_time'>{humanTs}</span>;
        }

        const avatarSize = 36;
        const avatar = this.props.member.isEmail
            ? <img
                src={require("../../../../res/img/icon-email-pill-avatar.svg")}
                width={avatarSize} height={avatarSize} />
            : <BaseAvatar
                url={getHttpUriForMxc(
                    MatrixClientPeg.get().getHomeserverUrl(), this.props.member.getMxcAvatarUrl(),
                    avatarSize, avatarSize, "crop")}
                name={(config.avatarColors ? this.props.member.roleCategoryId: null) ||
                      this.props.member.name}
                idName={(config.avatarColors ? this.props.member.roleCategoryId: null) ||
                        this.props.member.userId}
                width={avatarSize}
                height={avatarSize} />;

        let checkmark = null;
        if (this.props.isSelected) {
            // To reduce flickering we put the 'selected' room tile above the real avatar
            checkmark = <div className='mx_InviteDialog_roomTile_selected' />;
        }

        // To reduce flickering we put the checkmark on top of the actual avatar (prevents
        // the browser from reloading the image source when the avatar remounts).
        const stackedAvatar = (
            <span className='mx_InviteDialog_roomTile_avatarStack'>
                {avatar}
                {checkmark}
            </span>
        );

        const caption = this.props.member.isEmail
            ? _t("Invite by email")
            : this._highlightName(this.props.member.userId);

        const getDirectoryMemberTitleAndCaption = (textType) => {
            let title;
            let caption;
            if (this.props.kind === directoryService.KIND_ROLE_DIRECTORY_SEARCH) {
                title = this.props.member.longName ? this.props.member.longName : this.props.member.shortName;
                caption = this.props.member.shortName ? this.props.member.shortName : this.props.member.name;
            } else if (this.props.kind === directoryService.KIND_PEOPLE_DIRECTORY_SEARCH) {
                title = this.props.member.name;
                caption = this.props.member.jobTitle ? this.props.member.jobTitle : this.props.member.name;
            } else if (this.props.kind === directoryService.KIND_SERVICE_DIRECTORY_SEARCH) {
                title = this.props.member.longName ? this.props.member.longName : this.props.member.shortName;
                caption = this.props.member.userId || this.props.member.shortName || this.props.member.name;
            } else {
                title = this.props.member.name;
                caption = this.props.member.userId;
            }
            switch (textType) {
                case 'title':
                    return title;
                case 'caption':
                    return caption;
                default:
                    return;
            }
        }

        // const favorite = this.props.isFavorite ?
        //     <span className='mx_InviteDialog_roomTile_favorite'>
        //         <img src={require("../../../../res/img/element-icons/roomlist/favorite.svg")} title="Your favorite" alt="favorite icon" />
        //     </span> : null;

        const favorite = <Favorites isFavorite={this.props.member.favorite}
            displayTooltipOnHover={true}
            kind={this.props.kind}
            onToggle={(ev) => this.handleFavoriteToggle(ev)}
        />

        // const userPresenceIndicator = this.props.isAvailable ? <span className="mx_InviteDialog_roomTile_available">
        //     Filled
        // </span>
        // :<span className="mx_InviteDialog_roomTile_unavailable">Not Filled</span>;

        const userPresenceIndicator = <UserPresence online={this.props.member.personIsLoggedIn}
            available={this.props.isAvailable}
            active={this.props.member.personIsActive}
            directorySearchContext={this.props.kind} />

        const viewDetailedInfoIcon = <AccessibleButton id="mx_DirectoryDetailView_btn"
            className="mx_RoomSublist_collapseBtn" onClick={ev => this.onToggleView(ev)}
            style={{ float: 'right' }}>
        </AccessibleButton>
        // const viewDetailedInfoIcon = <span id="mx_DirectoryDetailView_btn" className=" mx_RightPanel_headerButton mx_AccessibleButton mx_RightPanel_headerButton
        // mx_RightPanel_headerButton_highlight mx_RightPanel_roomSummaryButton"
        //     onClick={ev => this.onToggleView(ev)}
        //     style={{ float: 'right' }} />

        const viewMemberDetail = <div id="mx_DirectoryDetailView_table" style={{ display: 'none' }}>
            <DirectoryDetailView queryId={this.props.member.userId}
                favorite={this.props.member.favorite}
                directorySearchContext={this.props.kind} />
        </div>

        const directoryContactView =
        <DirectoryContactView isDirectorySearch={directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)}
                              directorySearchContext={this.props.kind}/>

        if (this.props.error) {
            console.error("An unxpected error occurred in InviteDialog ", this.props.error);
        }
        const errorText = this.props.error ? (<div style={{ color: 'red' }}>
            <p>{_t("There was a problem communicating with the server. Please try again.")}</p>
        </div>) : null;

        return (
            <div className='mx_InviteDialog_roomTile' onClick={this._onClick}>
                {stackedAvatar}
                <span className="mx_InviteDialog_roomTile_nameStack">
                    <div className='mx_InviteDialog_roomTile_name'>
                        {directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) ? getDirectoryMemberTitleAndCaption('title'):
                        this._highlightName(this.props.member.name)}
                    </div>
                    <div className='mx_InviteDialog_roomTile_userId'>
                        {directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) ? getDirectoryMemberTitleAndCaption('caption'):
                        caption}
                    </div>
                </span>
                {timestamp}
                {directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) && viewDetailedInfoIcon}
                {config.show_favorite_icon_in_directory_search && favorite}
                {config.showUserPresenceIndicator && userPresenceIndicator}
                {directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) ? directoryContactView : null}
                {directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) ? viewMemberDetail : null}
                {errorText}
            </div>
        );
    }
}

interface IInviteDialogProps {
    // Takes an array of user IDs/emails to invite.
    onFinished: (toInvite?: string[]) => any;

    // The kind of invite being performed. Assumed to be KIND_DM if
    // not provided.
    kind: string,

    // The room ID this dialog is for. Only required for KIND_INVITE.
    roomId: string,

    // The call to transfer. Only required for KIND_CALL_TRANSFER.
    call: MatrixCall,

    // Initial value to populate the filter with
    initialText: string,
}

interface IInviteDialogState {
    targets: RoomMember[]; // array of Member objects (see interface above)
    filterText: string;
    recents: { user: Member, userId: string }[];
    numRecentsShown: number;
    suggestions: { user: Member, userId: string }[];
    numSuggestionsShown: number;
    serverResultsMixin: { user: Member, userId: string }[];
    threepidResultsMixin: { user: Member, userId: string }[];
    canUseIdentityServer: boolean;
    tryingIdentityServer: boolean;
    numOfRecordsFromSearchAPI: number;
    numOfRecordsDisplayed: number;
    favorites: string[];
    favoriteFilterIsSelected: boolean;
    displayNoResultText: boolean;

    // These two flags are used for the 'Go' button to communicate what is going on.
    busy: boolean,
    errorText: string,
}

export default class InviteDialog extends React.PureComponent<IInviteDialogProps, IInviteDialogState> {
    static defaultProps = {
        kind: KIND_DM,
        initialText: "",
    };

    _debounceTimer: NodeJS.Timeout = null; // actually number because we're in the browser
    _editorRef: any = null;

    constructor(props) {
        super(props);

        if ((props.kind === KIND_INVITE) && !props.roomId) {
            throw new Error("When using KIND_INVITE a roomId is required for an InviteDialog");
        } else if (props.kind === KIND_CALL_TRANSFER && !props.call) {
            throw new Error("When using KIND_CALL_TRANSFER a call is required for an InviteDialog");
        }

        const alreadyInvited = new Set([MatrixClientPeg.get().getUserId(), SdkConfig.get()['welcomeUserId']]);
        if (props.roomId) {
            const room = MatrixClientPeg.get().getRoom(props.roomId);
            if (!room) throw new Error("Room ID given to InviteDialog does not look like a room");
            room.getMembersWithMembership('invite').forEach(m => alreadyInvited.add(m.userId));
            room.getMembersWithMembership('join').forEach(m => alreadyInvited.add(m.userId));
            // add banned users, so we don't try to invite them
            room.getMembersWithMembership('ban').forEach(m => alreadyInvited.add(m.userId));

            CountlyAnalytics.instance.trackBeginInvite(props.roomId);
        }

        this.state = {
            targets: [], // array of Member objects (see interface above)
            filterText: this.props.initialText,
            recents: InviteDialog.buildRecents(alreadyInvited),
            numRecentsShown: INITIAL_ROOMS_SHOWN,
            suggestions: this._buildSuggestions(alreadyInvited),
            numSuggestionsShown: INITIAL_ROOMS_SHOWN,
            serverResultsMixin: [],
            threepidResultsMixin: [],
            canUseIdentityServer: !!MatrixClientPeg.get().getIdentityServerUrl(),
            tryingIdentityServer: false,

            // These two flags are used for the 'Go' button to communicate what is going on.
            busy: false,
            errorText: null,
            numOfRecordsFromSearchAPI: null,
            numOfRecordsDisplayed: null,
            favorites: [],
            favoriteFilterIsSelected: false,
            displayNoResultText: false
        };

        this._editorRef = createRef();
    }

    componentDidMount() {
        if (this.props.initialText) {
            this._updateSuggestions(this.props.initialText);
        }

        // if favorite in state does not have have values, update favorites results
        if (this.state.favorites.length < 1) {
            this._updateFavoritesForCurrentUser();
        }
    }

    static buildRecents(excludedTargetIds: Set<string>): {userId: string, user: RoomMember, lastActive: number}[] {
        const rooms = DMRoomMap.shared().getUniqueRoomsWithIndividuals(); // map of userId => js-sdk Room

        // Also pull in all the rooms tagged as DefaultTagID.DM so we don't miss anything. Sometimes the
        // room list doesn't tag the room for the DMRoomMap, but does for the room list.
        const dmTaggedRooms = RoomListStore.instance.orderedLists[DefaultTagID.DM] || [];
        const myUserId = MatrixClientPeg.get().getUserId();
        for (const dmRoom of dmTaggedRooms) {
            const otherMembers = dmRoom.getJoinedMembers().filter(u => u.userId !== myUserId);
            for (const member of otherMembers) {
                if (rooms[member.userId]) continue; // already have a room

                console.warn(`Adding DM room for ${member.userId} as ${dmRoom.roomId} from tag, not DM map`);
                rooms[member.userId] = dmRoom;
            }
        }

        const recents = [];
        for (const userId in rooms) {
            // Filter out user IDs that are already in the room / should be excluded
            if (excludedTargetIds.has(userId)) {
                console.warn(`[Invite:Recents] Excluding ${userId} from recents`);
                continue;
            }

            const room = rooms[userId];
            const member = room.getMember(userId);
            if (!member) {
                // just skip people who don't have memberships for some reason
                console.warn(`[Invite:Recents] ${userId} is missing a member object in their own DM (${room.roomId})`);
                continue;
            }

            // Find the last timestamp for a message event
            const searchTypes = ["m.room.message", "m.room.encrypted", "m.sticker"];
            const maxSearchEvents = 20; // to prevent traversing history
            let lastEventTs = 0;
            if (room.timeline && room.timeline.length) {
                for (let i = room.timeline.length - 1; i >= 0; i--) {
                    const ev = room.timeline[i];
                    if (searchTypes.includes(ev.getType())) {
                        lastEventTs = ev.getTs();
                        break;
                    }
                    if (room.timeline.length - i > maxSearchEvents) break;
                }
            }
            if (!lastEventTs) {
                // something weird is going on with this room
                console.warn(`[Invite:Recents] ${userId} (${room.roomId}) has a weird last timestamp: ${lastEventTs}`);
                continue;
            }

            recents.push({userId, user: member, lastActive: lastEventTs});
        }
        if (!recents) console.warn("[Invite:Recents] No recents to suggest!");

        // Sort the recents by last active to save us time later
        recents.sort((a, b) => b.lastActive - a.lastActive);

        return recents;
    }

    _buildSuggestions(excludedTargetIds: Set<string>): {userId: string, user: RoomMember}[] {
        const maxConsideredMembers = 200;
        const joinedRooms = MatrixClientPeg.get().getRooms()
            .filter(r => r.getMyMembership() === 'join' && r.getJoinedMemberCount() <= maxConsideredMembers);

        // Generates { userId: {member, rooms[]} }
        const memberRooms = joinedRooms.reduce((members, room) => {
            // Filter out DMs (we'll handle these in the recents section)
            if (DMRoomMap.shared().getUserIdForRoomId(room.roomId)) {
                return members; // Do nothing
            }

            const joinedMembers = room.getJoinedMembers().filter(u => !excludedTargetIds.has(u.userId));
            for (const member of joinedMembers) {
                // Filter out user IDs that are already in the room / should be excluded
                if (excludedTargetIds.has(member.userId)) {
                    continue;
                }

                if (!members[member.userId]) {
                    members[member.userId] = {
                        member: member,
                        // Track the room size of the 'picked' member so we can use the profile of
                        // the smallest room (likely a DM).
                        pickedMemberRoomSize: room.getJoinedMemberCount(),
                        rooms: [],
                    };
                }

                members[member.userId].rooms.push(room);

                if (room.getJoinedMemberCount() < members[member.userId].pickedMemberRoomSize) {
                    members[member.userId].member = member;
                    members[member.userId].pickedMemberRoomSize = room.getJoinedMemberCount();
                }
            }
            return members;
        }, {});

        // Generates { userId: {member, numRooms, score} }
        const memberScores = Object.values(memberRooms).reduce((scores, entry: {member: RoomMember, rooms: Room[]}) => {
            const numMembersTotal = entry.rooms.reduce((c, r) => c + r.getJoinedMemberCount(), 0);
            const maxRange = maxConsideredMembers * entry.rooms.length;
            scores[entry.member.userId] = {
                member: entry.member,
                numRooms: entry.rooms.length,
                score: Math.max(0, Math.pow(1 - (numMembersTotal / maxRange), 5)),
            };
            return scores;
        }, {});

        // Now that we have scores for being in rooms, boost those people who have sent messages
        // recently, as a way to improve the quality of suggestions. We do this by checking every
        // room to see who has sent a message in the last few hours, and giving them a score
        // which correlates to the freshness of their message. In theory, this results in suggestions
        // which are closer to "continue this conversation" rather than "this person exists".
        const trueJoinedRooms = MatrixClientPeg.get().getRooms().filter(r => r.getMyMembership() === 'join');
        const now = (new Date()).getTime();
        const earliestAgeConsidered = now - (60 * 60 * 1000); // 1 hour ago
        const maxMessagesConsidered = 50; // so we don't iterate over a huge amount of traffic
        const lastSpoke = {}; // userId: timestamp
        const lastSpokeMembers = {}; // userId: room member
        for (const room of trueJoinedRooms) {
            // Skip low priority rooms and DMs
            const isDm = DMRoomMap.shared().getUserIdForRoomId(room.roomId);
            if (Object.keys(room.tags).includes("m.lowpriority") || isDm) {
                continue;
            }

            const events = room.getLiveTimeline().getEvents(); // timelines are most recent last
            for (let i = events.length - 1; i >= Math.max(0, events.length - maxMessagesConsidered); i--) {
                const ev = events[i];
                if (excludedTargetIds.has(ev.getSender())) {
                    continue;
                }
                if (ev.getTs() <= earliestAgeConsidered) {
                    break; // give up: all events from here on out are too old
                }

                if (!lastSpoke[ev.getSender()] || lastSpoke[ev.getSender()] < ev.getTs()) {
                    lastSpoke[ev.getSender()] = ev.getTs();
                    lastSpokeMembers[ev.getSender()] = room.getMember(ev.getSender());
                }
            }
        }
        for (const userId in lastSpoke) {
            const ts = lastSpoke[userId];
            const member = lastSpokeMembers[userId];
            if (!member) continue; // skip people we somehow don't have profiles for

            // Scores from being in a room give a 'good' score of about 1.0-1.5, so for our
            // boost we'll try and award at least +1.0 for making the list, with +4.0 being
            // an approximate maximum for being selected.
            const distanceFromNow = Math.abs(now - ts); // abs to account for slight future messages
            const inverseTime = (now - earliestAgeConsidered) - distanceFromNow;
            const scoreBoost = Math.max(1, inverseTime / (15 * 60 * 1000)); // 15min segments to keep scores sane

            let record = memberScores[userId];
            if (!record) record = memberScores[userId] = {score: 0};
            record.member = member;
            record.score += scoreBoost;
        }

        const members = Object.values(memberScores);
        members.sort((a, b) => {
            if (a.score === b.score) {
                if (a.numRooms === b.numRooms) {
                    return a.member.userId.localeCompare(b.member.userId);
                }

                return b.numRooms - a.numRooms;
            }
            return b.score - a.score;
        });

        return members.map(m => ({userId: m.member.userId, user: m.member}));
    }

    _shouldAbortAfterInviteError(result): boolean {
        const failedUsers = Object.keys(result.states).filter(a => result.states[a] === 'error');
        if (failedUsers.length > 0) {
            console.log("Failed to invite users: ", result);
            this.setState({
                busy: false,
                errorText: _t("Failed to invite the following users to chat: %(csvUsers)s", {
                    csvUsers: failedUsers.join(", "),
                }),
            });
            return true; // abort
        }
        return false;
    }

    _convertFilter(): Member[] {
        // Check to see if there's anything to convert first
        if (!this.state.filterText || !this.state.filterText.includes('@')) return this.state.targets || [];

        let newMember: Member;
        if (this.state.filterText.startsWith('@')) {
            // Assume mxid
            newMember = new DirectoryMember({user_id: this.state.filterText, display_name: null, avatar_url: null
            });
        } else if (SettingsStore.getValue(UIFeature.IdentityServer)) {
            // Assume email
            newMember = new ThreepidMember(this.state.filterText);
        }
        const newTargets = [...(this.state.targets || []), newMember];
        this.setState({targets: newTargets, filterText: ''});
        return newTargets;
    }

    _startDm = async () => {
        this.setState({busy: true});
        const targets = this._convertFilter();
        const targetIds = targets.map(t => t.userId);

        // Check if there is already a DM with these people and reuse it if possible.
        let existingRoom: Room;
        if (targetIds.length === 1) {
            existingRoom = findDMForUser(MatrixClientPeg.get(), targetIds[0]);
        } else {
            existingRoom = DMRoomMap.shared().getDMRoomForIdentifiers(targetIds);
        }
        if (existingRoom) {
            dis.dispatch({
                action: 'view_room',
                room_id: existingRoom.roomId,
                should_peek: false,
                joining: false,
            });
            this.props.onFinished();
            return;
        }

        const createRoomOptions = {inlineErrors: true} as any; // XXX: Type out `createRoomOptions`

        if (privateShouldBeEncrypted()) {
            // Check whether all users have uploaded device keys before.
            // If so, enable encryption in the new room.
            const has3PidMembers = targets.some(t => t instanceof ThreepidMember);
            if (!has3PidMembers) {
                const client = MatrixClientPeg.get();
                const allHaveDeviceKeys = await canEncryptToAllUsers(client, targetIds);
                if (allHaveDeviceKeys) {
                    createRoomOptions.encryption = true;
                }
            }
        }

        // Check if it's a traditional DM and create the room if required.
        // TODO: [Canonical DMs] Remove this check and instead just create the multi-person DM
        let createRoomPromise = Promise.resolve(null) as Promise<string | null | boolean>;
        const isSelf = targetIds.length === 1 && targetIds[0] === MatrixClientPeg.get().getUserId();
        if (targetIds.length === 1 && !isSelf) {
            createRoomOptions.dmUserId = targetIds[0];
            createRoomPromise = createRoom(createRoomOptions);
        } else if (isSelf) {
            createRoomPromise = createRoom(createRoomOptions);
        } else {
            // Create a boring room and try to invite the targets manually.
            createRoomPromise = createRoom(createRoomOptions).then(roomId => {
                return inviteMultipleToRoom(roomId, targetIds);
            }).then(result => {
                if (this._shouldAbortAfterInviteError(result)) {
                    return true; // abort
                }
            });
        }

        // the createRoom call will show the room for us, so we don't need to worry about that.
        createRoomPromise.then(abort => {
            if (abort === true) return; // only abort on true booleans, not roomIds or something
            this.props.onFinished();
        }).catch(err => {
            console.error(err);
            this.setState({
                busy: false,
                errorText: _t("We couldn't create your DM. Please check the users you want to invite and try again."),
            });
        });
    };

    _inviteUsers = () => {
        const startTime = CountlyAnalytics.getTimestamp();
        this.setState({busy: true});
        this._convertFilter();
        const targets = this._convertFilter();
        const targetIds = targets.map(t => t.userId);

        const room = MatrixClientPeg.get().getRoom(this.props.roomId);
        if (!room) {
            console.error("Failed to find the room to invite users to");
            this.setState({
                busy: false,
                errorText: _t("Something went wrong trying to invite the users."),
            });
            return;
        }

        inviteMultipleToRoom(this.props.roomId, targetIds).then(result => {
            CountlyAnalytics.instance.trackSendInvite(startTime, this.props.roomId, targetIds.length);
            if (!this._shouldAbortAfterInviteError(result)) { // handles setting error message too
                this.props.onFinished();
            }
        }).catch(err => {
            console.error(err);
            this.setState({
                busy: false,
                errorText: _t(
                    "We couldn't invite those users. Please check the users you want to invite and try again.",
                ),
            });
        });
    };

    _transferCall = async () => {
        this._convertFilter();
        const targets = this._convertFilter();
        const targetIds = targets.map(t => t.userId);
        if (targetIds.length > 1) {
            this.setState({
                errorText: _t("A call can only be transferred to a single user."),
            });
        }

        this.setState({busy: true});
        try {
            await this.props.call.transfer(targetIds[0]);
            this.setState({busy: false});
            this.props.onFinished();
        } catch (e) {
            this.setState({
                busy: false,
                errorText: _t("Failed to transfer call"),
            });
        }
    };

    _onKeyDown = (e) => {
        if (this.state.busy) return;
        const value = e.target.value.trim();
        const hasModifiers = e.ctrlKey || e.shiftKey || e.metaKey;
        if (!value && this.state.targets.length > 0 && e.key === Key.BACKSPACE && !hasModifiers) {
            // when the field is empty and the user hits backspace remove the right-most target
            e.preventDefault();
            this._removeMember(this.state.targets[this.state.targets.length - 1]);
        } else if (value && e.key === Key.ENTER && !hasModifiers) {
            // when the user hits enter with something in their field try to convert it
            e.preventDefault();
            this._convertFilter();
        } else if (value && e.key === Key.SPACE && !hasModifiers && value.includes("@") && !value.includes(" ")) {
            // when the user hits space and their input looks like an e-mail/MXID then try to convert it
            e.preventDefault();
            this._convertFilter();
        }
    };

    onChangeFilter = (ev: React.MouseEvent<HTMLInputElement>) => {
        ev.stopPropagation();
        if (!directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)) return;
        const eventTarget = ev.currentTarget;
        let filterByNameEvent = eventTarget.parentNode.textContent.includes("Name");
        let filterByFavoriteEvent = eventTarget.parentNode.textContent.includes("Favorite");
        if (filterByFavoriteEvent) {
            this.setState({
                favoriteFilterIsSelected: !this.state.favoriteFilterIsSelected
            });
        }
        if (!this.state.favoriteFilterIsSelected) {
            let favorite = this.state.favorites;
            let filteredFavoriteResults = [];
                filteredFavoriteResults = this.state.serverResultsMixin.filter(m => m.user.favorite);
            this.setState({
                serverResultsMixin: filteredFavoriteResults,
                favoriteFilterIsSelected: true,
                suggestions: [],
                recents: []
            })
        } else if (filterByNameEvent) {
            let filteredDisplayNameResults = this.state.serverResultsMixin.filter(m => m.user.name.indexOf(this.state.filterText) !== -1);
            this.setState({
                serverResultsMixin: filteredDisplayNameResults,
                suggestions: [],
                recents: []
            })
        }
    }

    /**
     * Brings paginated records from backend
     * @param {currentPageNumber} The current page number
    */
    onChangePage(currentPageNumber: number) {
      //  console.log("Page of items", currentPageNumber);
        if (!this.state.serverResultsMixin || !this.state.filterText) return;
        const param = `&sortOrder=ascending&pageSize=${config.numberOfRecordsToShowInSearch}&page=${currentPageNumber-1}`;
        const searchTerm = this.state.filterText + param;
        return this._updateDirectorySearchFromAPI(searchTerm);
    }

    _onClearSearchResult = () => {
        if (!directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)) return null;
        this.setState({
            serverResultsMixin: [],
            numOfRecordsDisplayed: 0,
            numOfRecordsFromSearchAPI: 0,
            filterText: "",
            errorText: null
        });
    }

    /**
     * Used by directory search functionality in service, role and people search by switching api based on search context
    */
    _updateFavoritesForCurrentUser() {
        // Find favorites from relevant api (roles / services)
        // get user id
        directoryService.getFavoritesForCurrentUser(this.props.kind)
	    .then(response => {
            if (!response.errorText) {
                this.setState({
                    favorites: response.favorites
                });
            } else {
                this.setState(response);
            }
		})
    };

    _updateDirectorySearchFromAPI = async (term: string) => {
        // If search keyword is less than 2 string then display error below searchbox and do not call api
        if (term.length <= 1) {
            this.setState({
                errorText: _t("Search keyword needs to be at least of two characters."),
                serverResultsMixin: []
            })
            return null;
        } else {
            this.setState({
                errorText: null
            })
        };

        /**
         * Search for matching records with keyword
         */
        directoryService.getMatchingRecords(term, this.props.kind)
            .then(response => {
                if (!response) {
                    this.setState({
                        displayNoResultText: true
                    })
                    return;
                }
                if (!response.errorText) {
                    // Note these are set to collections by map function
                    let display_name;
                    let user_id;
                    let role_category;
                    let long_name;
                    let short_name;
                    let personIsLoggedIn;
                    let personIsActive;
                    let roleIsActive = false;
                    let user;
                    let job_title;
                    let mappedServerSearchResults = [];
                    let memberIsFavorite = false;
                    response.results.map((value) => {
                        display_name = value.display_name;
                        user_id = value.user_id;
                        role_category = value.role_category;
                        roleIsActive = value.roleIsActive;
                        job_title = value.job_title ?? null;
                        memberIsFavorite = (this.state.favorites.indexOf(value.user_id) !== -1) ?? false;
                        long_name = value.long_name;
                        short_name = value.short_name;
                        personIsLoggedIn = value.loggedIn ?? false;
                        personIsActive = value.active ?? false;

                        /**
                         * Create a Directory member with data collected for role/user/service/.. directories from api response
                         * based on directory search context.
                         */
                        user = new DirectoryMember({
                            user_id: user_id,
                            display_name: display_name,
                            avatar_url: '',
                            available: value.roleIsActive ?? null,
                            roleCategoryId: role_category ?? null,
                            longName: long_name ?? null,
                            shortName: short_name ?? null,
                            jobTitle: job_title ?? null,
                            favorite: memberIsFavorite ?? false,
                            personIsLoggedIn: (personIsLoggedIn !== undefined) ? value.loggedIn : false,
                            personIsActive: (personIsActive !== undefined) ? value.active : false,
                        });

                        /**
                         * ServerResultMixin in state expects object to be of type (user, user_id) so this approach is going to
                         * update nested object of directoryMember as user, and user_id as user_id and make a collection of
                         * user data in state
                         */
                        mappedServerSearchResults.push(new Object({ user, user_id: user_id }));
                    });

                    // update server result mixin(search result) in state
                    if (response.results.length > 0) {
                        this.setState({
                            numOfRecordsFromSearchAPI: response.numOfRecordsFromSearchAPI,
                            serverResultsMixin: mappedServerSearchResults,
                            displayNoResultText: false,
                            recents: [],
                            suggestions: []
                        });
                    } else {
                        this.setState({
                            numOfRecordsFromSearchAPI: response.numOfRecordsFromSearchAPI
                        });
                    }

                    // if filter by favorite is selected, and user tries to search favorite only
                    if (response.results.length > 0 && this.state.favoriteFilterIsSelected) {
                        const serverResults = this.state.serverResultsMixin;
                        let filteredByFavoriteResults = [];
                        for (let fav in this.state.favorites) {
                            filteredByFavoriteResults = serverResults.filter(m => m.user.name.indexOf(fav) !== -1);
                        }
                        this.setState({
                            serverResultsMixin: filteredByFavoriteResults,
                            recents: [],
                            suggestions: []
                        });
                    }
                } else {
                    this.setState({
                        serverResultsMixin: [],
                        errorText: response.errorText
                    }); // clear results because it's moderately fatal
                }
            })
    };

    _updateSuggestions = async (term) => {
        directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) ?  this._updateDirectorySearchFromAPI(term):
        MatrixClientPeg.get().searchUserDirectory({term}).then(async r => {
            if (term !== this.state.filterText) {
                // Discard the results - we were probably too slow on the server-side to make
                // these results useful. This is a race we want to avoid because we could overwrite
                // more accurate results.
                return;
            }

            if (!r.results) r.results = [];

            // While we're here, try and autocomplete a search result for the mxid itself
            // if there's no matches (and the input looks like a mxid).
            if (term[0] === '@' && term.indexOf(':') > 1) {
                try {
                    const profile = await MatrixClientPeg.get().getProfileInfo(term);
                    if (profile) {
                        // If we have a profile, we have enough information to assume that
                        // the mxid can be invited - add it to the list. We stick it at the
                        // top so it is most obviously presented to the user.
                        r.results.splice(0, 0, {
                            user_id: term,
                            display_name: profile['displayname'],
                            avatar_url: profile['avatar_url'],
                        });
                    }
                } catch (e) {
                    console.warn("Non-fatal error trying to make an invite for a user ID");
                    console.warn(e);

                    // Add a result anyways, just without a profile. We stick it at the
                    // top so it is most obviously presented to the user.
                    r.results.splice(0, 0, {
                        user_id: term,
                        display_name: term,
                        avatar_url: null,
                    });
                }
            }

            this.setState({
                serverResultsMixin: r.results.map(u => ({
                    userId: u.user_id,
                    user: new DirectoryMember(u),
                })),
            });
        }).catch(e => {
            console.error("Error searching user directory:");
            console.error(e);
            this.setState({serverResultsMixin: []}); // clear results because it's moderately fatal
        });

        // Whenever we search the directory, also try to search the identity server. It's
        // all debounced the same anyways.
        if (!this.state.canUseIdentityServer) {
            // The user doesn't have an identity server set - warn them of that.
            this.setState({tryingIdentityServer: true});
            return;
        }
        if (term.indexOf('@') > 0 && Email.looksValid(term) && SettingsStore.getValue(UIFeature.IdentityServer)) {
            // Start off by suggesting the plain email while we try and resolve it
            // to a real account.
            this.setState({
                // per above: the userId is a lie here - it's just a regular identifier
                threepidResultsMixin: [{user: new ThreepidMember(term), userId: term}],
            });
            try {
                const authClient = new IdentityAuthClient();
                const token = await authClient.getAccessToken();
                if (term !== this.state.filterText) return; // abandon hope

                const lookup = await MatrixClientPeg.get().lookupThreePid(
                    'email',
                    term,
                    undefined, // callback
                    token,
                );
                if (term !== this.state.filterText) return; // abandon hope

                if (!lookup || !lookup.mxid) {
                    // We weren't able to find anyone - we're already suggesting the plain email
                    // as an alternative, so do nothing.
                    return;
                }

                // We append the user suggestion to give the user an option to click
                // the email anyways, and so we don't cause things to jump around. In
                // theory, the user would see the user pop up and think "ah yes, that
                // person!"
                const profile = await MatrixClientPeg.get().getProfileInfo(lookup.mxid);
                if (term !== this.state.filterText || !profile) return; // abandon hope
                this.setState({
                    threepidResultsMixin: [...this.state.threepidResultsMixin, {
                        user: new DirectoryMember({
                            user_id: lookup.mxid,
                            display_name: profile.displayname,
                            avatar_url: profile.avatar_url
                        }),
                        userId: lookup.mxid,
                    }],
                });
            } catch (e) {
                console.error("Error searching identity server:");
                console.error(e);
                this.setState({threepidResultsMixin: []}); // clear results because it's moderately fatal
            }
        }
    };

    _updateFilter = (e) => {
        const term = e.target.value;
        this.setState({filterText: term});

        // Debounce server lookups to reduce spam. We don't clear the existing server
        // results because they might still be vaguely accurate, likewise for races which
        // could happen here.
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        this._debounceTimer = setTimeout(() => {
            this._updateSuggestions(term);
        }, 150); // 150ms debounce (human reaction time + some)
    };

    _showMoreRecents = () => {
        this.setState({numRecentsShown: this.state.numRecentsShown + INCREMENT_ROOMS_SHOWN});
    };

    _showMoreSuggestions = () => {
        this.setState({numSuggestionsShown: this.state.numSuggestionsShown + INCREMENT_ROOMS_SHOWN});
    };

    _toggleMember = (member: Member) => {
        let filterText = this.state.filterText;
        const targets = this.state.targets.map(t => t); // cheap clone for mutation
        const idx = targets.indexOf(member);
        if (idx >= 0) {
            targets.splice(idx, 1);
        } else {
            targets.push(member);
            filterText = ""; // clear the filter when the user accepts a suggestion
        }
        this.setState({targets, filterText});

        if (this._editorRef && this._editorRef.current) {
            this._editorRef.current.focus();
        }
    };

    _toggleMemberFavorite = () => {
        this._updateDirectorySearchFromAPI(this.state.filterText);
    }

    _removeMember = (member: Member) => {
        const targets = this.state.targets.map(t => t); // cheap clone for mutation
        const idx = targets.indexOf(member);
        if (idx >= 0) {
            targets.splice(idx, 1);
            this.setState({targets});
        }

        if (this._editorRef && this._editorRef.current) {
            this._editorRef.current.focus();
        }
    };

    _onPaste = async (e) => {
        if (this.state.filterText) {
            // if the user has already typed something, just let them
            // paste normally.
            return;
        }

        // Prevent the text being pasted into the input
        e.preventDefault();

        // Process it as a list of addresses to add instead
        const text = e.clipboardData.getData("text");
        const possibleMembers = [
            // If we can avoid hitting the profile endpoint, we should.
            ...this.state.recents,
            ...this.state.suggestions,
            ...this.state.serverResultsMixin,
            ...this.state.threepidResultsMixin,
        ];
        const toAdd = [];
        const failed = [];
        const potentialAddresses = text.split(/[\s,]+/).map(p => p.trim()).filter(p => !!p); // filter empty strings
        for (const address of potentialAddresses) {
            const member = possibleMembers.find(m => m.userId === address);
            if (member) {
                toAdd.push(member.user);
                continue;
            }

            if (address.indexOf('@') > 0 && Email.looksValid(address)) {
                toAdd.push(new ThreepidMember(address));
                continue;
            }

            if (address[0] !== '@') {
                failed.push(address); // not a user ID
                continue;
            }

            try {
                const profile = await MatrixClientPeg.get().getProfileInfo(address);
                const displayName = profile ? profile.displayname : null;
                const avatarUrl = profile ? profile.avatar_url : null;
                toAdd.push(new DirectoryMember({
                    user_id: address,
                    display_name: displayName,
                    avatar_url: avatarUrl
                }));
            } catch (e) {
                console.error("Error looking up profile for " + address);
                console.error(e);
                failed.push(address);
            }
        }

        if (failed.length > 0) {
            const QuestionDialog = sdk.getComponent('dialogs.QuestionDialog');
            Modal.createTrackedDialog('Invite Paste Fail', '', QuestionDialog, {
                title: _t('Failed to find the following users'),
                description: _t(
                    "The following users might not exist or are invalid, and cannot be invited: %(csvNames)s",
                    {csvNames: failed.join(", ")},
                ),
                button: _t('OK'),
            });
        }

        this.setState({targets: [...this.state.targets, ...toAdd]});
    };

    _onClickInputArea = (e) => {
        // Stop the browser from highlighting text
        e.preventDefault();
        e.stopPropagation();

        if (this._editorRef && this._editorRef.current) {
            this._editorRef.current.focus();
        }
    };

    _onUseDefaultIdentityServerClick = (e) => {
        e.preventDefault();

        // Update the IS in account data. Actually using it may trigger terms.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useDefaultIdentityServer();
        this.setState({canUseIdentityServer: true, tryingIdentityServer: false});
    };

    _onManageSettingsClick = (e) => {
        e.preventDefault();
        dis.fire(Action.ViewUserSettings);
        this.props.onFinished();
    };

    _onCommunityInviteClick = (e) => {
        this.props.onFinished();
        showCommunityInviteDialog(CommunityPrototypeStore.instance.getSelectedCommunityId());
    };

    _renderSection(kind: "recents"|"suggestions") {
        let sourceMembers = kind === 'recents' ? this.state.recents : this.state.suggestions;
        let showNum = kind === 'recents' ? this.state.numRecentsShown : this.state.numSuggestionsShown;
        const showMoreFn = kind === 'recents' ? this._showMoreRecents.bind(this) : this._showMoreSuggestions.bind(this);
        const lastActive = (m) => kind === 'recents' ? m.lastActive : null;
        let sectionName = kind === 'recents' ? _t("Recent Conversations") : _t("Suggestions");
        let sectionSubname = null;

        if (kind === 'suggestions' && CommunityPrototypeStore.instance.getSelectedCommunityId()) {
            const communityName = CommunityPrototypeStore.instance.getSelectedCommunityName();
            sectionSubname = _t("May include members not in %(communityName)s", {communityName});
        }

        if (this.props.kind === KIND_INVITE) {
            sectionName = kind === 'recents' ? _t("Recently Direct Messaged") : _t("Suggestions");
        }

        if (directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)) {
            if(this.state.numOfRecordsFromSearchAPI > 0){
                sectionName = 'Search Results';
            }
        }

        // Mix in the server results if we have any, but only if we're searching. We track the additional
        // members separately because we want to filter sourceMembers but trust the mixin arrays to have
        // the right members in them.
        let priorityAdditionalMembers = []; // Shows up before our own suggestions, higher quality
        let otherAdditionalMembers = []; // Shows up after our own suggestions, lower quality
        const hasMixins = this.state.serverResultsMixin || this.state.threepidResultsMixin;
        if (this.state.filterText && hasMixins && kind === 'suggestions') {
            // We don't want to duplicate members though, so just exclude anyone we've already seen.
            // The type of u is a pain to define but members of both mixins have the 'userId' property
            const notAlreadyExists = (u: any): boolean => {
                return !sourceMembers.some(m => m.userId === u.userId)
                    && !priorityAdditionalMembers.some(m => m.userId === u.userId)
                    && !otherAdditionalMembers.some(m => m.userId === u.userId);
            };

            otherAdditionalMembers = this.state.serverResultsMixin.filter(notAlreadyExists);
            priorityAdditionalMembers = this.state.threepidResultsMixin.filter(notAlreadyExists);
        }
        const hasAdditionalMembers = priorityAdditionalMembers.length > 0 || otherAdditionalMembers.length > 0;

        // Hide the section if there's nothing to filter by
        if (sourceMembers.length === 0 && !hasAdditionalMembers) return null;

        // Do some simple filtering on the input before going much further. If we get no results, say so.
        if (this.state.filterText) {
            const filterBy = this.state.filterText.toLowerCase();
            sourceMembers = sourceMembers
                .filter(m => m.user.name.toLowerCase().includes(filterBy) || m.userId.toLowerCase().includes(filterBy));

            /**
             * No matter if user was previously invited, seen, in people, service, role search we want to see every result
             * that comes from API by overriding matrix default filtering mechanism which filters based on  priority member,
             * and removes already seen (duplicate member)
             */
                if (directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)) {
                otherAdditionalMembers = [];
                sourceMembers = this.state.serverResultsMixin;
            }

            if (sourceMembers.length === 0 && !hasAdditionalMembers) {
                return (
                    <div className='mx_InviteDialog_section'>
                        <h3>{sectionName}</h3>
                        <p>{_t("No results")}</p>
                    </div>
                );
            }
        }

        // Now we mix in the additional members. Again, we presume these have already been filtered. We
        // also assume they are more relevant than our suggestions and prepend them to the list.
        sourceMembers = [...priorityAdditionalMembers, ...sourceMembers, ...otherAdditionalMembers];

        if (this.state.favoriteFilterIsSelected) {
            sourceMembers = sourceMembers.filter(m => m.user.favorite);
        }


        // sort sourceMembers before displaying in UI, sort alphabetically
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
        // https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
        if (directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) && config.sortAlphabeticallyInAscendingOrder) {
            sourceMembers = sourceMembers.sort((a, b) => {
                const nameA = a.user.name.toLowerCase();
                const nameB = b.user.name.toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            })
        }

        // If we're going to hide one member behind 'show more', just use up the space of the button
        // with the member's tile instead.
        if (showNum === sourceMembers.length - 1) showNum++;

        // .slice() will return an incomplete array but won't error on us if we go too far
        const toRender = sourceMembers.slice(0, showNum);
        const hasMore = toRender.length < sourceMembers.length;

        const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
        let showMore = null;
        if (hasMore) {
            showMore = (
                config.show_matrix_based_paginator &&
                <AccessibleButton onClick={showMoreFn} kind="link">
                    {_t("Show more")}
                </AccessibleButton>
            );
        }

        const tiles = toRender.map(r => (
            <DMRoomTile
                member={r.user}
                lastActiveTs={lastActive(r)}
                key={r.userId}
                onToggle={this._toggleMember}
                highlightWord={this.state.filterText}
                isSelected={this.state.targets.some(t => t.userId === r.userId)}
                isAvailable={r.user.available || false}
                roleCategoryId={r.user.roleCategoryId || null}
                currentUserFavorite={this.state.favorites}
                kind={this.props.kind}
                error={this.state.errorText}
                onToggleFavorite={this._toggleMemberFavorite}
            />
        ));
        return (
            <div className='mx_InviteDialog_section'>
                <h3>{sectionName}</h3>
                {sectionSubname ? <p className="mx_InviteDialog_subname">{sectionSubname}</p> : null}
                {tiles}
                {showMore}
            </div>
        );
    }

    _renderEditor() {
        const targets = this.state.targets.map(t => (
            <DMUserTile member={t} onRemove={!this.state.busy && this._removeMember} key={t.userId} />
        ));
        const input = (
            <input
                type="text"
                onKeyDown={this._onKeyDown}
                onChange={this._updateFilter}
                value={this.state.filterText}
                ref={this._editorRef}
                onPaste={this._onPaste}
                autoFocus={true}
                disabled={this.state.busy}
                autoComplete="off"
                placeholder={config.directory ? _t("Please enter a keyword to search in directory."): null}
            />
        );

        let clearButton = (
            (config.directory && this.state.filterText) ?
            <AccessibleButton
                tabIndex={0}
                title={_t("Clear search")}
                className="mx_directorySearch_clearButton"
                onClick={this._onClearSearchResult.bind(this)}
            />: null
        );

        let searchIcon = (
            config.directory ?
                <div className='mx_RoomSearch_icon' /> : null
        );

        return (
            <div className='mx_InviteDialog_editor' onClick={this._onClickInputArea}>
                {searchIcon}
                {targets}
                {input}
                {clearButton}
            </div>
        );
    }

    _renderIdentityServerWarning() {
        if (!this.state.tryingIdentityServer || this.state.canUseIdentityServer ||
            !SettingsStore.getValue(UIFeature.IdentityServer)
        ) {
            return null;
        }

        const defaultIdentityServerUrl = getDefaultIdentityServerUrl();
        if (defaultIdentityServerUrl) {
            return (
                <div className="mx_AddressPickerDialog_identityServer">{_t(
                    "Use an identity server to invite by email. " +
                    "<default>Use the default (%(defaultIdentityServerName)s)</default> " +
                    "or manage in <settings>Settings</settings>.",
                    {
                        defaultIdentityServerName: abbreviateUrl(defaultIdentityServerUrl),
                    },
                    {
                        default: sub => <a href="#" onClick={this._onUseDefaultIdentityServerClick}>{sub}</a>,
                        settings: sub => <a href="#" onClick={this._onManageSettingsClick}>{sub}</a>,
                    },
                )}</div>
            );
        } else {
            return (
                <div className="mx_AddressPickerDialog_identityServer">{_t(
                    "Use an identity server to invite by email. " +
                    "Manage in <settings>Settings</settings>.",
                    {}, {
                        settings: sub => <a href="#" onClick={this._onManageSettingsClick}>{sub}</a>,
                    },
                )}</div>
            );
        }
    }

    _renderClearSearchButton() {
        if(!directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)) return null;
        return <div className='mx_InvitedDialog_clearButton'>
            <AccessibleButton onClick={this._onClearSearchResult} kind='primary_sm' style={{backgroundColor: 'grey'}}>
                <span>Clear All</span>
            </AccessibleButton>
        </div>
    }

    _renderFilterOptions() {
        if(!directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)) return null;
        return <div className="mx_InvitedDialog_filterOptions">
            <p>Filter by:</p>
            {config.filter_by_displayName_in_directory &&
            <StyledMenuItemCheckbox
                onClose={null}
                onChange={this.onChangeFilter.bind(this)}
                checked={null}
                className="filter-search-by-name">
                Name
           </StyledMenuItemCheckbox>}
           <StyledMenuItemCheckbox
                onClose={null}
                onChange={this.onChangeFilter.bind(this)}
                checked={null}
                className="filter-search-by-favorite">
                Favorites Only
           </StyledMenuItemCheckbox>
        </div>

    }

    _renderRecordCount() {
        /**
         * if it is not role, service, people directory search wont display record count
         *  as matrix currently does not have it switched on for InviteDialog
         */
        if (!directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind)) return null;
        // number of records displayed
        let displayedMemberTiles = document.getElementsByClassName("mx_InviteDialog_roomTile").length;
        this.setState({
            numOfRecordsDisplayed: displayedMemberTiles
        })
        let numOfRecordsDisplayed;
        if (displayedMemberTiles > 0) {
            numOfRecordsDisplayed = this.state.numOfRecordsDisplayed || displayedMemberTiles;
        }
        let numOfTotalRecords = this.state.numOfRecordsFromSearchAPI;
        if (numOfRecordsDisplayed > numOfTotalRecords) return null;
        if (numOfRecordsDisplayed < 1 || this.state.numOfRecordsFromSearchAPI < 1) return null;
        if (this.state.favoriteFilterIsSelected) {
            numOfRecordsDisplayed = this.state.serverResultsMixin.length;
        };
        return <div className="mx_InvitedDialog_totalRecords">
            {(numOfRecordsDisplayed > 1) &&
                <p>
                    Showing {numOfRecordsDisplayed} records of total {numOfTotalRecords} records.
                </p>}
        </div>
    }

    _renderDirectoryPaginator() {
        if (this.state.favoriteFilterIsSelected || !this.state.filterText || this.state.errorText
            || this.state.numOfRecordsFromSearchAPI <= this.state.serverResultsMixin.length) return null;
        const Pagination = sdk.getComponent("views.elements.Pagination");
        return <>
            <Pagination items={this.state.serverResultsMixin}
                onChangePage={this.onChangePage.bind(this)}
                numOfTotalRecords={this.state.numOfRecordsFromSearchAPI}
                pageSize={config.numberOfRecordsToShowInSearch} />
        </>
    }

    _renderNoResultsText() {
        let noResultInformationText;
        if (this.state.errorText || this.state.displayNoResultText || !this.state.filterText) return null;
        if (this.state.favoriteFilterIsSelected && this.state.serverResultsMixin.length < 1) {
            noResultInformationText = <h4>{_t("You do not have any favorites at the moment. No results found while conducting favorite search with your credentials.")}</h4>
        } else if (this.state.serverResultsMixin.length < 1 && this.state.filterText) {
            noResultInformationText = <h4>{_t("Directory search did not retrieve any results at the moment. Please enter a valid keyword and try again.")}</h4>
        } else {
            noResultInformationText = '';
        }
        return noResultInformationText;
    }

    render() {
        const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
        const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
        const Spinner = sdk.getComponent("elements.Spinner");

        let spinner = null;
        if (this.state.busy) {
            spinner = <Spinner w={20} h={20} />;
        }


        let title;
        let helpText;
        let buttonText;
        let goButtonFn;

        const identityServersEnabled = SettingsStore.getValue(UIFeature.IdentityServer);

        const userId = MatrixClientPeg.get().getUserId();
        if (this.props.kind === KIND_DM) {
            title = _t("Direct Messages");

            if (identityServersEnabled) {
                helpText = _t(
                    "Start a conversation with someone using their name, email address or username (like <userId/>).",
                    {},
                    {userId: () => {
                        return (
                            <a href={makeUserPermalink(userId)} rel="noreferrer noopener" target="_blank">{userId}</a>
                        );
                    }},
                );
            } else {
                helpText = _t(
                    "Start a conversation with someone using their name or username (like <userId/>).",
                    {},
                    {userId: () => {
                        return (
                            <a href={makeUserPermalink(userId)} rel="noreferrer noopener" target="_blank">{userId}</a>
                        );
                    }},
                );
            }

            if (CommunityPrototypeStore.instance.getSelectedCommunityId()) {
                const communityName = CommunityPrototypeStore.instance.getSelectedCommunityName();
                const inviteText = _t(
                    "This won't invite them to %(communityName)s. " +
                    "To invite someone to %(communityName)s, click <a>here</a>",
                    {communityName}, {
                        userId: () => {
                            return (
                                <a
                                    href={makeUserPermalink(userId)}
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >{userId}</a>
                            );
                        },
                        a: (sub) => {
                            return (
                                <AccessibleButton
                                    kind="link"
                                    onClick={this._onCommunityInviteClick}
                                >{sub}</AccessibleButton>
                            );
                        },
                    },
                );
                helpText = <React.Fragment>
                    { helpText } {inviteText}
                </React.Fragment>;
            }
            buttonText = _t("Go");
            goButtonFn = this._startDm;
        } else if (this.props.kind === KIND_INVITE) {
            const room = MatrixClientPeg.get()?.getRoom(this.props.roomId);
            const isSpace = room?.isSpaceRoom();
            title = isSpace
                ? _t("Invite to %(spaceName)s", {
                    spaceName: room.name || _t("Unnamed Space"),
                })
                : _t("Invite to this room");

            let helpTextUntranslated;
            if (isSpace) {
                if (identityServersEnabled) {
                    helpTextUntranslated = _td("Invite someone using their name, email address, username " +
                        "(like <userId/>) or <a>share this space</a>.");
                } else {
                    helpTextUntranslated = _td("Invite someone using their name, username " +
                        "(like <userId/>) or <a>share this space</a>.");
                }
            } else {
                if (identityServersEnabled) {
                    helpTextUntranslated = _td("Invite someone using their name, email address, username " +
                        "(like <userId/>) or <a>share this room</a>.");
                } else {
                    helpTextUntranslated = _td("Invite someone using their name, username " +
                        "(like <userId/>) or <a>share this room</a>.");
                }
            }

            helpText = _t(helpTextUntranslated, {}, {
                userId: () =>
                    <a href={makeUserPermalink(userId)} rel="noreferrer noopener" target="_blank">{userId}</a>,
                a: (sub) =>
                    <a href={makeRoomPermalink(this.props.roomId)} rel="noreferrer noopener" target="_blank">{sub}</a>,
            });

            buttonText = _t("Invite");
            goButtonFn = this._inviteUsers;
        } else if (this.props.kind === KIND_CALL_TRANSFER) {
            title = _t("Transfer");
            buttonText = _t("Transfer");
            goButtonFn = this._transferCall;
        } else if (this.props.kind === directoryService.KIND_ROLE_DIRECTORY_SEARCH) {
            title = config.role_directory.name;
            buttonText = "Start Discussion";
            goButtonFn = this._startDm;
            helpText = <React.Fragment>
                {config.role_directory_description}
            </React.Fragment>
        } else if (this.props.kind === directoryService.KIND_PEOPLE_DIRECTORY_SEARCH) {
            title = config.people_directory.name;
            buttonText = "Start Discussion";
            goButtonFn = this._startDm;
            helpText = <React.Fragment>
                {config.people_directory.feature_description}
            </React.Fragment>
        } else if (this.props.kind === directoryService.KIND_SERVICE_DIRECTORY_SEARCH) {
            title = config.service_directory.name;
            helpText = <React.Fragment>
                {config.service_directory.feature_description}
            </React.Fragment>
        } else {
            console.error("Unknown kind of InviteDialog: " + this.props.kind);
        }

        const hasSelection = this.state.targets.length > 0
            || (this.state.filterText && this.state.filterText.includes('@'));
        return (
            <BaseDialog
                className='mx_InviteDialog'
                hasCancel={true}
                onFinished={this.props.onFinished}
                title={title}
            >
                <div className='mx_InviteDialog_content'>
                    <p className='mx_InviteDialog_helpText'>{helpText}</p>
                    <div className='mx_InviteDialog_addressBar'>
                        {this._renderEditor()}
                        {(this.props.kind !== directoryService.KIND_SERVICE_DIRECTORY_SEARCH) &&
                        <div className='mx_InviteDialog_buttonAndSpinner'>
                            <AccessibleButton
                                kind="primary"
                                onClick={goButtonFn}
                                className='mx_InviteDialog_goButton'
                                disabled={this.state.busy || !hasSelection}
                            >
                                {buttonText}
                            </AccessibleButton>
                            {spinner}
                        </div>}
                    </div>
                    {this._renderIdentityServerWarning()}
                    <div className='error' style={{margin: '10px auto'}}>{this.state.errorText}</div>
                    <div className="mx_InvitedDialog_buttonAndFilter">
                    {this._renderClearSearchButton()}
                    {this._renderFilterOptions()}
                    </div>

                    <div className='mx_InviteDialog_userSections'>
                        {this._renderDirectoryPaginator()}
                        {/* {this._renderRecordCount()} */}
                        {this._renderNoResultsText()}
                        {!directoryService.searchIsOnRoleOrPeopleOrServiceDirectory(this.props.kind) ?
                        this._renderSection('recents')
                        : null}
                        {this._renderSection('suggestions')}
                    </div>
                </div>
            </BaseDialog>
        );
    }
}
