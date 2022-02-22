import { useParams } from "react-router-dom";

const Fireplace = (): JSX.Element => {
  const { mac } = useParams<"mac">();
  return <>Fireplace: {mac}</>;
};

export default Fireplace;
