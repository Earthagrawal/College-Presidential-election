let account = null;

const ABI = {};
const CONTRACT_ADDRESS = "";

async function connectWallet() {
  if (window.ethereum) {
    await window.ethereum.send('eth_requestAccounts');
    window.web3 = new Web3(window.ethereum);

    let accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById('wallet-address').textContent = account;
  }
}

document.getElementById('log-in-button').addEventListener('click', ()=>{
  try {
    // Making the instance for the contract deployed with (abi = ABI , address = CONTRACT_ADDRESS)
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

    // Checking if user has entered Roll NO
    if (document.getElementById('log-in-input').value) {        
        // Making the Content box open when logged in properly
        document.getElementById('contestants').style.display = "flex";

        document.getElementById('log-in-result').classList.add("d-none");

        // Getting an array of structures of candidates
        contract.methods.getArray().call()
        .then((result) => {
          const contestants = result.map((contestant) => {
            return {
              name: contestant.name,
              rollNo: contestant.rollNo,
              cgpa: contestant.cgpa
            }
          });

          // Getting the select element
          const select_ = document.getElementById('contestants-select');
          select_.innerHTML = '';                       // Making the select element Empty
          
          // Appending the option element (Choose a contestant) in the select element 
          const new_option = document.createElement('option');
          new_option.text = "Choose a contestant";
          new_option.value = "";
          select_.appendChild(new_option);

          // Now for Each contestant adding the option in the select
          for(let i=0; i<contestants.length; i++){
                
                // Creating a new option using CreateElement method
                const new_option = document.createElement('option');
                new_option.text = contestants[i].name + "-" + contestants[i].rollNo;
                new_option.value = contestants[i].rollNo;
                select_.appendChild(new_option);
          }
          
        })
    }
    else {
      // Will Execute if user did not enter any value in the Roll No input
      document.getElementById('log-in-result').classList.remove("d-none");
      document.getElementById('log-in-result').textContent = "Enter your Roll No";
    }
  } catch (error) {
    // Catching the Error if the Wallet is Connected or not
    document.getElementById('log-in-result').classList.remove("d-none");
  }
})



function vote(){
  // Making the instance for the contract deployed with (abi = ABI , address = CONTRACT_ADDRESS)
  const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

  // Getting the Select Element
  const select_ = document.getElementById('contestants-select');

  // Start of loading circe for Vote Funtion
  document.getElementsByClassName('container')[0].style.opacity = "0.5";
  document.getElementById('spinner').style.display = "inline-block";
  
  // Calling of vote function from Contract
  contract.methods.vote(select_.options[select_.selectedIndex].value, document.getElementById('log-in-input').value).send({from: account})
  .then(()=>{
    alert('voted');
    
    document.getElementsByClassName('container')[0].style.opacity = "1";
    // End of loading circle for Vote Function
    document.getElementById('spinner').style.display = "none";
  }).catch((error)=>{
    // Catching the Error if the User has Already Voted
    console.error(error);

    // Displaying the Error Box
    document.getElementById('log-in-result').classList.remove("d-none");
    document.getElementsByClassName('container')[0].style.opacity = "1";
    
    // End of loading circle for Vote Function
    document.getElementById('spinner').style.display = "none";

    // Catching the Error if User rejected the Transaction
    if(error.message == "MetaMask Tx Signature: User denied transaction signature."){
      console.log("Transaction Rejected by User")
      document.getElementById('log-in-result').textContent = "Transaction Rejected !!";
    }

    // Catching the Error if User has Already Voted
    else{
      console.log("User Already Voted")
      document.getElementById('log-in-result').textContent = "You Have Already voted !!";
    }
  
  })
}
