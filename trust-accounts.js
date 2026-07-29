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
