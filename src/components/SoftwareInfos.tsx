import React, {ReactElement} from 'react';
import {Card} from 'react-bootstrap';
import {useTranslation} from 'next-i18next';
import {useDeviceInfosContext} from "../context/device-infos";

const SoftwareInfos = (): ReactElement => {
    const [t] = useTranslation('common');
    const deviceInfos = useDeviceInfosContext();

    return (
        <>
            <Card>
                <Card.Header>
                    {t('motherboard')}
                </Card.Header>
                <Card.Body>
                    <ul>
                        <li>
                            {t('motherboard_board_name')} {deviceInfos?.component_info.motherboard.board_name}
                        </li>
                        <li>
                            {t('motherboard_application_name')} {deviceInfos?.component_info.motherboard.application_name}
                        </li>
                        <li>
                            {t('motherboard_bootloader_version')} {deviceInfos?.component_info.motherboard.bootloader_version}
                        </li>
                        <li>
                            {t('motherboard_bootloader_name')} {deviceInfos?.component_info.motherboard.bootloader_name}
                        </li>
                        <li>
                            {t('motherboard_application_version')} {deviceInfos?.component_info.motherboard.application_version}
                        </li>
                    </ul>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>
                    {t('radio_control')}
                </Card.Header>
                <Card.Body>
                    <ul>
                        <li>
                            {t('radio_control_board_name')} {deviceInfos?.component_info.radio_control.board_name}
                        </li>
                        <li>
                            {t('radio_control_application_name')} {deviceInfos?.component_info.radio_control.application_name}
                        </li>
                        <li>
                            {t('radio_control_bootloader_version')} {deviceInfos?.component_info.radio_control.bootloader_version}
                        </li>
                        <li>
                            {t('radio_control_bootloader_name')} {deviceInfos?.component_info.radio_control.bootloader_name}
                        </li>
                        <li>
                            {t('radio_control_application_version')} {deviceInfos?.component_info.radio_control.application_version}
                        </li>
                    </ul>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>
                    {t('wifi_ble_module')}
                </Card.Header>
                <Card.Body>
                    <ul>
                        <li>
                            {t('wifi_ble_module_board_name')} {deviceInfos?.component_info.wifi_ble_module.board_name}
                        </li>
                        <li>
                            {t('wifi_ble_module_application_name')} {deviceInfos?.component_info.wifi_ble_module.application_name}
                        </li>
                        <li>
                            {t('wifi_ble_module_bootloader_version')} {deviceInfos?.component_info.wifi_ble_module.bootloader_version}
                        </li>
                        <li>
                            {t('wifi_ble_module_bootloader_name')} {deviceInfos?.component_info.wifi_ble_module.bootloader_name}
                        </li>
                        <li>
                            {t('wifi_ble_module_application_version')} {deviceInfos?.component_info.wifi_ble_module.application_version}
                        </li>
                    </ul>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header>
                    {t('emergency_panel')}
                </Card.Header>
                <Card.Body>
                    <ul>
                        <li>
                            {t('emergency_panel_board_name')} {deviceInfos?.component_info.emergency_panel.board_name}
                        </li>
                        <li>
                            {t('emergency_panel_application_name')} {deviceInfos?.component_info.emergency_panel.application_name}
                        </li>
                        <li>
                            {t('emergency_panel_bootloader_version')} {deviceInfos?.component_info.emergency_panel.bootloader_version}
                        </li>
                        <li>
                            {t('emergency_panel_bootloader_name')} {deviceInfos?.component_info.emergency_panel.bootloader_name}
                        </li>
                        <li>
                            {t('emergency_panel_application_version')} {deviceInfos?.component_info.emergency_panel.application_version}
                        </li>
                    </ul>
                </Card.Body>
            </Card>
        </>
    )
};

export default SoftwareInfos;
