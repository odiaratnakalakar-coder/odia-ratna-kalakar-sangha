// ===============================
// Trust Accounts JS - Part 1
// ===============================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  
  
  


// Firestore Collection
const accountsRef = collection(db, "trust_accounts");

// Form
const form = document.getElementById("transactionForm");

// Save Transaction
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const transaction = {

            date: document.getElementById("date").value,

            type: document.getElementById("type").value,

            amount: Number(document.getElementById("amount").value),

            description: document.getElementById("description").value,

            paymentMode: document.getElementById("paymentMode").value,

            receiptNumber: document.getElementById("receiptNumber").value,

            collectedBy: document.getElementById("collectedBy").value,

            memberName: document.getElementById("memberName").value,

            mobile: document.getElementById("mobile").value,

            notes: document.getElementById("notes").value,

            createdAt: serverTimestamp()

        };

        await addDoc(accountsRef, transaction);
await loadTransactions();
        alert("✅ Transaction Saved Successfully");

        form.reset();

    } catch (error) {

        console.error(error);

        alert("❌ " + error.message);

    }

});
// ===============================
// Load Transactions
// ===============================

// ===============================
// Load Transactions (Card View)
// ===============================

async function loadTransactions() {

    const container = document.getElementById("transactionCards");

    container.innerHTML = "";

    const q = query(accountsRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    let income = 0;
    let expense = 0;
    let donation = 0;

    if (snapshot.empty) {

        container.innerHTML = `
        <div class="empty-card">
            No Transactions Found
        </div>`;

        return;
    }
snapshot.forEach((doc) => {
document.getElementById("totalIncome").textContent = "₹" + income;
document.getElementById("totalExpense").textContent = "₹" + expense;
document.getElementById("totalDonation").textContent = "₹" + donation;
document.getElementById("currentBalance").textContent =
    "₹" + (income + donation - expense);

}
    const data = doc.data();

    if (data.type === "Income" || data.type === "Membership") {
        income += Number(data.amount);
    } else if (data.type === "Expense") {
        expense += Number(data.amount);
    } else if (data.type === "Donation") {
        donation += Number(data.amount);
    }

    container.innerHTML += `
    <div class="transaction-card">
        <h3>${data.type}</h3>
        <p><b>Date:</b> ${data.date}</p>
        <p><b>Amount:</b> ₹${data.amount}</p>
        <p><b>Description:</b> ${data.description}</p>
        <p><b>Payment:</b> ${data.paymentMode || "-"}</p>
        <p><b>Receipt:</b> ${data.receiptNumber || "-"}</p>
    </div>`;
});
    

// First Load
loadTransactions();
