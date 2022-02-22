import { Link } from "react-router-dom";
// TODO:
// This is currently hardcoded.
// I suspect there's no API for fetching fireplaces.
// Instead bluetooth is used to fetch the MAC addresses and this is then stored
// to a local database.
const fireplaces = ["aabbccddeeff", "112233445566"];

const Home = (): JSX.Element => (
  <>
    Home
    <ul>
      {fireplaces.map((mac) => (
        <li key={mac}>
          <Link to={`/fireplaces/${mac}`}>{mac}</Link>
        </li>
      ))}
    </ul>
  </>
);

export default Home;
