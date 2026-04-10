import "../App.css";
import { FaRegUser } from "react-icons/fa";
import { BiSolidFactory } from "react-icons/bi";

function ChangeImage({title, type}) {
    return (
        <div className="change-image">
            <div className="change-image__header">
                <h2 className="change-image__title title">{title}</h2>
                <p className="change-image__description description">Upload a new image to update your profile picture.</p>
            </div>
            <div className="change-image__content">
                <div className="image__">{type === "profile" ? <FaRegUser /> : <BiSolidFactory />}</div>
                <div className="change-image__buttons">
                    <button className="change-image__button change-image__button--upload">Upload New Image</button>
                    <p>JPG, PNG or GIF. Max size 2MB</p>
                </div>
            </div>

        </div>
    );
}

export default ChangeImage;