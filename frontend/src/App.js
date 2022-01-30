// https://hackerthemes.com/bootstrap-themes/demo/neon-glow/

import * as React from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./abi/MicroLottery.json";

export default function App() {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [totalParticipations, setTotalParticipations] = React.useState(0);
  const [allParticipations, setAllParticipations] = React.useState([]);

  const contractABI = abi.abi;
  const contractAddress = process.env.REACT_APP_ML_CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error(
      "Environment variable REACT_APP_ML_CONTRACT_ADDRESS must be set."
    );
  }

  async function checkIfWalletIsConnected() {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function connectWallet() {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  async function participation() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const microLotteryContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Execute the actual participation from your smart contract
         */
        const participationTxn = await microLotteryContract.participate({
          value: 1000000000000000,
          gasLimit: 300000,
        });
        console.log("Mining...", participationTxn.hash);

        await participationTxn.wait();
        console.log("Mined -- ", participationTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function onNewParticipation(id) {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const microLotteryContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      let state = allParticipations;
      const p = await microLotteryContract.getParticipationById(id);
      state[id] = {
        participant: p.participant,
        timestamp: new Date(p.timestamp * 1000),
        win: p.state,
        potBalance: p.potBalance.toString(),
      };
      setAllParticipations(state);
      setTotalParticipations(state.length);
    }
  }

  async function getParticipations() {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const microLotteryContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllParticipations method from your Smart Contract
         */
        const uncleanParticipations =
          await microLotteryContract.getAllParticipations();

        for (var i in uncleanParticipations) {
          let p = uncleanParticipations[i];
          allParticipations[i] = {
            participant: p.participant,
            timestamp: new Date(p.timestamp * 1000),
            win: p.state,
            potBalance: p.potBalance.toNumber(),
          };
          setAllParticipations(allParticipations);
          setTotalParticipations(allParticipations.length);
        }

        microLotteryContract.on("NewParticipation", onNewParticipation);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  checkIfWalletIsConnected();
  getParticipations();
  /*
   * This runs our function when the page loads.
   */
  React.useEffect(() => {}, []);

  return (
    <>
      <div className="jumbotron bg-transparent mb-0 radius-0">
        <div className="container">
          <div className="row">
            <div className="col-xl-3"></div>
            <div className="col-xl-6">
              <h1 className="display-1 text-center">
                It's <span className="vim-caret">YOUR</span> turn!!
              </h1>

              {/*
               * If there is no currentAccount render this button
               */}
              {!currentAccount && (
                <button
                  className="btn btn-primary btn-shadow btn-block"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
              {currentAccount && (
                <>
                  <p>Total Participations {totalParticipations}</p>
                  <button
                    className="btn btn-primary btn-shadow btn-block"
                    onClick={participation}
                  >
                    Participate
                  </button>
                </>
              )}
            </div>

            <div className="col-xl-3"></div>
            <div className="container">
              <div className="row flex-column-reverse mt-4">
                {allParticipations.map((participation, index) => {
                  return (
                    <div key={index} className="col-xl-12">
                      <div className="card border-primary mt-3 mb-3 text-center">
                        <div className="card-header">
                          Address: {participation.participant}
                        </div>
                        <div className="card-body">
                          <blockquote className="card-blockquote">
                            <p>ParticipationId: {index}</p>
                            <p>Time: {participation.timestamp.toString()}</p>
                            <p>
                              Sate:{" "}
                              {participation.win === 0
                                ? "WAITING_FOR_RESULT"
                                : participation.win === 1
                                ? "WIN"
                                : "LOSS"}
                            </p>
                            <p>potBalance: {participation.potBalance}</p>
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <script
          src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
          integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
          crossOrigin="anonymous"
        ></script>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
          integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
          crossOrigin="anonymous"
        ></script>
        <script
          src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
          integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM"
          crossOrigin="anonymous"
        ></script>
      </div>
    </>
  );
}
