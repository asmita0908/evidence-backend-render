const Web3 = require("web3");

const web3 = new Web3("http://127.0.0.1:7545"); // Ganache

const contractABI = [
  {
    "inputs": [
      {"internalType":"string","name":"hash","type":"string"}
    ],
    "name":"storeEvidence",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  }
];

const contractAddress = "0x5546C2bE94B4cf00d6117192f40fC37Abb4dB911";

const contract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = { web3, contract };
