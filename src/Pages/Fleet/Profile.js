import "../../App.css";
import TopMenu from "../../Components/TopMenu";
import { FaRegUser, FaPhoneAlt } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";




function Profile({ setFleetPage }) {
    


  return (
    <div className="Profile">
        <TopMenu sendto="dashboard" setFleetPage={setFleetPage} />

        <h1 className="title">Fleet Profile</h1>
        <p className="description">Here you can manage your fleet profile, update your information, and customize your settings.</p>
        <div className="profile_content">
            <div className="profile__block">
                <div className="profile__block--item">
                    <div style={{display: "flex", gap: "1em"}}>
                        <FaRegUser size={15} color="#94A3B8"/>
                        <p>Full Name</p>
                    </div>
                    <input type="text" value="Joe Doe" className="editable_input"/>
                </div>

                <div className="profile__block--item">
                    <div style={{display: "flex", gap: "1em"}}>
                        <MdAlternateEmail size={15} color="#94A3B8"/>
                        <p>Email</p>
                    </div>
                    <input type="email" value="joe.doe@example.com" className="editable_input"/>
                </div>

                <div className="profile__block--item">
                    <div style={{display: "flex", gap: "1em"}}>
                        <FaPhoneAlt size={15} color="#94A3B8"/>
                        <p>Phone</p>
                    </div>
                    <input type="text" value="+1 234 567 890" className="editable_input"/>
                </div>
                <button className="save_btn cta">Save Changes</button>
            </div>
        </div>
    </div>
  );
}

export default Profile;