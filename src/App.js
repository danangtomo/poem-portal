import React, { useEffect, useState } from "react";
import { FaEthereum } from "react-icons/fa";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/PoemPortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const [inputText, setInputText] = useState(null);

  const [allpoems, setAllpoems] = useState([]);

  const contractAddress = "0xdd66658b2069c83d38966803474288E6fD1D5A6a";
  const contractABI = abi.abi;

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
        const poemportalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await poemportalContract.getTotalpoems();
        //console.log("Retrieved total poem count...", count.toNumber());

        const poemTxn = await poemportalContract.poem(inputText, {
          gasLimit: 300000,
        });
        // eslint-disable-next-line no-undef
        inputMessage.value = null;
        //console.log("Mining...", poemTxn.hash);

        await poemTxn.wait();
        alert(`Tx hash : ${poemTxn.hash}`);

        count = await poemportalContract.getTotalpoems();
        //console.log("Retrieved total poem count...", count.toNumber());
      } else {
        console.log("Ethereum object doesnt exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        const poems = await poemPortalContract.getAllpoems();

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
    let poemPortalContract;

    const onNewpoem = (from, timestamp, message) => {
      //console.log('Newpoem', from, timestamp, message);
      setAllpoems((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      poemPortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      poemPortalContract.on("Newpoem", onNewpoem);
    }

    return () => {
      if (poemPortalContract) {
        poemPortalContract.off("Newpoem", onNewpoem);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Sambungkan alamat {<FaEthereum />}
          </button>
        )}
      </div>
    </div>
  );
}
