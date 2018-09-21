let abi = [
    {
      "constant": true,
      "inputs": [],
      "name": "ownershipEnabled",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "name": "owner",
          "type": "address"
        },
        {
          "name": "token",
          "type": "address"
        },
        {
          "name": "weiPerToken",
          "type": "uint256"
        }
      ],
      "name": "setAccount",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferAccountOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "accounts",
      "outputs": [
        {
          "name": "owner",
          "type": "address"
        },
        {
          "name": "token",
          "type": "address"
        },
        {
          "name": "weiPerToken",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "relinquishOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "address"
        },
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "pendingDonations",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_accountCreator",
          "type": "address"
        }
      ],
      "name": "setAccountCreator",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "name": "weiPerToken",
          "type": "uint256"
        }
      ],
      "name": "setAccountWeiPerToken",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "accountCreator",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Donation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "PendingDonation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "PendingDonationCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "PendingDonationRefunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "nameHash",
          "type": "bytes32"
        }
      ],
      "name": "AccountSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "oldOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "AccountOwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "name": "weiPerToken",
          "type": "uint256"
        }
      ],
      "name": "AccountWeiPerTokenSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "oldCreator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "newCreator",
          "type": "address"
        }
      ],
      "name": "AccountCreatorChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "OwnershipRelinquished",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "nameHash",
          "type": "bytes32"
        }
      ],
      "name": "donate",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "nameHashes",
          "type": "bytes32[]"
        },
        {
          "name": "values",
          "type": "uint256[]"
        }
      ],
      "name": "donateToMany",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "name": "donors",
          "type": "address[]"
        }
      ],
      "name": "withdrawPendingDonations",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "nameHash",
          "type": "bytes32"
        },
        {
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "refundPendingDonation",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

export default abi
