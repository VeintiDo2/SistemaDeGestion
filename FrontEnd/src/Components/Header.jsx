import AdminAñadirUsuarios from "./AdministradorComponents/AdminAñadirUsuarios"
import AdminAjustesUsuarios from "./AdministradorComponents/AdminAjustesUsuarios"

const Header = ({ setModo }) => {

    const handleClickModoMenu = (selected) => {
        setModo(selected)
    }

    return (
        <header className="header">
            <div className="navigatorBar">
                <button className="headerButton" onClick={() => handleClickModoMenu(<AdminAñadirUsuarios></AdminAñadirUsuarios>)} >Añadir Usuarios</button>
                <button className="headerButton" onClick={() => handleClickModoMenu(<AdminAjustesUsuarios></AdminAjustesUsuarios>)} >Modificar/Eliminar</button>
            </div>
        </header>
    )
}

export default Header;