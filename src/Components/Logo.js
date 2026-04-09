import "../App.css";

function Logo({setPage, transfer}) {
    return (
        <div className="logo" onClick={() => setPage(transfer)}>
            <p className="logo__icon">W</p>
            <h1 className="logo">Wrap<span className="highlight">Go</span></h1>
        </div>
    );
}

export default Logo;