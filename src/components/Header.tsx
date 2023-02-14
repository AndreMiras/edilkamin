import {useRouter} from "next/router";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button, Container, Nav, Navbar} from "react-bootstrap";
import {useTranslation, withTranslation} from "next-i18next";
import {useIsLoggedIn} from "../utils/hooks";
import Login from "./Login";
import Logout from "./Logout";
import Link from "next/link";

const Header = (): JSX.Element => {
    const router = useRouter()
    const [t] = useTranslation('common');

    const onToggleLanguageClick = (newLocale: string) => {
        const {pathname, asPath, query} = router
        router.push({pathname, query}, asPath, {locale: newLocale})
    }

    return (
        <Navbar bg="dark" variant="dark" expand="sm">
            <Container>
                <Link href="/">
                    <Navbar.Brand href={router.basePath ? router.basePath : '/'}>
                        <FontAwesomeIcon icon={["fas", "fire-flame-curved"]}/> Edilkamin
                    </Navbar.Brand>
                </Link>
                <Navbar.Toggle/>
                <Navbar.Collapse>
                    <Nav className="mr-auto">
                        <Nav.Link href="https://github.com/AndreMiras/edilkamin">
                            <FontAwesomeIcon icon={["fab", "github-alt"]}/> {t('about')}
                        </Nav.Link>
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
