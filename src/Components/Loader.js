import "../App.css";
import Logo from "./Logo";

function Loader() {
    return (
        <div className="loader__overlay">
            <Logo />
            <div className="loader__spinner"></div>
        </div>
    );
}

export default Loader;
