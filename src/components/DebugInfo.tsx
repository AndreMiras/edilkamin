import { DeviceInfoType } from "edilkamin";

const DebugInfo = ({ info }: { info: DeviceInfoType | null }) => (
  <pre>{JSON.stringify(info, null, 2)}</pre>
);

export default DebugInfo;
