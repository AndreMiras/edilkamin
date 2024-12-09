import {useContext} from 'react';
import {useRouter} from 'next/router';
import {TokenContext} from '../context/token';

/**
 * Returns:
 * - true if a token in a valid format is stored
 * - undefined if the application is still loading
 * - false if the token is in an invalid format
 */
const useIsLoggedIn = (): boolean | undefined => {
    const {token} = useContext(TokenContext);
    // application is still loading
    if (token === undefined) {
        return undefined
    }

    return typeof token === 'string' ? token.length > 0 : false;
};

const useLogout = (): (() => void) => {
    const {setToken} = useContext(TokenContext);
    const router = useRouter();

    return () => {
        localStorage.clear();
        setToken(null);
        router.push('/');
    };
};

export {useIsLoggedIn, useLogout};
