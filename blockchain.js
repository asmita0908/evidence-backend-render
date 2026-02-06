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

const contractAddress = "0x662ec88E5d3e17E63A9DFdB426C47529b0AF7EE1S";

const contract = new web3.eth.Contract(contractABI, contractAddress);

module.exports = { web3, contract };
