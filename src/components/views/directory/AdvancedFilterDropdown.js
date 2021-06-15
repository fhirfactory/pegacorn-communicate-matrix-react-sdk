/*
Copyright 2016 OpenMarket Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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

import React from 'react';
import PropTypes, { string } from 'prop-types';
import {
    ContextMenu,
    useContextMenu,
    ContextMenuButton,
    MenuItemRadio,
    MenuItem,
    MenuGroup,
} from "../../structures/ContextMenu";
import * as sdk from "../../../index";
import { _t } from '../../../languageHandler';

export default class AdvancedFilterDropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filterByShortName: false,
            filterByFavorite: false
        }
    }

    static propTypes = {

    };

    onOptionChange(){
        return;
    }

    render() {

        let options = [
            { label: 'favorite only', value: 'favoriteOnly' },
            { label: 'name', value: 'filterByName' },
            { label: 'Organization', value: 'filterByName' },
        ];

        let option;
        for(let opt in options){
            option = opt.label;
        }

        const Dropdown = sdk.getComponent('elements.Dropdown');

        const filterDropdown = () => {
            return <Dropdown
                id="mx_LanguageDropdown"
                className={this.props.className}
                onOptionChange={this.onOptionChange()}
                searchEnabled={true}
                value={options.map(val => val.value)}
                label={_t("Filter By")}
                disabled={null}
            >
            </Dropdown>
        }

        return <React.Fragment>
            {filterDropdown()}
        </React.Fragment>
    }


}
