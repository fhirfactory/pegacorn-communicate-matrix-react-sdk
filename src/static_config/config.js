//This file is to be analogous to the buildsettings swift file in the iOS app
//each setting should be designed such that a missing / default value will lead to the default matrix behavior. That is to say, each *change* should be triggered by a truthy value, as null and undefined are falsy

export const composerSettings = {
    disable_send_stickers: true,
};
export const roomHeaderSettings = {
    disable_manage_integrations: true,
};
export const settingsPaneSettings = {
    general: {
        disable_integration_manager: true,
        disable_password_change: true,
        disable_email_editing: true,
        disable_phone_editing: true,
        disable_display_name_editing: true,
        disable_language_selection: true, //default can be changed in src/settings/Settings.ts
        disable_account_deactivation: true,
        disable_identity_server_changes: true,
    },
    appearance: {
        disable_font_scaling_settings: true,
        disable_theme_settings: true,
        disable_advanced_settings: true,
        move_compact_layout_out_of_advanced: true,
    },
    flair: {
        disable_flair_tab: true,
    },
    preferences: {
        disabled_composer_settings: ["MessageComposerInput.autoReplaceEmoji", "sendTypingNotifications"],
        disabled_timeline_settings: [
            "TextualBody.enableBigEmoji",
            "showTypingNotifications",
            "showReadReceipts",
            "alwaysShowTimestamps",
            "showTwelveHourTimestamps",
            "enableSyntaxHighlightLanguageDetection",
            "showRedactions",
            "showJoinLeaves",
            "showAvatarChanges",
            "showDisplaynameChanges",
            "showImages",
        ],
        disabled_advanced_settings: [
        ],
        disable_advanced_settings: true,
    },
    notifications: {
        hidden_notification_rules: [
            '.m.rule.contains_display_name',
            '.m.rule.contains_user_name',
            '.m.rule.roomnotif',
            '.m.rule.room_one_to_one',
            '.m.rule.encrypted_room_one_to_one',
            '.m.rule.message',
            '.m.rule.encrypted',
            '.m.rule.invite_for_me',
            //'im.vector.rule.member_event',
            '.m.rule.call',
            '.m.rule.suppress_notices',
            '.m.rule.tombstone',
        ],
    },
    voice_and_video: {
        disable_mirror_video_feed: true,
        disable_allow_peer_to_peer: true,
        disable_allow_fallback_call_server: true,
    },
    security: {
        disable_session_editing: true,
        disable_crypto_menu: true,
        disable_key_backup_menu: true,
        disable_cross_signing_menu: true,
        disable_analytics_menu: true,
        disable_indexing_menu: true,
    },
    about: {
        disable_bug_reporting_menu: true,
        disable_update_button: true,
        disable_bot_button: true,
        hide_olm_version: true,
        hide_access_token: true,
    },
};
export const userMenuSettings = {
    disable_feedback_option: true,
};
