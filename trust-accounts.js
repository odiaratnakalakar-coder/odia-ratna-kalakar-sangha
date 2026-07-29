// ===============================
// Trust Accounts JS - Part 2A
// Firebase Setup
// ===============================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
  


const transactionForm = document.getElementById("transactionForm");
const transactionTable = document.getElementById("transactionTable");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const accountsRef = collection(db, "trustAccounts");

// Load Transactions
async function loadTransactions() {

    const snapshot = await getDocs(accountsRef);

    transactionTable.innerHTML = "";

    let income = 0;
    let expense = 0;
    let sl = 1;

    snapshot.forEach((item)=>{

        const data = item.data();

        if(data.type==="Income"){
            income += Number(data.amount);
        }else{
            expense += Number(data.amount);
        }

        transactionTable.innerHTML += `
        <tr>
            <td>${sl++}</td>
            <td>${data.date}</td>
            <td>${data.type}</td>
            <td>${data.category}</td>
            <td>₹${data.amount}</td>
            <td>${data.payment}</td>
            <td>${data.person}</td>
            <td>
                <button onclick="deleteTransaction('${item.id}')">
                Delete
                </button>
            </td>
        </tr>`;
    });

    totalIncome.innerHTML = "₹" + income;
    totalExpense.innerHTML = "₹" + expense;
    balance.innerHTML = "₹" + (income - expense);

}

loadTransactions();
// ===============================
// Part 2B
// Add Transaction + Delete
// ===============================

// Save Transaction
transactionForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;

    const amount =
        document.querySelector('input[type="number"]').value;

    const description =
        document.querySelector('input[placeholder="Description"]').value;

    const payment =
        document.querySelectorAll("select")[2].value;

    const person =
        document.querySelector('input[placeholder="Collected / Paid By"]').value;

    if (
        !date ||
        !amount ||
        !person
    ) {
        alert("Please fill all required fields.");
        return;
    }

    try {

        await addDoc(accountsRef, {

            date,
            type,
            category,
            amount: Number(amount),
            description,
            payment,
            person,
            createdAt: serverTimestamp()

        });

        alert("Transaction Saved Successfully ✅");

        transactionForm.reset();

        loadTransactions();

    } catch (error) {

        console.error(error);

        alert("Error : " + error.message);

    }

});


// Delete Transaction

window.deleteTransaction = async function(id){

    if(!confirm("Delete this transaction?")){
        return;
    }

    try{

        await deleteDoc(doc(db,"trustAccounts",id));

        loadTransactions();

        alert("Transaction Deleted");

    }catch(error){

        console.log(error);

        alert(error.message);

    }

}
// ===============================
// Part 2C
// Edit + Search + Live Refresh
// ===============================

// Auto Refresh every 5 seconds
setInterval(() => {
    loadTransactions();
}, 5000);

// Search Transactions
const searchBox = document.querySelector(".search input");

searchBox.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    const rows = document.querySelectorAll("#transactionTable tr");

    rows.forEach((row) => {

        const text = row.innerText.toLowerCase();

        if (text.includes(value)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

// Edit Transaction
window.editTransaction = async function(id){

    const newAmount = prompt("Enter New Amount");

    if(newAmount === null) return;

    try{

        await updateDoc(
            doc(db, "trustAccounts", id),
            {
                amount: Number(newAmount)
            }
        );

        alert("Transaction Updated Successfully");

        loadTransactions();

    }catch(error){

        console.error(error);

        alert(error.message);

    }

};
