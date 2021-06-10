import React, { useEffect } from 'react';
import { toPx } from "../../../utils/units";
import PropTypes from 'prop-types';


/**
 * This view renders favorite icon or unfavorite white icon with dark borders depending upon if that
 * feature is switched on. 'displayOnHover' controls whether or not to display additional text
 * 'make it favorite' or 'not make it favorite'. This view can be further expanded into doing additional
 * depending on different aspects of UI how we want favorite to be rendered or controlled.
 */
interface IProps {
    isFavorite: boolean;
    searchContext: string;
    height: number;
    width: number;
    onHover: boolean;
    onToggle;
}

const Favorite = (props: IProps) => {

    const {
        isFavorite,
        searchContext,
        onHover,
        width = 15,
        height = 15,
        //  onClick
    } = props;

    let favoriteIcon;


    // const [initialFavoriteState, newFavoriteState] = useState(false);

    useEffect(() => {
        let initialFavoriteState = props.isFavorite;
        return () => {
            !initialFavoriteState;
        }
    }, [props.isFavorite])

    function onClickFavorite() {
        props.onToggle;
        console.log("Favorite is toggled...", props.onToggle);
    }

    // render favorite or unfavorite given search list.
    favoriteIcon = (
        <span className='mx_InviteDialog_roomTile_favorite'
            onClick={props.onToggle}
            style={{
                float: 'right',
                marginLeft: '10px',
                width: toPx(width),
                height: toPx(height)
            }}
        >
            {isFavorite ?
                <img src={require("../../../../res/img/element-icons/roomlist/favorite.svg")} title="Favorite" alt="favorite icon" />
                : <img src={require("../../../../res/img/element-icons/roomlist/unfavorite.svg")} title="not favorite" alt="favorite icon" />}

            {onHover ? <p className="mx_InviteDialog_favorite_hovor_effect" style={{ display: 'none' }}>Make it favorite</p>
                :
                <p className="mx_InviteDialog_favorite_hovor_effect" style={{ display: 'none' }}>Favorite</p>
            }
        </span>)

    return <>
        {favoriteIcon}
    </>
}

Favorite.propTypes = {
    isAlreadyFavorite: PropTypes.bool,
    searchContext: PropTypes.string,
    displayOnHover: PropTypes.bool,
    height: PropTypes.number,
    width: PropTypes.number
}

export default Favorite;
