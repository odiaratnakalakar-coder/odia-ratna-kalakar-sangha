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

async function loadTransactions() {

    const tbody = document.getElementById("transactionBody");

    tbody.innerHTML = "";

    const q = query(accountsRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    let income = 0;
    let expense = 0;
    let donation = 0;

    snapshot.forEach((doc) => {

        const data = doc.data();

        if (data.type === "Income" || data.type === "Membership") {
            income += Number(data.amount);
        } else if (data.type === "Expense") {
            expense += Number(data.amount);
        } else if (data.type === "Donation") {
            donation += Number(data.amount);
        }

        tbody.innerHTML += `
        <tr>
            <td>${data.date}</td>
            <td>${data.type}</td>
            <td>${data.description}</td>
            <td>₹${data.amount}</td>
            <td>${data.paymentMode || "-"}</td>
            <td>${data.receiptNumber || "-"}</td>
            <td>
                <button>Edit</button>
                <button>Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("totalIncome").textContent = "₹" + income;
    document.getElementById("totalExpense").textContent = "₹" + expense;
    document.getElementById("totalDonation").textContent = "₹" + donation;
    document.getElementById("currentBalance").textContent =
        "₹" + (income + donation - expense);
}

// First Load
loadTransactions();
