import socket from "./socket";
import web3d from "./web3d";

const options = {
  socket,
  ...web3d,
};

export default options;
