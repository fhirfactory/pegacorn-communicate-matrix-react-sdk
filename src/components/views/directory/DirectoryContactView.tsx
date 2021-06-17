import React from 'react';
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
                    <AccessibleTooltipButton
                        className="mx_DirectoryContactView_button mx_DirectoryContactView_voiceCallButton"
                        onClick={() => this.props.onCallPlaced(PlaceCallType.Voice)}
                        title={_t("Voice call")}
                        style={directoryButtonBackgroundColor} />

            videoCallButton =
                    <AccessibleTooltipButton
                        className="mx_DirectoryContactView_button mx_DirectoryContactView_videoCallButton"
                        onClick={(ev) => this.props.onVideoCallPlaced(
                            ev.shiftKey ? PlaceCallType.ScreenSharing : PlaceCallType.Video)}
                        title={_t("Video call")}
                        style={directoryButtonBackgroundColor} />

            startChatButton =
                    <AccessibleTooltipButton
                        className="mx_DirectoryContactView_button mx_DirectoryContactView_explorePrompt_startChat"
                        onClick={(ev) => this.onChatOptionSelected()}
                        title={_t("Chat")}
                        style={directoryButtonBackgroundColor} />
            errorText = this.state.error ? <span style={{ color: 'red' }}>{this.state.error || 'Feature not implemented yet.'}</span>: null;
        }

        return <div className="mx_DirectoryContactView_wrapper">
            {errorText}
            {!this.searchIsOnServiceDirectory() && startChatButton}
            {!this.searchIsOnServiceDirectory() && videoCallButton}
            {voiceCallButton}
        </div>
    }
}

export default DirectoryContactView;
