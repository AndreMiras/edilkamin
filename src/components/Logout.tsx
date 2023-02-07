import {Button} from "react-bootstrap";
import {useLogout} from "../utils/hooks";
import {useTranslation} from "next-i18next";

const Logout = (): JSX.Element => {
    const [t] = useTranslation('common');

    // TODO: ideally hit the backend to invalidate the token too
    const logout = useLogout();
    const onLogoutClick = (e: React.MouseEvent<HTMLElement>): void => logout();

    return (
        <Button type="submit" onClick={onLogoutClick}>
            {t('logout')}
        </Button>
    );
};

export default Logout;
