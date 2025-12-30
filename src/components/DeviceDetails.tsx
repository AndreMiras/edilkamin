import { DeviceInfoType } from "edilkamin";

import DetailRow from "./DetailRow";

interface ExtendedNvm {
  user_parameters: {
    enviroment_1_temperature: number;
    enviroment_2_temperature: number;
    enviroment_3_temperature: number;
    is_auto: boolean;
    is_sound_active: boolean;
  };
  installer_parameters?: {
    enviroment_1_input?: number;
    enviroment_2_input?: number;
    enviroment_3_input?: number;
  };
}

const DeviceDetails = ({ info }: { info: DeviceInfoType }) => {
  const nvm = info.nvm as ExtendedNvm;

  // Check which zones are active (default to showing zone 1, hiding 2/3)
  const zone1Active = nvm.installer_parameters?.enviroment_1_input !== 0;
  const zone2Active = (nvm.installer_parameters?.enviroment_2_input ?? 0) > 0;
  const zone3Active = (nvm.installer_parameters?.enviroment_3_input ?? 0) > 0;

  return (
    <div className="space-y-4">
      {/* Temperature Readings Section */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Temperature Readings
        </h4>
        <div className="space-y-1">
          <DetailRow
            label="Environment"
            value={`${info.status.temperatures.enviroment}°`}
          />
          <DetailRow
            label="Board"
            value={`${info.status.temperatures.board}°`}
          />
        </div>
      </div>

      {/* Target Temperatures Section */}
      <div className="border-t border-border pt-3">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Target Temperatures
        </h4>
        <div className="space-y-1">
          {zone1Active && (
            <DetailRow
              label="Zone 1"
              value={`${info.nvm.user_parameters.enviroment_1_temperature}°`}
            />
          )}
          {zone2Active && (
            <DetailRow
              label="Zone 2"
              value={`${info.nvm.user_parameters.enviroment_2_temperature}°`}
            />
          )}
          {zone3Active && (
            <DetailRow
              label="Zone 3"
              value={`${info.nvm.user_parameters.enviroment_3_temperature}°`}
            />
          )}
        </div>
      </div>

      {/* Device Settings Section */}
      <div className="border-t border-border pt-3">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Device Settings
        </h4>
        <div className="space-y-1">
          <DetailRow
            label="Auto Mode"
            value={String(info.nvm.user_parameters.is_auto)}
          />
          <DetailRow
            label="Sound"
            value={String(info.nvm.user_parameters.is_sound_active)}
          />
        </div>
      </div>
    </div>
  );
};

export default DeviceDetails;
