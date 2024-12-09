import React, {ReactElement} from 'react';
import {useRouter} from 'next/router';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFireFlameCurved} from '@fortawesome/free-solid-svg-icons'
import {faGithubAlt} from '@fortawesome/free-brands-svg-icons'
import {Button, Container, Nav, Navbar, NavbarBrand, NavLink} from 'react-bootstrap';

import {useTranslation, withTranslation} from 'next-i18next';
import {useIsLoggedIn} from '../utils/hooks';
import Login from './Login';
import Logout from './Logout';

const Header = ({locale, prefixPath}: {locale: string, prefixPath: boolean}): ReactElement => {
    const router = useRouter()
    const [t] = useTranslation('common');

    const onToggleLanguageClick = (newLocale: string) => {
        const {pathname, asPath, query} = router
        router.push({pathname, query}, asPath, {locale: newLocale})
    }

    return (
        <Navbar bg="dark" variant="dark" expand="sm">
            <Container>
                <NavbarBrand href={router.basePath ? router.basePath : `/${prefixPath ? locale : ''}`}>
                    <FontAwesomeIcon icon={faFireFlameCurved}/> Edilkamin
                </NavbarBrand>
                <Navbar.Toggle/>
                <Navbar.Collapse>
                    <Nav className="mr-auto">
                        <NavLink href="https://github.com/AndreMiras/edilkamin">
                            <FontAwesomeIcon icon={faGithubAlt}/> {t('about')}
                        </NavLink>
                    </Nav>
                </Navbar.Collapse>
                <Button className="me-1" onClick={() => onToggleLanguageClick('en')}>en</Button>
                <Button className="me-1" onClick={() => onToggleLanguageClick('fr')}>fr</Button>
                {useIsLoggedIn() === true ? (
                    <div className="ms-auto">
                        <Logout/>
                    </div>
                ) : (
                    <Login/>
                )}
            </Container>
        </Navbar>
    );
}

export default withTranslation()(Header);
