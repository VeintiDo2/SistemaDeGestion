import AdminAñadirUsuarios from "./AdministradorComponents/AdminAñadirUsuarios"
import AdminAjustesUsuarios from "./AdministradorComponents/AdminAjustesUsuarios"
import AdminBitacoraUsuarios from "./AdministradorComponents/AdminBitacoraUsuarios"
import AdminPedidos from "./AdministradorComponents/AdminPedidos"

const Header = ({ setModo, setUserOption }) => {

    const handleClickModoMenu = (selected) => {
        setModo(selected)
        setUserOption(false)
    }

    return (
        <header className="header">
            <div className="navigatorBar">
                <button className="headerButton" onClick={() => handleClickModoMenu(<AdminAñadirUsuarios></AdminAñadirUsuarios>)} >Añadir Usuarios</button>
                <button className="headerButton" onClick={() => handleClickModoMenu(<AdminAjustesUsuarios></AdminAjustesUsuarios>)} >Ajustes de Usuarios</button>
                <button className="headerButton" onClick={() => handleClickModoMenu(<AdminBitacoraUsuarios></AdminBitacoraUsuarios>)} >Bitacora</button>
                <button className="headerButton" onClick={() => handleClickModoMenu(<AdminPedidos></AdminPedidos>)}>Pedidos</button>
            </div>
        </header>
    )
}

export default Header;