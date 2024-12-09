import {DeviceInfoType} from 'edilkamin';

const DeviceDetails = ({info}: { info: DeviceInfoType }) => (
    <ul>
        <li>board: {info.status.temperatures.board}&deg;</li>
        <li>environment: {info.status.temperatures.enviroment}&deg;</li>
        <li>
            environment_1_temperature:{" "}
            {info.nvm.user_parameters.enviroment_1_temperature}
            &deg;
        </li>
        <li>
            environment_2_temperature:{" "}
            {info.nvm.user_parameters.enviroment_2_temperature}
            &deg;
        </li>
        <li>
            environment_3_temperature:{" "}
            {info.nvm.user_parameters.enviroment_3_temperature}
            &deg;
        </li>
        <li>is_auto: {String(info.nvm.user_parameters.is_auto)}</li>
        <li>is_sound_active: {String(info.nvm.user_parameters.is_sound_active)}</li>
    </ul>
);

export default DeviceDetails;
