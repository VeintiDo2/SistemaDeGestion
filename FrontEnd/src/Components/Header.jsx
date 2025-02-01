import CajeroCajaDinero from "./CajeroComponents/CajeroCajaDinero";
import CajeroCancelar from "./CajeroComponents/CajeroCancelar";

import VendedorFacturacion from "./VendedorComponents/VendedorFacturacion";

const Header = ({ optionsHeader, setModo, setUserOption, rol }) => {

    const selectOptions = [
        { id: 5, text: "Cancelar / Cajero", component: <CajeroCancelar></CajeroCancelar> },
        { id: 6, text: "Informes / Cajero", component: <CajeroCajaDinero></CajeroCajaDinero> },
        { id: 7, text: "Facturación / Vendedor", component: <VendedorFacturacion></VendedorFacturacion> },
    ];

    const handleClickModoMenu = (selected) => {
        setModo(selected);
        setUserOption(false);
    };

    const handleSelectChange = (event) => {
        const selectedOption = selectOptions.find(option => option.id === parseInt(event.target.value));
        if (selectedOption) {
            handleClickModoMenu(selectedOption.component);
        }
    };

    const selectAdmin = (rol) => {

        if (rol == "Administrador") {
            return (
                <select defaultValue="" onChange={handleSelectChange} className="headerSelect">
                    <option value="" disabled >Seleccione una opción</option>
                    {selectOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.text}
                        </option>
                    ))}
                </select>
            )
        } else {
            return null;
        }
    }

    return (
        <header className="header">
            <div className="navigatorBar">
                {optionsHeader.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleClickModoMenu(option.component)}
                        className="headerButton">
                        {option.text}
                    </button>
                ))}

                {selectAdmin(rol)}
            </div>
        </header>
    );
};

export default Header;
