import "../App.css";

function Logo({setPage, transfer}) {
    const handleLogoClick = () => {
        if (transfer === "/") {
            window.location.href = '/?landing=' + Date.now();
            return;
        }

        if (typeof transfer === "string" && transfer.startsWith("/")) {
            window.location.assign(transfer);
            return;
        }

        if (typeof setPage === "function") {
            setPage(transfer);
        }
    };

    return (
        <div className="logo" onClick={handleLogoClick}>
            <p className="logo__icon">W</p>
            <h1 className="logo">Wrap<span className="highlight">Go</span></h1>
        </div>
    );
}

export default Logo;