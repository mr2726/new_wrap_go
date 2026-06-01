import "../App.css";
import { signOut } from "../data/service";
import Logo from "./Logo";
import { MdOutlineDashboard, MdAdd, MdOutlineMap,MdBarChart,MdCompareArrows, MdCreditCard, MdOutlineSettings, MdLogout } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";


function SideBar ({data, page, setPage}) {
    const RenderIcons = ({pages}) => {
        switch(pages.id){
            case "overview":
                return <MdOutlineDashboard className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "campaign-builder":
                return <MdAdd className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "live-map":
                return <MdOutlineMap className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "analytics":
                return <MdBarChart className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "vehicles": 
                return <MdCompareArrows className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "billing": 
                return <MdCreditCard className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "settings": 
                return <MdOutlineSettings className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "logout" : 
                return <MdLogout className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            case "contacts":
                return <FaInfoCircle className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
            default:
                return <MdOutlineDashboard className={page === pages.id ? "sidebar__links--link--active--icon" : ""}/>
        }
    }

    const logoutCode = async () => {
        const { error } = await signOut();

        if (error) {
            console.error(error.message);
        }

        setPage("signin");
    };
    return (
        <div className="sidebar">
            <Logo setPage={setPage} transfer="overview" />
            <div className="sidebar__links--space">
                <ul className="sidebar__links">
                    {
                        data.sidebar_pages.map((pages, index) => (
                            <li key={index} onClick={() => setPage(pages.id)} className={page === pages.id ? "sidebar__links--link--active" : ""}>
                                <RenderIcons pages={pages} />
                                <p>{pages.title}</p>
                            </li>
                        ))
                    }
                </ul>
                
                <ul className="sidebar__settings_links">
                    <div className="get_otp__content--underline"></div>
                    {
                        data.sidebar_settings.map((pages, index) => (
                            <li key={index} onClick={async () => {
                                if (pages.id === "logout") {
                                    await logoutCode();
                                } else {
                                    setPage(pages.id);
                                }
                            }}>
                                <RenderIcons pages={pages} />
                                <p>{pages.title}</p>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
}

export default SideBar