import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  
  

  
  


console.log("Trust Accounts Loaded");

async function loadDashboard() {
  try {

    // Total Members
    const memberSnap = await getDocs(collection(db, "members"));
    document.getElementById("members").textContent = memberSnap.size;

    // Total Donation
    const donationSnap = await getDocs(collection(db, "donations"));
    let totalDonation = 0;

    donationSnap.forEach(doc => {
      totalDonation += Number(doc.data().amount || 0);
    });

  document.getElementById("donation").textContent = "₹" + totalDonation;  


    // Total Expense
    const expenseSnap = await getDocs(collection(db, "expenses"));
    let totalExpense = 0;

    expenseSnap.forEach(doc => {
      totalExpense += Number(doc.data().amount || 0);
    });

    document.getElementById("totalExpense").textContent = "₹" + totalExpense;
// Membership Income
let membershipIncome = 0;

memberSnap.forEach(doc => {
  const data = doc.data();
  if (data.paid === true) {
    membershipIncome += Number(data.paymentAmount || 1200);
  }
});

document.getElementById("totalIncome").textContent = "₹" + membershipIncome;

// Current Balance
const balance = membershipIncome + totalDonation - totalExpense;

document.getElementById("balance").textContent = "₹" + balance;

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

loadDashboard();
// Load Transaction History
async function loadTransactions() {

  const table = document.getElementById("transactionTable");
  table.innerHTML = "";

  let sl = 1;

  // Donations
  const donationSnap = await getDocs(collection(db, "donations"));

  donationSnap.forEach(doc => {

    const data = doc.data();

    table.innerHTML += `
      <tr>
        <td>${sl++}</td>
        <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "-"}</td>
        <td>Income</td>
        <td>Donation</td>
        <td>₹${data.amount || 0}</td>
        <td>-</td>
        <td>${data.name || "-"}</td>
        <td>-</td>
      </tr>
    `;
  });

  // Expenses
  const expenseSnap = await getDocs(collection(db, "expenses"));

  expenseSnap.forEach(doc => {

    const data = doc.data();

    table.innerHTML += `
      <tr>
        <td>${sl++}</td>
        <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "-"}</td>
        <td>Expense</td>
        <td>${data.purpose || "-"}</td>
        <td>₹${data.amount || 0}</td>
        <td>-</td>
        <td>${data.note || "-"}</td>
        <td>-</td>
      </tr>
    `;
  });

}

loadTransactions();
