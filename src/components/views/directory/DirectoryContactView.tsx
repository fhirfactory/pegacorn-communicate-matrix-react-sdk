import React from 'react';
import classNames from 'classnames';
import Analytics from '../../../Analytics';
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import { render } from 'react-dom';
import { video } from 'modernizr';
import * as config from "../../../config";
import PropTypes from 'prop-types';
import { PlaceCallType } from '../../../CallHandler';
import { _t } from '../../../languageHandler';
import * as directoryService from '../../../DirectoryService';

interface IDirectoryButtonProps {
    isDirectorySearch: boolean;
    directorySearchContext: string;
    onCallPlaced;
    onVideoCallPlaced;
    onChatOptionSelected;
}

interface IState {
    onCancelClick: null,
    isBusy: boolean;
    error: any;
}

class DirectoryContactView extends React.Component<IDirectoryButtonProps, IState> {

    static propTypes = {
        room: PropTypes.object,
        oobData: PropTypes.object,
        inRoom: PropTypes.bool,
        onSettingsClick: PropTypes.func,
        onPinnedClick: PropTypes.func,
        onSearchClick: PropTypes.func,
        onLeaveClick: PropTypes.func,
        onCancelClick: PropTypes.func,
        e2eStatus: PropTypes.string,
        onAppsClick: PropTypes.func,
        appsShown: PropTypes.bool,
        onCallPlaced: PropTypes.func, // (PlaceCallType) => void;
    };

    static defaultProps = {
        isBusy: false,
        isDirectorySearch: false,
        onCancelClick: null,
        error: null
    };


    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isBusy: false,
            onCancelClick: null
        }
    }

    componentDidCatch() {
        this.setState({
            error: _t("The call could not be established")
        })
    }

    onChatOptionSelected() {
        this.setState({
            error: _t("This feature is not supported at the moment.")
        })
    }

    // Used not to display voice and video call functionality on service directory
    searchIsOnServiceDirectory = () => {
        if (this.props.directorySearchContext === directoryService.KIND_SERVICE_DIRECTORY_SEARCH) {
            console.log("Show service directory is turned off", this.props.directorySearchContext);
            return true;
        } else {
            return false;
        }
    }

    render() {
        let voiceCallButton;
        let videoCallButton;
        let startChatButton;
        let errorText;

        const directoryButtonBackgroundColor = {
            backgroundColor: 'rgba(0,129,139, 0.1)'
        }

        if (this.props.isDirectorySearch && config.showDirectoryContactViewOnDirectorySearch) {
            voiceCallButton =
                <div className="mx_RoomHeader_contact_wrapper">
                    <AccessibleTooltipButton
                        className="mx_RoomHeader_button mx_RoomHeader_voiceCallButton"
                        onClick={() => this.props.onCallPlaced(PlaceCallType.Voice)}
                        title={_t("Voice call")}
                        style={directoryButtonBackgroundColor} />
                    <span>Voice Call</span>
                </div>

            videoCallButton =
                <div className="mx_RoomHeader_contact_wrapper">
                    <AccessibleTooltipButton
                        className="mx_RoomHeader_button mx_RoomHeader_videoCallButton"
                        onClick={(ev) => this.props.onVideoCallPlaced(
                            ev.shiftKey ? PlaceCallType.ScreenSharing : PlaceCallType.Video)}
                        title={_t("Video call")}
                        style={directoryButtonBackgroundColor} />
                    <span>Video Call</span>
                </div>
            startChatButton =
                <div className="mx_RoomHeader_contact_wrapper">
                    <AccessibleTooltipButton
                        className="mx_RoomHeader_button mx_RoomList_explorePrompt_startChat"
                        onClick={(ev) => this.onChatOptionSelected()}
                        title={_t("Chat")}
                        style={directoryButtonBackgroundColor} />
                    <span>Start Discussion</span>
                </div>
            errorText = <span style={{ color: 'red' }}>Feature not implemented yet.</span> //mx_AccessibleButton mx_AccessibleButton_hasKind mx_AccessibleButton_kind_primary
        }

        return <div className="mx_AuxButton_directoryContactMenu">
            {!this.searchIsOnServiceDirectory() && startChatButton}
            {!this.searchIsOnServiceDirectory() && videoCallButton}
            {voiceCallButton}
            {this.state.error && <span style={{ color: 'red' }}>{this.state.error || ''}</span>}
        </div>
    }
}

export default DirectoryContactView;
