import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  doc
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
        <td>
<button onclick="deleteTransaction('donations','${doc.id}')">
Delete
</button>
</td>
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
        <td>
<button onclick="deleteTransaction('expenses','${doc.id}')">
Delete
</button>
</td>
      </tr>
    `;
  });

}

loadTransactions();
document.getElementById("transactionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const payment = document.getElementById("payment").value;
  const by = document.getElementById("by").value;

  const data = {
    amount,
    createdAt: serverTimestamp()
  };

  try {

    if (type === "Income") {

      await addDoc(collection(db, "donations"), {
        ...data,
        name: by,
        purpose: description || category
      });

    } else {

      await addDoc(collection(db, "expenses"), {
        ...data,
        note: by,
        purpose: description || category
      });

    }

    alert("Transaction Saved Successfully");

    document.getElementById("transactionForm").reset();

    loadDashboard();
    loadTransactions();

  } catch (err) {
    alert(err.message);
  }

});
async function deleteTransaction(collectionName, id) {

  if (!confirm("ଏହି Transaction କୁ Delete କରିବେ?")) return;

  try {
    await deleteDoc(doc(db, collectionName, id));

    alert("Transaction Deleted Successfully");

    loadDashboard();
    loadTransactions();

  } catch (error) {
    alert(error.message);
  }
}

window.deleteTransaction = deleteTransaction;
