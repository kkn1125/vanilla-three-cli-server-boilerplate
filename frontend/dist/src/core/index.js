import Web3D from "./module/web3d";
import Socket from "./module/socket";

window.addEventListener("load", () => {
  Promise.all([new Web3D(), new Socket()]).then((result) => {
    console.log(result);
  });
});
