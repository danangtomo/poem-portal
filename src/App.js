import React, { useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/PoemPortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const [inputText, setInputText] = useState(null);

  const [allpoems, setAllpoems] = useState([]);

  const contractAddress = "0x494254231c473Cffb4001DCcfa43a2d62711bAcD";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Make sure your have metamask");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        console.log("Found an authorized account:", accounts[0]);
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      alert("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputText = (e) => {
    setInputText(e.target.value);
  };

  const poem = async (e) => {
    e.preventDefault();
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const poemPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await poemPortalContract.getTotalPoems();
        //console.log("Retrieved total poem count...", count.toNumber());

        const poemTxn = await poemPortalContract.poem(inputText, {
          gasLimit: 300000,
        });
        // eslint-disable-next-line no-undef
        inputMessage.value = null;
        //console.log("Mining...", poemTxn.hash);

        await poemTxn.wait();
        alert(`Tx hash : ${poemTxn.hash}`);

        count = await poemPortalContract.getTotalPoems();
        //console.log("Retrieved total poem count...", count.toNumber());
      } else {
        console.log("Ethereum object doesnt exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getAllpoems = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const poemPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const poems = await poemPortalContract.getAllPoems();

        const poemsCleaned = poems.map((poem) => {
          return {
            address: poem.poemr,
            timestamp: new Date(poem.timestamp * 1000),
            message: poem.message,
          };
        });

        setAllpoems(poemsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <h2 className="headline">Sugeng Rawuh 😊</h2>
        </div>

        <div className="bio">
          <h4>
            Aplikasi Prasaja Kagem Nyerat Puisi Lan Nyimpen Ing Blockchain 📜✍️
          </h4>
        </div>

        <form class="form" onSubmit={poem}>
          <textarea
            id="inputMessage"
            placeholder="serat ing ngriki"
            className="inputArea"
            onChange={handleInputText}
            required
          ></textarea>
          <button className="sendPoemButton" type="submit">
            ✉️ Kintun
          </button>
        </form>

        {currentAccount === "" && (
          <button className="connectButton" onClick={connectWallet}>
            Sambungkan alamat {<FaEthereum />}
          </button>
        )}
      </div>
    </div>
  );
}
