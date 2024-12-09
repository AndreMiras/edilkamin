import {Button} from 'react-bootstrap';

import {useLogout} from '../utils/hooks';
import {useTranslation} from 'next-i18next';
import {ReactElement} from "react";

const Logout = (): ReactElement => {
    const [t] = useTranslation('common');

    // TODO: ideally hit the backend to invalidate the token too
    const logout = useLogout();
    const onLogoutClick = (): void => logout();

    return (
        <Button variant="primary" type="submit" onClick={onLogoutClick}>
            {t('logout')}
        </Button>
    );
};

export default Logout;
