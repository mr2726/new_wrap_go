import "../../App.css";

import TopMenu from "../../Components/TopMenu";

function Billing({ setFleetPage }) {
    return (
        <div className="billing">
            <TopMenu sendto="" setFleetPage={setFleetPage} />
            <div className="dashboard__content">
                <h1 className="title">Billing</h1>
                <p className="description">Here you can manage your billing information, view invoices, and update your payment method.</p>
            </div>
        </div>
    );
}

export default Billing;