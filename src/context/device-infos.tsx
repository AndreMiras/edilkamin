import {createContext, Dispatch, FunctionComponent, ReactNode, SetStateAction, useContext} from 'react';
import {DeviceInfoType} from 'edilkamin';
import {useDeviceInfos} from '../utils/storage';

const DeviceInfosContext = createContext<DeviceInfoType|null>(null);
const SetDeviceInfosContext = createContext<Dispatch<SetStateAction<DeviceInfoType|null>>>(
    (value) => {
        // console.log('Default function:', value);
    }
);
export function useDeviceInfosContext() {
    return useContext(DeviceInfosContext);
}

export function useSetDeviceInfosContext() {
    return useContext(SetDeviceInfosContext);
}

const DeviceInfosContextProvider: FunctionComponent<{ children: ReactNode }> = ({
    children,
}) => {
    const [infos, setInfos] = useDeviceInfos();

    return (
        <DeviceInfosContext.Provider value={infos}>
            <SetDeviceInfosContext.Provider value={setInfos}>
                {children}
            </SetDeviceInfosContext.Provider>
        </DeviceInfosContext.Provider>
    );
};

export default DeviceInfosContextProvider;
