let account = null;

// Storing the value of Contract Abi and Contract Address in a variable
const ABI = {};
const CONTRACT_ADDRESS = "";

async function connectWalletAdmin() {
    if (window.ethereum) {
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        document.getElementById('content').style.display = "none";

        const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
        let accounts = await web3.eth.getAccounts();
        account = accounts[0];
        document.getElementById('wallet-address').textContent = account;
        contract.methods.owner().call().then((result) => {
            if (result == account) {
                document.getElementById('content').style.display = "flex";
                document.getElementById('not-admin').classList.add('d-none');
            }
            else {
                document.getElementById('not-admin').classList.remove('d-none');
            }
        })
    }
}

async function submit() {
    // Making the instance for the contract deployed with (abi = ABI , address = CONTRACT_ADDRESS)
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    // Storing the input values of Name , Roll No, Cgpa in the variables
    let can_name = document.getElementById('contestant-name').value;
    let can_rollno = document.getElementById('contestant-roll-no').value;
    let can_cgpa = Math.round(document.getElementById('contestant-cgpa').value * 100);

    // Start of loading Spinner for Add Candidate Function
    document.getElementById('spinner').style.display = "inline-block";
    document.querySelectorAll('.container')[0].style.opacity = "0.5";
    
    // Removing the Error box
    document.getElementById('not-admin').classList.add('d-none');
    
    // Calling addCandidate Function from Contract
    await contract.methods.addCanditate(can_name, can_rollno, can_cgpa).send({ from: account })
    .then(()=>{
        document.querySelectorAll('.container')[0].style.opacity = "1";
        alert("Added new Candidate");
    }).catch((error)=>{
        // Throwing the Error if candidate is Already Registered
        console.error(error);

        document.querySelectorAll('.container')[0].style.opacity = "1";

        // Displaying the Error Box
        document.getElementById('not-admin').classList.remove('d-none');
        
        // Catching the Error if User rejected the Transaction
        if(error.message == "MetaMask Tx Signature: User denied transaction signature."){
          console.log("Transaction Rejected by Admin")
          document.getElementById('not-admin').textContent = "Transaction Rejected !!";
        }

        // Catcching the Error if Candidate is Already Registered
        else{
          document.getElementById('not-admin').textContent = "Candidate Already Registered";
        }
    })

    document.querySelectorAll('.container')[0].style.opacity = "1";
    // End of loading Spinner for Add Candidate Function
    document.getElementById('spinner').style.display = "none";
}


document.getElementById('btn-add').addEventListener('click', () => {
    // Making some Changes in the frontend styling
    document.getElementById('btn-add').classList.add('btn-back');
    document.getElementById('btn-win').classList.remove('btn-back');
    document.getElementById('winner').style.display = "none";
    document.getElementsByClassName("add-contestant")[0].style.display = "flex";
})



document.getElementById('btn-win').addEventListener('click', () => {
    // Making some Changes in the frontend styling
    document.getElementById('btn-win').classList.add('btn-back');
    document.getElementById('btn-add').classList.remove('btn-back');
    document.getElementById('winner').style.display = "flex";
    document.getElementsByClassName("add-contestant")[0].style.display = "none";

    // Making the instance for the contract deployed with (abi = ABI , address = CONTRACT_ADDRESS)
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    // Calling of Winner Function from Contract
    contract.methods.winner().call().then((result)=>{

        // Displaying the name of the Winner
        document.getElementById('win').textContent = result.name;
    }).catch((error)=>{
        console.log(error);
    })
})
