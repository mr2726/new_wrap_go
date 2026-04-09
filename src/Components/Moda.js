import "../App.css";
import { MdCheckCircleOutline } from "react-icons/md";


function Modal ({data, setModalOpen}) {
    return (
        <div className="modal">
            <div className="modal__content">
                <div className="modal__icon"> <MdCheckCircleOutline fontSize={50} /></div>
                <h2 className="modal__title">{data.title}</h2>
                <p className="modal__text">{data.description}</p>
                <button className="modal__close-button" onClick={() => setModalOpen(false)}>{data.btn}</button>
                <p className="modal__sesurity">{data.security}</p>
            </div>
        </div>
    );
}

export default Modal;